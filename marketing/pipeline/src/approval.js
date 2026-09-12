import { redact } from './reading.js';

// Constitution I: the publisher independently verifies the human approval
// artifact before anything reaches a channel — belt and braces on top of the
// branch ruleset. Fail-closed: unverifiable is a skip, never a pass.
//
// The trust root is NOT anything meta.json says about itself (a content PR
// could self-declare approval). It is the PR that last changed the item's
// meta.json on primary: that PR must be MERGED and carry an APPROVED review
// from the human allowlist (MARKETING_APPROVERS). meta.json's `review` block
// is documentation of what was reviewed — `preApproved` records that the
// body was reviewed before this system existed and pins provenance — but it
// never substitutes for the PR check.
//
// Lookup: GET /repos/{r}/commits?path=<meta.json>&sha=primary -> the last
// commit touching the file -> GET /repos/{r}/commits/{sha}/pulls -> the PR ->
// merged_at + reviews. `review.pr` in meta.json, if present, is a hint that
// short-circuits discovery but is verified the same way.

export async function verifyApproval(item, { env, fetchImpl = fetch, contentRelPath = null }) {
  const review = item.meta.review ?? {};

  if (review.preApproved === true && !item.meta.provenance?.commit) {
    return { approved: false, reason: 'pre-approved item without pinned provenance' };
  }

  const repo = env.GITHUB_REPOSITORY;
  const token = env.GITHUB_TOKEN;
  const apiBase = (env.GITHUB_API_URL ?? 'https://api.github.com').replace(/\/$/, '');
  const allowlist = String(env.MARKETING_APPROVERS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!repo || !token) {
    return { approved: false, unverifiable: true, reason: 'no GitHub credentials to verify the approving review' };
  }
  if (allowlist.length === 0) {
    return { approved: false, reason: 'MARKETING_APPROVERS allowlist is empty — nothing can verify as approved' };
  }

  const headers = {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'user-agent': 'chippr-marketing-publisher',
  };
  const get = async (path) => {
    const res = await fetchImpl(`${apiBase}${path}`, { headers });
    if (!res.ok) {
      const err = new Error(`GitHub ${path.split('?')[0]}: HTTP ${res.status}`);
      err.unverifiable = res.status >= 500 || res.status === 429;
      throw err;
    }
    return res.json();
  };

  try {
    let prNumber = Number.isInteger(review.pr) ? review.pr : null;
    if (prNumber === null) {
      const metaPath = contentRelPath ?? `marketing/content/${item.rel ?? ''}/meta.json`;
      const commits = await get(`/repos/${repo}/commits?path=${encodeURIComponent(metaPath)}&sha=primary&per_page=1`);
      if (!Array.isArray(commits) || commits.length === 0) {
        return { approved: false, reason: `no commit on primary touches ${metaPath}` };
      }
      const pulls = await get(`/repos/${repo}/commits/${commits[0].sha}/pulls`);
      const merged = (Array.isArray(pulls) ? pulls : []).find((p) => p.merged_at);
      if (!merged) {
        return { approved: false, reason: `commit ${commits[0].sha.slice(0, 7)} touching ${metaPath} reached primary without a merged PR` };
      }
      prNumber = merged.number;
    }

    const pr = await get(`/repos/${repo}/pulls/${prNumber}`);
    if (!pr.merged_at) return { approved: false, reason: `PR #${prNumber} is not merged` };

    const reviews = await get(`/repos/${repo}/pulls/${prNumber}/reviews?per_page=100`);
    const approver = (Array.isArray(reviews) ? reviews : []).find(
      (r) => r.state === 'APPROVED' && allowlist.includes(String(r.user?.login ?? '').toLowerCase()),
    );
    if (!approver) {
      return { approved: false, reason: `PR #${prNumber} has no APPROVED review from [${allowlist.join(', ')}]` };
    }
    return { approved: true, basis: `PR #${prNumber} approved by ${approver.user.login}` };
  } catch (e) {
    return { approved: false, unverifiable: e.unverifiable !== false, reason: redact(e.message) };
  }
}
