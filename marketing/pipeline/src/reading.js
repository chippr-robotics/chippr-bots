// Honest-state envelope (constitution III, after FairWins spec 089):
// a publish/read outcome is one of four shapes, and only `ok` carries a receipt,
// so "success because we didn't notice the failure" has no code path.

export const OK = 'ok';
export const DELEGATED = 'delegated';
export const NOT_CONFIGURED = 'not-configured';
export const UNREADABLE = 'unreadable';
export const FAILED = 'failed';

export function ok(receipt) {
  if (receipt == null || typeof receipt !== 'object') {
    throw new TypeError('ok() requires a receipt object');
  }
  return { status: OK, receipt };
}

export function delegated(via, detail) {
  return { status: DELEGATED, via, detail: String(detail ?? '') };
}

export function notConfigured(reason) {
  return { status: NOT_CONFIGURED, reason: String(reason) };
}

// Configured but the outcome could not be established (network error, 5xx,
// ambiguous verification). NOT a failure to publish and NOT a success —
// the next tick re-verifies before any retry.
export function unreadable(reason) {
  return { status: UNREADABLE, reason: redact(String(reason)) };
}

// Configured, attempted, and definitively failed (4xx, validation).
export function failed(reason) {
  return { status: FAILED, reason: redact(String(reason)) };
}

// Strip anything credential-shaped before a reason can reach a log or receipt.
export function redact(text) {
  return String(text)
    .replace(/(authorization|bearer|basic)\s+\S+/gi, '$1 [redacted]')
    .replace(/[A-Za-z0-9+/=_-]{40,}/g, '[redacted]');
}
