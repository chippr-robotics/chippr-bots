import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, unlink, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tick } from '@chippr-bots/marketing-pipeline';
import { startMockPlatforms } from './mockPlatforms.js';

// End-to-end against the REAL content tree and catalogue, with all three
// platform APIs mocked locally. This is the mock-e2e leg of "verified e2e":
// the same code paths a live tick runs, minus real credentials.

const marketingDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOW = new Date('2026-09-16T12:00:00Z'); // after the pilot's publishAt

let mock;
let receiptsDir;

before(async () => {
  mock = await startMockPlatforms();
  receiptsDir = await mkdtemp(join(tmpdir(), 'mkt-receipts-'));
});

after(async () => {
  await mock.close();
  await rm(receiptsDir, { recursive: true, force: true });
});

test('dry-run performs no external calls and writes nothing', async () => {
  const report = await tick({
    now: NOW,
    marketingDir,
    receiptsDir,
    env: mock.env,
    dryRun: true,
  });
  assert.equal(report.ok, true);
  assert.equal(mock.requests.length, 0, 'dry-run must not touch the network');
  const dry = report.actions.filter((a) => a.status === 'dry-run');
  assert.ok(dry.length >= 3, `expected wp+mastodon+bluesky dry-run actions, got ${JSON.stringify(report.actions)}`);
  await assert.rejects(readFile(join(receiptsDir, 'receipts', '2026/passkey-smart-accounts', 'wordpress.json')));
});

test('live tick publishes wordpress first, then socials with the post URL; linkedin is delegated', async () => {
  const report = await tick({
    now: NOW,
    marketingDir,
    receiptsDir,
    env: mock.env,
    dryRun: false,
  });
  assert.equal(report.ok, true, JSON.stringify(report.problems));

  const item = '2026/passkey-smart-accounts';
  const wp = JSON.parse(await readFile(join(receiptsDir, 'receipts', item, 'wordpress.json'), 'utf8'));
  assert.equal(wp.status, 'ok');
  assert.match(wp.receipt.url, /passkey-smart-accounts/);

  const masto = JSON.parse(await readFile(join(receiptsDir, 'receipts', item, 'mastodon.json'), 'utf8'));
  assert.equal(masto.status, 'ok');
  const bsky = JSON.parse(await readFile(join(receiptsDir, 'receipts', item, 'bluesky.json'), 'utf8'));
  assert.equal(bsky.status, 'ok');
  assert.match(bsky.receipt.url, /bsky.app\/profile\/chipprbots.com\/post\//);

  const li = JSON.parse(await readFile(join(receiptsDir, 'receipts', item, 'linkedin.json'), 'utf8'));
  assert.equal(li.status, 'delegated');
  assert.equal(li.via, 'wordpress');

  // the mastodon status text carries the real WP URL, not the placeholder
  assert.ok(mock.state.mastoStatuses[0].content.includes(`${mock.env.WP_BASE_URL}/passkey-smart-accounts/`));
  assert.ok(!mock.state.mastoStatuses[0].content.includes('<link>'));

  // exactly one create per platform
  assert.equal(mock.countOf('/wp-json/wp/v2/posts'), 1);
  assert.equal(mock.countOf('/api/v1/statuses'), 1);
  assert.equal(mock.countOf('/xrpc/com.atproto.repo.createRecord'), 1);
});

test('second tick is a no-op: receipts are the idempotency mechanism', async () => {
  const report = await tick({
    now: NOW,
    marketingDir,
    receiptsDir,
    env: mock.env,
    dryRun: false,
  });
  assert.equal(report.ok, true);
  assert.ok(report.actions.every((a) => a.status === 'skipped'), JSON.stringify(report.actions));
  assert.equal(mock.countOf('/wp-json/wp/v2/posts'), 1, 'no double-post');
  assert.equal(mock.countOf('/api/v1/statuses'), 1);
  assert.equal(mock.countOf('/xrpc/com.atproto.repo.createRecord'), 1);
});

test('crash window: a stale claim is verified via the platform API, never blindly re-posted', async () => {
  const item = '2026/passkey-smart-accounts';
  // simulate a run that died after posting to bluesky but before the receipt
  await unlink(join(receiptsDir, 'receipts', item, 'bluesky.json'));
  await mkdir(join(receiptsDir, 'claims', item), { recursive: true });
  await writeFile(
    join(receiptsDir, 'claims', item, 'bluesky.json'),
    JSON.stringify({ at: NOW.toISOString(), payloadHint: 'test' }),
  );

  const createsBefore = mock.countOf('/xrpc/com.atproto.repo.createRecord');
  const report = await tick({
    now: NOW,
    marketingDir,
    receiptsDir,
    env: mock.env,
    dryRun: false,
  });
  assert.equal(report.ok, true, JSON.stringify(report.problems));
  assert.equal(
    mock.countOf('/xrpc/com.atproto.repo.createRecord'),
    createsBefore,
    'claim verification must find the existing record instead of re-posting',
  );
  const bsky = JSON.parse(await readFile(join(receiptsDir, 'receipts', item, 'bluesky.json'), 'utf8'));
  assert.equal(bsky.status, 'ok');
  assert.equal(bsky.via, 'claim-verification');
});
