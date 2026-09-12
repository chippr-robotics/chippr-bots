import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyApproval } from '../src/approval.js';

// Fake GitHub: route table keyed by path (query stripped).
function fakeGitHub(routes) {
  const calls = [];
  const fetchImpl = async (url) => {
    const u = new URL(url);
    calls.push(u.pathname + u.search);
    const hit = routes[u.pathname];
    if (hit === undefined) return { ok: false, status: 404, json: async () => ({}) };
    if (typeof hit === 'number') return { ok: false, status: hit, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => hit };
  };
  return { fetchImpl, calls };
}

const ENV = {
  GITHUB_REPOSITORY: 'o/r',
  GITHUB_TOKEN: 't',
  GITHUB_API_URL: 'https://gh.test',
  MARKETING_APPROVERS: 'Cody, other',
};
const item = { rel: '2026/x', meta: { review: { preApproved: true, batch: 'b' }, provenance: { commit: 'c' } } };

test('discovers the PR that last touched meta.json and requires an allowlisted approval', async () => {
  const gh = fakeGitHub({
    '/repos/o/r/commits': [{ sha: 'deadbeef' }],
    '/repos/o/r/commits/deadbeef/pulls': [{ number: 5, merged_at: 'x' }],
    '/repos/o/r/pulls/5': { merged_at: 'x' },
    '/repos/o/r/pulls/5/reviews': [{ state: 'APPROVED', user: { login: 'cody' } }],
  });
  const r = await verifyApproval(item, { env: ENV, fetchImpl: gh.fetchImpl });
  assert.equal(r.approved, true);
  assert.match(gh.calls[0], /path=marketing%2Fcontent%2F2026%2Fx%2Fmeta.json/);
});

test('a commit that reached primary without a merged PR is refused', async () => {
  const gh = fakeGitHub({
    '/repos/o/r/commits': [{ sha: 'deadbeef' }],
    '/repos/o/r/commits/deadbeef/pulls': [],
  });
  const r = await verifyApproval(item, { env: ENV, fetchImpl: gh.fetchImpl });
  assert.equal(r.approved, false);
  assert.equal(r.unverifiable, undefined);
  assert.match(r.reason, /without a merged PR/);
});

test('an approval from outside the allowlist does not count', async () => {
  const gh = fakeGitHub({
    '/repos/o/r/commits': [{ sha: 'deadbeef' }],
    '/repos/o/r/commits/deadbeef/pulls': [{ number: 5, merged_at: 'x' }],
    '/repos/o/r/pulls/5': { merged_at: 'x' },
    '/repos/o/r/pulls/5/reviews': [{ state: 'APPROVED', user: { login: 'the-bot' } }],
  });
  const r = await verifyApproval(item, { env: ENV, fetchImpl: gh.fetchImpl });
  assert.equal(r.approved, false);
  assert.match(r.reason, /no APPROVED review/);
});

test('a GitHub 5xx is unverifiable (skip), a 404 is a definite refusal', async () => {
  const down = fakeGitHub({ '/repos/o/r/commits': 503 });
  const r1 = await verifyApproval(item, { env: ENV, fetchImpl: down.fetchImpl });
  assert.equal(r1.approved, false);
  assert.equal(r1.unverifiable, true);

  const missing = fakeGitHub({});
  const r2 = await verifyApproval(item, { env: ENV, fetchImpl: missing.fetchImpl });
  assert.equal(r2.approved, false);
  assert.equal(r2.unverifiable, false);
});

test('meta.json review.pr is a hint verified the same way, not a shortcut', async () => {
  const hinted = { rel: '2026/x', meta: { review: { pr: 9 }, provenance: { commit: 'c' } } };
  const gh = fakeGitHub({
    '/repos/o/r/pulls/9': { merged_at: null },
  });
  const r = await verifyApproval(hinted, { env: ENV, fetchImpl: gh.fetchImpl });
  assert.equal(r.approved, false);
  assert.match(r.reason, /not merged/);
});

test('no credentials is unverifiable; empty allowlist is a refusal', async () => {
  const r1 = await verifyApproval(item, { env: {}, fetchImpl: async () => { throw new Error('must not be called'); } });
  assert.equal(r1.unverifiable, true);
  const r2 = await verifyApproval(item, { env: { ...ENV, MARKETING_APPROVERS: '' }, fetchImpl: async () => { throw new Error('must not be called'); } });
  assert.equal(r2.approved, false);
  assert.match(r2.reason, /allowlist is empty/);
});
