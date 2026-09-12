#!/usr/bin/env node
// Publisher tick CLI.
//   node pipeline/bin/tick.js [--live] [--now <ISO>] [--receipts-dir <dir>]
//
// DRY-RUN IS THE DEFAULT. --live requires MARKETING_LIVE=true in the
// environment as a second key — one flag alone can never publish.

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tick } from '../src/publisher.js';

const marketingDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
}

const wantLive = args.includes('--live');
const envLive = process.env.MARKETING_LIVE === 'true';
if (wantLive && !envLive) {
  console.error('tick: --live given but MARKETING_LIVE!=true — refusing (two keys required).');
  process.exit(1);
}
const dryRun = !(wantLive && envLive);

const nowArg = argValue('--now');
const now = nowArg ? new Date(nowArg) : new Date();
if (Number.isNaN(now.getTime())) {
  console.error(`tick: bad --now ${nowArg}`);
  process.exit(1);
}

const receiptsDir = resolve(argValue('--receipts-dir') ?? join(marketingDir, '..', '.marketing-receipts'));

const report = await tick({
  now,
  marketingDir,
  receiptsDir,
  env: process.env,
  dryRun,
  log: (line) => console.log(`[tick] ${line}`),
});

console.log(JSON.stringify({ ...report, receiptsDir }, null, 2));
if (!report.ok) {
  console.error(`tick: ${report.problems.length} problem(s) — see report`);
  process.exit(1);
}
