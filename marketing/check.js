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
//      zero-third-party-actions invariant), the publish workflow keeps its
//      concurrency group, and the content-PR workflow stays `contents: read`
//      (it opens PRs as github-actions[bot]; it must never be able to merge).
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
for (const wf of ['marketing-gates.yml', 'marketing-publish.yml', 'marketing-content-pr.yml']) {
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
  if (wf === 'marketing-content-pr.yml') {
    if (!/^\s*contents:\s*read\s*$/m.test(text) || /^\s*contents:\s*write\s*$/m.test(text)) {
      fail('G4', `${wf} must declare contents: read — the PR opener can never be able to merge`);
    }
    if (/^\s*pull_request(_target)?:/m.test(text)) {
      fail('G4', `${wf} must trigger on push only — a pull_request trigger would run it on foreign PRs`);
    }
  }
}

// G6: the Terraform secret containers and the secrets registry must be the SAME list, in two
// halves: `secret_ids` (containers Terraform CREATES) == registry entries without `preExisting`,
// and `secret_accessor_secrets` (owner-managed containers Terraform only GRANTS) == entries with
// `preExisting: true`. A registry entry with no container fails at fetch time as NOT_FOUND; a
// container with no registry entry is a credential nothing declares — and a missing accessor grant
// surfaces later as PERMISSION_DENIED, which reads exactly like a broken login.
{
  const tfvarsPath = join(repoDir, 'infra', 'terraform', 'marketing', 'terraform.tfvars');
  let tfvars = null;
  try {
    tfvars = await readFile(tfvarsPath, 'utf8');
  } catch {
    fail('G6', `${tfvarsPath} missing — the registry has entries but no Terraform declares their containers`);
  }
  if (tfvars !== null) {
    const list = (key) => {
      const m = new RegExp(`(?:^|\\n)\\s*${key}\\s*=\\s*\\[([\\s\\S]*?)\\]`).exec(tfvars);
      return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]).sort() : [];
    };
    const created = list('secret_ids');
    const granted = list('secret_accessor_secrets');
    const regCreated = REGISTRY.filter((r) => r.preExisting !== true).map((r) => r.id).sort();
    const regGranted = REGISTRY.filter((r) => r.preExisting === true).map((r) => r.id).sort();
    if (JSON.stringify(created) !== JSON.stringify(regCreated)) {
      fail('G6', `terraform.tfvars secret_ids ${JSON.stringify(created)} != registry (created) ids ${JSON.stringify(regCreated)}`);
    }
    if (JSON.stringify(granted) !== JSON.stringify(regGranted)) {
      fail('G6', `terraform.tfvars secret_accessor_secrets ${JSON.stringify(granted)} != registry preExisting ids ${JSON.stringify(regGranted)}`);
    }
    for (const id of created) if (granted.includes(id)) fail('G6', `${id} is both created and pre-existing`);
  }
}

if (failures.length) {
  console.error(`marketing check: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('marketing check: all gates green');
