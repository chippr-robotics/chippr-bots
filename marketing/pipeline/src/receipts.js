import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// Receipts and claims live OUTSIDE primary (the `receipts` ref, checked out
// to a working dir by the publish workflow) so no branch-protection bypass
// actor is ever needed on the gated branch (PLAN.md 2.3).
//
// Layout under receiptsDir:
//   receipts/<year>/<slug>/<platform>.json   -- completion record
//   claims/<year>/<slug>/<platform>.json     -- two-phase marker written
//                                               BEFORE the external call
//
// The receipt check before each platform call IS the idempotency mechanism;
// a leftover claim means "verify via the platform API before any retry".

async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2) + '\n');
  await rename(tmp, path);
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

export function receiptStore(receiptsDir) {
  const receiptPath = (item, platform) => join(receiptsDir, 'receipts', item, `${platform}.json`);
  const claimPath = (item, platform) => join(receiptsDir, 'claims', item, `${platform}.json`);
  return {
    getReceipt: (item, platform) => readJson(receiptPath(item, platform)),
    putReceipt: (item, platform, record) =>
      writeJsonAtomic(receiptPath(item, platform), record),
    getClaim: (item, platform) => readJson(claimPath(item, platform)),
    putClaim: (item, platform, record) => writeJsonAtomic(claimPath(item, platform), record),
    async allReceipts(item, platforms) {
      const out = {};
      for (const p of platforms) out[p] = await readJson(receiptPath(item, p));
      return out;
    },
  };
}
