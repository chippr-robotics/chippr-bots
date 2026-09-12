import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as reading from '@chippr-bots/marketing-pipeline/reading';

// WordPress REST adapter (PLAN.md 1.1): Application Password Basic auth
// against /wp-json/wp/v2. The post slug is set to the ITEM slug, which makes
// verification-by-slug the idempotency backstop. Publishes at-time
// (status=publish) — scheduling lives in the pipeline, not WP-Cron.

export function isConfigured(env) {
  const missing = ['WP_BASE_URL', 'WP_USERNAME', 'WP_APP_PASSWORD'].filter((k) => !env[k]);
  return { configured: missing.length === 0, missing };
}

function authHeader(env) {
  const token = Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString('base64');
  return `Basic ${token}`;
}

async function api(env, fetchImpl, path, init = {}) {
  const url = `${env.WP_BASE_URL.replace(/\/$/, '')}/wp-json/wp/v2${path}`;
  return fetchImpl(url, {
    ...init,
    headers: {
      authorization: authHeader(env),
      accept: 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

// Try to upload images/header.png (or .jpg) as the featured image. A missing
// file is fine (typographic Phase-1 posts have no hero); an upload FAILURE is
// reported but does not block the post — the receipt names the degradation.
async function uploadFeaturedMedia({ item, env, fetchImpl }) {
  for (const name of ['header.png', 'header.jpg']) {
    let bytes;
    try {
      bytes = await readFile(join(item.dir, 'images', name));
    } catch {
      continue;
    }
    const res = await api(env, fetchImpl, '/media', {
      method: 'POST',
      headers: {
        'content-type': name.endsWith('.png') ? 'image/png' : 'image/jpeg',
        'content-disposition': `attachment; filename="${item.meta.slug}-${name}"`,
      },
      body: bytes,
    });
    if (!res.ok) return { error: `media upload HTTP ${res.status}` };
    const media = await res.json();
    return { id: media.id };
  }
  return { none: true };
}

export async function publish({ item, payload, env, fetchImpl = fetch }) {
  try {
    const media = await uploadFeaturedMedia({ item, env, fetchImpl });

    const body = {
      title: payload.title,
      content: payload.html,
      excerpt: payload.excerpt,
      slug: payload.slug,
      status: 'publish',
    };
    if (media.id) body.featured_media = media.id;

    const res = await api(env, fetchImpl, '/posts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status >= 500) return reading.unreadable(`posts HTTP ${res.status}`);
    if (!res.ok) return reading.failed(`posts HTTP ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
    const post = await res.json();
    return reading.ok({
      id: post.id,
      url: post.link,
      slug: post.slug,
      featuredMedia: media.id ?? null,
      mediaNote: media.error ?? (media.none ? 'no header image in item' : undefined),
    });
  } catch (e) {
    return reading.unreadable(e.message);
  }
}

// Deterministic verification: the post slug equals the item slug.
export async function verifyPublished({ item, env, fetchImpl = fetch }) {
  try {
    const res = await api(env, fetchImpl, `/posts?slug=${encodeURIComponent(item.meta.slug)}&status=publish`);
    if (!res.ok) return { unreadable: `verify HTTP ${res.status}` };
    const posts = await res.json();
    if (Array.isArray(posts) && posts.length > 0) {
      return { found: { id: posts[0].id, url: posts[0].link, slug: posts[0].slug } };
    }
    return { absent: true };
  } catch (e) {
    return { unreadable: e.message };
  }
}
