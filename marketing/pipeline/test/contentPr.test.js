import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openContentPr, splitCommitMessage, buildPrBody } from '../src/contentPr.js';

// Fake GitHub: routes keyed by `${METHOD} ${pathname}`; records every call.
function fakeGitHub(routes) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url);
    const method = init.method ?? 'GET';
    calls.push({ method, path: u.pathname, query: u.search, body: init.body ? JSON.parse(init.body) : null });
    const hit = routes[`${method} ${u.pathname}`];
    if (hit === undefined) return { ok: false, status: 404, json: async () => ({ message: 'Not Found' }) };
    if (typeof hit === 'number') return { ok: false, status: hit, json: async () => ({ message: 'nope' }) };
    return { ok: true, status: hit.status ?? 200, json: async () => hit.data ?? hit };
  };
  return { fetchImpl, calls };
}

const ENV = {
  GITHUB_REPOSITORY: 'o/r',
  GITHUB_TOKEN: 't',
  GITHUB_API_URL: 'https://gh.test',
  HEAD_BRANCH: 'content/2026-thing',
  PUSHER: 'someone',
  MARKETING_APPROVERS: 'cody, delegate',
};
const MESSAGE = 'content: the thing\n\nBody line one.\nBody line two.\n';

test('opens the PR with the commit subject as title and body + footer as description, then requests approvers', async () => {
  const gh = fakeGitHub({
    'GET /repos/o/r/pulls': [],
    'POST /repos/o/r/pulls': { status: 201, data: { number: 42, html_url: 'https://gh.test/o/r/pull/42' } },
    'POST /repos/o/r/pulls/42/requested_reviewers': { status: 201, data: {} },
  });
  const r = await openContentPr({ env: ENV, commitMessage: MESSAGE, fetchImpl: gh.fetchImpl });
  assert.equal(r.status, 'created');
  assert.equal(r.number, 42);
  assert.equal(r.reviewRequest, 'requested');

  const lookup = gh.calls[0];
  assert.equal(lookup.method, 'GET');
  assert.match(lookup.query, /head=o%3Acontent%2F2026-thing/);
  assert.match(lookup.query, /state=open/);

  const create = gh.calls[1];
  assert.equal(create.body.title, 'content: the thing');
  assert.equal(create.body.head, 'content/2026-thing');
  assert.equal(create.body.base, 'primary');
  assert.ok(create.body.body.startsWith('Body line one.\nBody line two.'));
  assert.match(create.body.body, /push of `content\/2026-thing` by @someone/);
  assert.match(create.body.body, /approving this PR is the publish gate/);
  assert.match(create.body.body, /- \[ \] calendar slot acceptable/);

  assert.deepEqual(gh.calls[2].body, { reviewers: ['cody', 'delegate'] });
});

test('a branch that already has an open PR is left alone — no create, no review request', async () => {
  const gh = fakeGitHub({
    'GET /repos/o/r/pulls': [{ number: 7, html_url: 'https://gh.test/o/r/pull/7' }],
  });
  const r = await openContentPr({ env: ENV, commitMessage: MESSAGE, fetchImpl: gh.fetchImpl });
  assert.equal(r.status, 'exists');
  assert.equal(r.number, 7);
  assert.equal(gh.calls.length, 1);
});

test('a failed review request is reported, not fatal; no approvers means CODEOWNERS only', async () => {
  const gh = fakeGitHub({
    'GET /repos/o/r/pulls': [],
    'POST /repos/o/r/pulls': { status: 201, data: { number: 8, html_url: 'u' } },
    'POST /repos/o/r/pulls/8/requested_reviewers': 422,
  });
  const r1 = await openContentPr({ env: ENV, commitMessage: MESSAGE, fetchImpl: gh.fetchImpl });
  assert.equal(r1.status, 'created');
  assert.equal(r1.reviewRequest, 'failed (HTTP 422)');

  const gh2 = fakeGitHub({
    'GET /repos/o/r/pulls': [],
    'POST /repos/o/r/pulls': { status: 201, data: { number: 9, html_url: 'u' } },
  });
  const r2 = await openContentPr({ env: { ...ENV, MARKETING_APPROVERS: '' }, commitMessage: MESSAGE, fetchImpl: gh2.fetchImpl });
  assert.equal(r2.reviewRequest, 'not-requested');
  assert.equal(gh2.calls.length, 2);
});

test('refuses to run for a non-content branch or without credentials; a create failure throws', async () => {
  await assert.rejects(
    openContentPr({ env: { ...ENV, HEAD_BRANCH: 'main' }, commitMessage: MESSAGE, fetchImpl: async () => { throw new Error('must not be called'); } }),
    /content\/\*\* branch/,
  );
  await assert.rejects(
    openContentPr({ env: { ...ENV, GITHUB_TOKEN: '' }, commitMessage: MESSAGE, fetchImpl: async () => { throw new Error('must not be called'); } }),
    /GITHUB_TOKEN/,
  );
  const gh = fakeGitHub({ 'GET /repos/o/r/pulls': [], 'POST /repos/o/r/pulls': 403 });
  await assert.rejects(openContentPr({ env: ENV, commitMessage: MESSAGE, fetchImpl: gh.fetchImpl }), /HTTP 403/);
});

test('an empty commit message falls back to a branch-named title; CRLF bodies are normalized', () => {
  assert.deepEqual(splitCommitMessage(''), { subject: '', body: '' });
  assert.deepEqual(splitCommitMessage('subj\r\n\r\nline\r\n'), { subject: 'subj', body: 'line' });
  const body = buildPrBody({ body: '', headBranch: 'content/x', pusher: 'p' });
  assert.ok(body.startsWith('---'));
});
