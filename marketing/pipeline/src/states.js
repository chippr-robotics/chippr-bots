// Item state machine (PLAN.md 2.1.3). Item-level state lives in meta.json and
// is changed only by reviewed commits on primary; `published` is DERIVED from
// receipts, never written back (the publisher has no write path to primary).

export const STATES = Object.freeze([
  'idea',
  'brief',
  'drafted',
  'designed',
  'in-review',
  'approved',
  'parked',
  'rejected',
  'retracted',
]);

// Legal transitions for CI gating of content PRs (a PR that moves an item
// along an illegal edge fails marketing-gates).
export const TRANSITIONS = Object.freeze({
  'idea': ['brief', 'parked', 'rejected'],
  'brief': ['drafted', 'parked', 'rejected'],
  'drafted': ['designed', 'in-review', 'parked', 'rejected'],
  'designed': ['in-review', 'parked', 'rejected'],
  'in-review': ['approved', 'drafted', 'parked', 'rejected'],
  'approved': ['in-review', 'parked', 'retracted'],
  'parked': ['idea', 'brief', 'drafted', 'designed', 'in-review'],
  'rejected': [],
  'retracted': [],
});

export function isState(s) {
  return STATES.includes(s);
}

export function isLegalTransition(from, to) {
  if (from === to) return true;
  return (TRANSITIONS[from] ?? []).includes(to);
}

// Effective (derived) status for reporting: an approved item with a primary
// -channel receipt is published; receipts never rewrite meta.json.
export function effectiveState(meta, receipts) {
  if (meta.state === 'approved' && receipts?.wordpress?.status === 'ok') {
    return 'published';
  }
  return meta.state;
}
