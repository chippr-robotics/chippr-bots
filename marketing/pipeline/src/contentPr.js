import { redact } from './reading.js';

// Opens the pull request for a `content/**` branch AS github-actions[bot]
// (PLAN.md §2.5 step 1). This is the machine identity behind every content PR:
// the PR author must never be the human who approves it, and a session or
// Routine pushes as the account that runs it. Runs inside the
// marketing-content-pr workflow with GITHUB_TOKEN (contents: read,
// pull-requests: write) — it can open and describe a PR and nothing else.
//
// Idempotent: a branch with an open PR is left alone (the push already updated
// it). Title = head commit subject, body = head commit body + a fixed footer
// naming the pusher, the gate and the reviewer's checklist. Requesting the
// approvers is best-effort and REPORTED (CODEOWNERS auto-request is the
// primary path); a PR that exists without a review request is a visible,
// recoverable state, not a failure.

export const REVIEW_CHECKLIST = [
  '`blog.md` reads right, or is verbatim from the pinned `provenance` (pre-approved batch)',
  'social copy within caps incl. the link: X ≤ 280, Bluesky ≤ 300, Mastodon ≤ 500',
  'calendar slot acceptable',
];

export function splitCommitMessage(message) {
  const lines = String(message ?? '').replace(/\r\n/g, '\n').split('\n');
  const subject = (lines[0] ?? '').trim();
  const body = lines.slice(1).join('\n').trim();
  return { subject, body };
}

export function buildPrBody({ body, headBranch, pusher }) {
  const footer = [
    '---',
    `Opened by \`marketing-content-pr\` from a push of \`${headBranch}\` by @${pusher}. The author is GitHub's own bot so that a CODEOWNER can approve it (constitution I): **approving this PR is the publish gate** — after merge the publisher verifies the APPROVED review from \`MARKETING_APPROVERS\` on the PR that last touched each item's \`meta.json\` before anything reaches a channel.`,
    '',
    'Review checklist:',
    ...REVIEW_CHECKLIST.map((c) => `- [ ] ${c}`),
  ].join('\n');
  return body ? `${body}\n\n${footer}` : footer;
}

export async function openContentPr({ env, commitMessage, fetchImpl = fetch, log = () => {} }) {
  const repo = env.GITHUB_REPOSITORY;
  const token = env.GITHUB_TOKEN;
  const headBranch = env.HEAD_BRANCH;
  const baseBranch = env.BASE_BRANCH || 'primary';
  const pusher = env.PUSHER || 'unknown';
  const apiBase = (env.GITHUB_API_URL ?? 'https://api.github.com').replace(/\/$/, '');
  const approvers = String(env.MARKETING_APPROVERS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!repo || !token) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');
  if (!headBranch || !headBranch.startsWith('content/')) {
    throw new Error(`HEAD_BRANCH must be a content/** branch, got ${JSON.stringify(headBranch)}`);
  }
  const owner = repo.split('/')[0];

  const headers = {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'content-type': 'application/json',
    'user-agent': 'chippr-marketing-content-pr',
  };
  const call = async (method, path, payload) => {
    const res = await fetchImpl(`${apiBase}${path}`, {
      method,
      headers,
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  };

  const existing = await call(
    'GET',
    `/repos/${repo}/pulls?head=${encodeURIComponent(`${owner}:${headBranch}`)}&base=${encodeURIComponent(baseBranch)}&state=open&per_page=1`,
  );
  if (!existing.ok) throw new Error(`GitHub pulls lookup: HTTP ${existing.status}`);
  if (Array.isArray(existing.data) && existing.data.length > 0) {
    const pr = existing.data[0];
    log(`open PR already exists: #${pr.number} ${pr.html_url ?? ''}`);
    return { status: 'exists', number: pr.number, url: pr.html_url ?? null, reviewRequest: 'skipped' };
  }

  const { subject, body } = splitCommitMessage(commitMessage);
  const title = subject || `content: ${headBranch}`;
  const created = await call('POST', `/repos/${repo}/pulls`, {
    title,
    head: headBranch,
    base: baseBranch,
    body: buildPrBody({ body, headBranch, pusher }),
    maintainer_can_modify: true,
  });
  if (!created.ok) {
    const msg = created.data?.message ?? '';
    throw new Error(`GitHub create PR: HTTP ${created.status} ${redact(msg)}`.trim());
  }
  const number = created.data.number;
  const url = created.data.html_url ?? null;
  log(`opened PR #${number} ${url ?? ''}`);

  let reviewRequest = 'not-requested';
  if (approvers.length > 0) {
    const req = await call('POST', `/repos/${repo}/pulls/${number}/requested_reviewers`, { reviewers: approvers });
    reviewRequest = req.ok ? 'requested' : `failed (HTTP ${req.status})`;
    log(`review request for [${approvers.join(', ')}]: ${reviewRequest}`);
  } else {
    log('MARKETING_APPROVERS unset — relying on CODEOWNERS auto-request');
  }

  return { status: 'created', number, url, reviewRequest };
}
