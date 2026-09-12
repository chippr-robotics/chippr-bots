import * as reading from '@chippr-bots/marketing-pipeline/reading';

// Bluesky / AT Protocol adapter: app-password session against BSKY_SERVICE
// (default bsky.social — no self-hosted PDS, per PLAN.md 1.5), then
// com.atproto.repo.createRecord with an app.bsky.feed.post carrying link
// facets computed at BYTE offsets (facets index UTF-8 bytes, not characters).

export function isConfigured(env) {
  const missing = ['BSKY_IDENTIFIER', 'BSKY_APP_PASSWORD'].filter((k) => !env[k]);
  return { configured: missing.length === 0, missing };
}

function service(env) {
  return (env.BSKY_SERVICE ?? 'https://bsky.social').replace(/\/$/, '');
}

async function createSession(env, fetchImpl) {
  const res = await fetchImpl(`${service(env)}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: env.BSKY_IDENTIFIER, password: env.BSKY_APP_PASSWORD }),
  });
  if (!res.ok) throw Object.assign(new Error(`createSession HTTP ${res.status}`), { status: res.status });
  return res.json();
}

// Byte-offset link facets for every URL in the text.
export function linkFacets(text) {
  const enc = new TextEncoder();
  const facets = [];
  const re = /https?:\/\/[^\s)]+/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const byteStart = enc.encode(text.slice(0, m.index)).length;
    const byteEnd = byteStart + enc.encode(m[0]).length;
    facets.push({
      index: { byteStart, byteEnd },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: m[0] }],
    });
  }
  return facets;
}

export async function publish({ payload, env, fetchImpl = fetch }) {
  try {
    const session = await createSession(env, fetchImpl);
    const record = {
      $type: 'app.bsky.feed.post',
      text: payload.text,
      createdAt: new Date().toISOString(),
      facets: linkFacets(payload.text),
    };
    const res = await fetchImpl(`${service(env)}/xrpc/com.atproto.repo.createRecord`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${session.accessJwt}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ repo: session.did, collection: 'app.bsky.feed.post', record }),
    });
    if (res.status >= 500) return reading.unreadable(`createRecord HTTP ${res.status}`);
    if (!res.ok) return reading.failed(`createRecord HTTP ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
    const out = await res.json();
    const rkey = String(out.uri ?? '').split('/').pop();
    return reading.ok({
      uri: out.uri,
      cid: out.cid,
      url: `https://bsky.app/profile/${session.handle ?? session.did}/post/${rkey}`,
    });
  } catch (e) {
    if (e.status && e.status < 500) return reading.failed(e.message);
    return reading.unreadable(e.message);
  }
}

export async function verifyPublished({ item, env, fetchImpl = fetch }) {
  try {
    const session = await createSession(env, fetchImpl);
    const url = `${service(env)}/xrpc/com.atproto.repo.listRecords?repo=${encodeURIComponent(session.did)}&collection=app.bsky.feed.post&limit=20`;
    const res = await fetchImpl(url, { headers: { authorization: `Bearer ${session.accessJwt}` } });
    if (!res.ok) return { unreadable: `listRecords HTTP ${res.status}` };
    const { records = [] } = await res.json();
    const found = records.find((r) => String(r.value?.text ?? '').includes(item.meta.slug));
    if (found) {
      const rkey = String(found.uri ?? '').split('/').pop();
      return {
        found: {
          uri: found.uri,
          cid: found.cid,
          url: `https://bsky.app/profile/${session.handle ?? session.did}/post/${rkey}`,
        },
      };
    }
    return { absent: true };
  } catch (e) {
    return { unreadable: e.message };
  }
}
