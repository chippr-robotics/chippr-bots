import { createHash } from 'node:crypto';
import * as reading from '@chippr-bots/marketing-pipeline/reading';

// Mastodon statuses adapter. At-time publishing (PLAN.md 1.4: one scheduling
// model, uniform receipts — scheduled_at deliberately unused). The
// Idempotency-Key header is Mastodon's own dedup rail; we derive it from the
// item+text so an accidental double POST inside the key's window dedupes
// server-side, on top of the claim/verify mechanism.

export function isConfigured(env) {
  const missing = ['MASTODON_BASE_URL', 'MASTODON_TOKEN'].filter((k) => !env[k]);
  return { configured: missing.length === 0, missing };
}

function idempotencyKey(item, text) {
  return createHash('sha256').update(`${item.meta.slug}\n${text}`).digest('hex');
}

export async function publish({ item, payload, env, fetchImpl = fetch }) {
  try {
    const base = env.MASTODON_BASE_URL.replace(/\/$/, '');
    const res = await fetchImpl(`${base}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.MASTODON_TOKEN}`,
        'content-type': 'application/json',
        'idempotency-key': idempotencyKey(item, payload.text),
      },
      body: JSON.stringify({ status: payload.text, visibility: 'public' }),
    });
    if (res.status >= 500) return reading.unreadable(`statuses HTTP ${res.status}`);
    if (!res.ok) return reading.failed(`statuses HTTP ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
    const status = await res.json();
    return reading.ok({ id: status.id, url: status.url });
  } catch (e) {
    return reading.unreadable(e.message);
  }
}

// Verify by matching recent statuses on the account against the exact text
// the claim recorded. The window is tiny (a claim is minutes old at most).
export async function verifyPublished({ item, env, fetchImpl = fetch }) {
  try {
    const base = env.MASTODON_BASE_URL.replace(/\/$/, '');
    const headers = { authorization: `Bearer ${env.MASTODON_TOKEN}` };
    const meRes = await fetchImpl(`${base}/api/v1/accounts/verify_credentials`, { headers });
    if (!meRes.ok) return { unreadable: `verify_credentials HTTP ${meRes.status}` };
    const me = await meRes.json();
    const stRes = await fetchImpl(`${base}/api/v1/accounts/${me.id}/statuses?limit=20&exclude_reblogs=true`, { headers });
    if (!stRes.ok) return { unreadable: `statuses HTTP ${stRes.status}` };
    const statuses = await stRes.json();
    // Status content comes back as HTML; match on the slug's post URL or the
    // first line of text, stripped of tags.
    // The social copy embeds the WP post URL, which ends with the item slug,
    // so slug presence in the rendered content identifies our status.
    const found = statuses.find((s) =>
      String(s.content ?? '').replace(/<[^>]+>/g, ' ').includes(item.meta.slug));
    if (found) return { found: { id: found.id, url: found.url } };
    return { absent: true };
  } catch (e) {
    return { unreadable: e.message };
  }
}
