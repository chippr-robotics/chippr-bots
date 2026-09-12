import { redact } from './reading.js';

// Constitution I: the publisher independently verifies the human approval
// artifact before anything reaches a channel — belt and braces on top of the
// branch ruleset. Fail-closed: unverifiable is a skip, never a pass.
//
// Two approval shapes (item.meta.review):
//   { preApproved: true, batch, approvedBy } -- the reviewed-before-this-
//     system-existed backlog (decision 2026-09-12). Provenance must pin the
//     source commit; any EDIT to the item re-enters review (enforced by the
//     content gate, not here).
//   { pr: <number> } -- the PR that introduced/last changed the item must be
//     merged and carry an APPROVED review from the human allowlist.

export async function verifyApproval(item, { env, fetchImpl = fetch }) {
  const review = item.meta.review ?? {};

  if (review.preApproved === true) {
    if (!item.meta.provenance?.commit) {
      return { approved: false, reason: 'pre-approved item without pinned provenance' };
    }
    return { approved: true, basis: `pre-approved batch "${review.batch}"` };
  }

  if (Number.isInteger(review.pr)) {
    const repo = env.GITHUB_REPOSITORY;
    const token = env.GITHUB_TOKEN;
    const allowlist = String(env.MARKETING_APPROVERS ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!repo || !token) {
      return { approved: false, unverifiable: true, reason: 'no GitHub credentials to verify the review' };
    }
    if (allowlist.length === 0) {
      return { approved: false, reason: 'MARKETING_APPROVERS allowlist is empty — nothing can verify as approved' };
    }
    try {
      const base = `https://api.github.com/repos/${repo}/pulls/${review.pr}`;
      const headers = {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'user-agent': 'chippr-marketing-publisher',
      };
      const prRes = await fetchImpl(base, { headers });
      if (!prRes.ok) {
        return { approved: false, unverifiable: prRes.status >= 500, reason: `PR fetch: HTTP ${prRes.status}` };
      }
      const pr = await prRes.json();
      if (!pr.merged_at) return { approved: false, reason: `PR #${review.pr} is not merged` };

      const revRes = await fetchImpl(`${base}/reviews?per_page=100`, { headers });
      if (!revRes.ok) {
        return { approved: false, unverifiable: revRes.status >= 500, reason: `reviews fetch: HTTP ${revRes.status}` };
      }
      const reviews = await revRes.json();
      const approver = reviews.find(
        (r) => r.state === 'APPROVED' && allowlist.includes(String(r.user?.login ?? '').toLowerCase()),
      );
      if (!approver) {
        return { approved: false, reason: `PR #${review.pr} has no APPROVED review from [${allowlist.join(', ')}]` };
      }
      return { approved: true, basis: `PR #${review.pr} approved by ${approver.user.login}` };
    } catch (e) {
      return { approved: false, unverifiable: true, reason: redact(e.message) };
    }
  }

  return { approved: false, reason: 'no recognizable review record' };
}
