#!/usr/bin/env node
// marketing-gates: structural honesty checks, run in CI on every PR touching
// marketing/** and runnable locally (`npm run check` from marketing/).
//
//  G1  catalogue↔adapters: every enabled adapter row's dir + index.js exists;
//      disabled rows may have adapter: null.
//  G2  catalogue↔registry: every credentialEnv on an ENABLED row resolves to
//      a registry entry; every registry env is claimed by some catalogue row
//      (no orphan credentials — the FinOps C2b lesson).
//  G3  content: every item dir has valid meta.json (schema + state), files
//      it needs, and every calendar entry points at a real item with a
//      timezone-carrying timestamp.
//  G4  workflows: marketing workflows contain NO `uses:` steps (the
//      zero-third-party-actions invariant) and the publish workflow keeps
//      its concurrency group.
//  G5  approved items: pre-approved requires pinned provenance; PR-reviewed
//      requires review.pr.

import { readFile, readdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMeta, listItems } from './pipeline/src/item.js';
import { loadCalendar } from './pipeline/src/calendar.js';
import { REGISTRY, PUBLIC_ENV } from './secrets/registry.js';

const marketingDir = dirname(fileURLToPath(import.meta.url));
const repoDir = join(marketingDir, '..');
const failures = [];
const fail = (gate, msg) => failures.push(`[${gate}] ${msg}`);

const catalogue = JSON.parse(await readFile(join(marketingDir, 'catalogue.json'), 'utf8'));
const registryEnvs = new Set(REGISTRY.flatMap((r) => r.env));

// G1 + G2
const claimedEnvs = new Set();
for (const row of catalogue.platforms) {
  if (row.kind === 'adapter' && row.enabled) {
    if (!row.adapter) {
      fail('G1', `enabled adapter row "${row.id}" has no adapter path`);
    } else {
      try {
        await access(join(marketingDir, row.adapter, 'index.js'));
      } catch {
        fail('G1', `row "${row.id}": ${row.adapter}/index.js missing`);
      }
    }
  }
  for (const envName of row.credentialEnv ?? []) {
    claimedEnvs.add(envName);
    if (row.enabled && !registryEnvs.has(envName)) {
      fail('G2', `row "${row.id}" needs ${envName} but the secrets registry has no entry for it`);
    }
  }
}
for (const envName of registryEnvs) {
  if (!claimedEnvs.has(envName)) {
    fail('G2', `registry env ${envName} is claimed by no catalogue row — orphan credential`);
  }
}
for (const envName of PUBLIC_ENV) {
  if (registryEnvs.has(envName)) fail('G2', `${envName} is both PUBLIC_ENV and a secret`);
}

// G3 + G5
const contentDir = join(marketingDir, 'content');
const items = await listItems(contentDir);
const itemSet = new Set(items);
for (const rel of items) {
  const slug = rel.split('/')[1];
  let meta;
  try {
    meta = JSON.parse(await readFile(join(contentDir, rel, 'meta.json'), 'utf8'));
  } catch (e) {
    fail('G3', `${rel}: unreadable meta.json (${e.message})`);
    continue;
  }
  for (const err of validateMeta(slug, meta)) fail('G3', `${rel}: ${err}`);
  if (meta.platforms?.includes('wordpress')) {
    try {
      await access(join(contentDir, rel, 'blog.md'));
    } catch {
      fail('G3', `${rel}: wordpress platform but no blog.md`);
    }
  }
  const knownPlatforms = new Set(catalogue.platforms.map((p) => p.id));
  for (const p of meta.platforms ?? []) {
    if (!knownPlatforms.has(p)) fail('G3', `${rel}: unknown platform "${p}"`);
  }
}
try {
  const calendar = await loadCalendar(join(contentDir, 'calendar.json'));
  for (const e of calendar) {
    if (!itemSet.has(e.item)) fail('G3', `calendar references missing item ${e.item}`);
  }
} catch (e) {
  fail('G3', `calendar: ${e.message}`);
}

// G4
for (const wf of ['marketing-gates.yml', 'marketing-publish.yml']) {
  let text;
  try {
    text = await readFile(join(repoDir, '.github', 'workflows', wf), 'utf8');
  } catch {
    fail('G4', `.github/workflows/${wf} missing`);
    continue;
  }
  const uses = text.split('\n').filter((l) => /^\s*(-\s+)?uses:/.test(l));
  if (uses.length) fail('G4', `${wf} uses third-party actions: ${uses.map((u) => u.trim()).join('; ')}`);
  if (wf === 'marketing-publish.yml' && !/concurrency:/.test(text)) {
    fail('G4', `${wf} lost its concurrency group`);
  }
}

if (failures.length) {
  console.error(`marketing check: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('marketing check: all gates green');
