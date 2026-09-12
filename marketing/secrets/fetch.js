#!/usr/bin/env node
// Deliver a secrets profile into a child process's environment and nothing
// else: `node secrets/fetch.js --profile publish -- node pipeline/bin/tick.js`
//
// Shells out to `gcloud secrets versions access` (no npm dependency — the
// spec-097/075 lockfile lesson). Payloads never touch disk, argv, or logs;
// a fetch failure names the container and the IAM binding it implies.

import { spawn, spawnSync } from 'node:child_process';
import { PROJECT_ID, secretsForProfile } from './registry.js';

function fail(msg) {
  console.error(`secrets/fetch: ${msg}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const sep = args.indexOf('--');
if (sep === -1) fail('usage: fetch.js --profile <p> -- <cmd> [args...]');
const opts = args.slice(0, sep);
const cmd = args.slice(sep + 1);
if (cmd.length === 0) fail('no command after --');
const pIdx = opts.indexOf('--profile');
if (pIdx === -1 || !opts[pIdx + 1]) fail('--profile is required');
const profile = opts[pIdx + 1];

const entries = secretsForProfile(profile);
const env = { ...process.env };

for (const entry of entries) {
  const res = spawnSync(
    'gcloud',
    ['secrets', 'versions', 'access', 'latest', `--secret=${entry.id}`, `--project=${PROJECT_ID}`],
    { encoding: 'buffer', maxBuffer: 1024 * 1024 },
  );
  if (res.status !== 0) {
    fail(
      `cannot access ${entry.id} (gcloud exit ${res.status}). ` +
        `The publisher identity needs roles/secretmanager.secretAccessor on that container.`,
    );
  }
  // Byte-exact delivery: never round-trip through a shell substitution
  // (which strips trailing newlines). Secret Manager payloads are stored
  // without a trailing newline by our own migration convention; deliver as-is.
  const payload = res.stdout.toString('utf8');
  for (const name of entry.env) env[name] = payload;
}

const child = spawn(cmd[0], cmd.slice(1), { env, stdio: 'inherit' });
child.on('exit', (code, signal) => {
  process.exit(signal ? 1 : (code ?? 1));
});
