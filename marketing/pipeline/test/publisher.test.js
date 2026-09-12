import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tick } from '../src/publisher.js';

// Publisher behavior tests against a synthetic marketing dir + stub adapters.

async function makeFixture({ state = 'approved', review = { preApproved: true, batch: 'b' }, provenance = { repo: 'r', path: 'p', commit: 'c' } } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'mkt-fixture-'));
  await writeFile(join(dir, 'catalogue.json'), JSON.stringify({
    platforms: [
      { id: 'wordpress', kind: 'adapter', adapter: 'adapters/wordpress', credentialEnv: ['WP_APP_PASSWORD'], enabled: true },
      { id: 'mastodon', kind: 'adapter', adapter: 'adapters/mastodon', copySections: ['mastodon', 'x'], formats: { maxChars: 500 }, credentialEnv: ['MASTODON_TOKEN'], enabled: true },
    ],
  }));
  const itemDir = join(dir, 'content', '2026', 'test-post');
  await mkdir(itemDir, { recursive: true });
  await writeFile(join(dir, 'content', 'calendar.json'), JSON.stringify([
    { item: '2026/test-post', publishAt: '2026-01-01T00:00:00Z' },
  ]));
  const meta = { slug: 'test-post', state, platforms: ['wordpress', 'mastodon'], review, provenance };
  await writeFile(join(itemDir, 'meta.json'), JSON.stringify(meta));
  await writeFile(join(itemDir, 'blog.md'), '# Test Post\n\n*sub*\n\nBody.\n');
  await writeFile(join(itemDir, 'social.md'), '## X (Twitter)\n\nX copy <link>\n');
  return dir;
}

const NOW = new Date('2026-01-02T00:00:00Z');

function stubAdapters(overrides = {}) {
  const calls = [];
  const loader = async (row) => ({
    isConfigured: () => ({ configured: true, missing: [] }),
    publish: async ({ payload }) => {
      calls.push({ platform: row.id, payload });
      return { status: 'ok', receipt: { url: `https://x/${row.id}/test-post/` } };
    },
    verifyPublished: async () => ({ absent: true }),
    ...overrides[row.id],
  });
  return { loader, calls };
}

test('a due item that is not approved records a missed slot and publishes nothing', async () => {
  const dir = await makeFixture({ state: 'in-review', review: undefined });
  const { loader, calls } = stubAdapters();
  const report = await tick({ now: NOW, marketingDir: dir, receiptsDir: join(dir, 'r'), env: {}, dryRun: false, adapterLoader: loader });
  assert.equal(calls.length, 0);
  assert.equal(report.missedSlots.length, 1);
  assert.equal(report.ok, true);
  await rm(dir, { recursive: true, force: true });
});

test('approval fail-closed: pre-approved without provenance publishes nothing and is a problem', async () => {
  const dir = await makeFixture({ provenance: null });
  const { loader, calls } = stubAdapters();
  const report = await tick({ now: NOW, marketingDir: dir, receiptsDir: join(dir, 'r'), env: {}, dryRun: false, adapterLoader: loader });
  assert.equal(calls.length, 0);
  assert.equal(report.ok, false);
  assert.match(report.problems[0].reason, /provenance/);
  await rm(dir, { recursive: true, force: true });
});

test('PR-reviewed approval with no GitHub credentials is unverifiable, not a pass', async () => {
  const dir = await makeFixture({ review: { pr: 7 } });
  const { loader, calls } = stubAdapters();
  const report = await tick({ now: NOW, marketingDir: dir, receiptsDir: join(dir, 'r'), env: {}, dryRun: false, adapterLoader: loader });
  assert.equal(calls.length, 0);
  assert.equal(report.ok, false);
  assert.equal(report.problems[0].status, 'unreadable');
  await rm(dir, { recursive: true, force: true });
});

test('an unconfigured platform is not-configured, not a failure; wordpress url feeds mastodon', async () => {
  const dir = await makeFixture();
  const { loader, calls } = stubAdapters({
    mastodon: { isConfigured: () => ({ configured: false, missing: ['MASTODON_TOKEN'] }) },
  });
  const report = await tick({ now: NOW, marketingDir: dir, receiptsDir: join(dir, 'r'), env: {}, dryRun: false, adapterLoader: loader });
  assert.equal(report.ok, true);
  assert.equal(calls.length, 1); // wordpress only
  const masto = report.actions.find((a) => a.platform === 'mastodon');
  assert.equal(masto.status, 'not-configured');

  // re-run with mastodon configured: wp is skipped (receipt), mastodon gets the URL
  const stub2 = stubAdapters();
  const report2 = await tick({ now: NOW, marketingDir: dir, receiptsDir: join(dir, 'r'), env: {}, dryRun: false, adapterLoader: stub2.loader });
  assert.equal(report2.ok, true);
  assert.equal(stub2.calls.length, 1);
  assert.equal(stub2.calls[0].platform, 'mastodon');
  assert.match(stub2.calls[0].payload.text, /https:\/\/x\/wordpress\/test-post\//);
  await rm(dir, { recursive: true, force: true });
});
