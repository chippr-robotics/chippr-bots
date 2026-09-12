import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { isState } from './states.js';

// A content item is a directory: meta.json (state + scheduling + provenance),
// blog.md (the post), social.md (per-platform copy), images/ (renditions).
// meta.json is JSON, not YAML front matter, so state stays machine-writable
// with zero parser dependencies.

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

export class ItemError extends Error {
  constructor(slug, message) {
    super(`item ${slug}: ${message}`);
    this.slug = slug;
  }
}

export function validateMeta(slug, meta) {
  const errors = [];
  if (meta.slug !== slug) errors.push(`meta.slug "${meta.slug}" != directory slug "${slug}"`);
  if (!SLUG_RE.test(String(meta.slug ?? ''))) errors.push('slug must be kebab-case');
  if (!isState(meta.state)) errors.push(`unknown state "${meta.state}"`);
  if (!Array.isArray(meta.platforms) || meta.platforms.length === 0) {
    errors.push('platforms must be a non-empty array');
  }
  if (meta.state === 'approved') {
    const r = meta.review;
    const preApproved = r && r.preApproved === true && typeof r.batch === 'string';
    const reviewedPr = r && Number.isInteger(r.pr) && r.pr > 0;
    if (!preApproved && !reviewedPr) {
      errors.push('approved items must carry review.preApproved+batch or review.pr');
    }
  }
  if (meta.provenance) {
    for (const k of ['repo', 'path', 'commit']) {
      if (typeof meta.provenance[k] !== 'string' || meta.provenance[k].length === 0) {
        errors.push(`provenance.${k} required when provenance is present`);
      }
    }
  }
  return errors;
}

// `rel` is the calendar-form path "<year>/<slug>"; meta.slug matches the
// last segment.
export async function loadItem(contentDir, rel) {
  const dir = join(contentDir, rel);
  const slug = rel.split('/').pop();
  let meta;
  try {
    meta = JSON.parse(await readFile(join(dir, 'meta.json'), 'utf8'));
  } catch (e) {
    throw new ItemError(rel, `unreadable meta.json: ${e.message}`);
  }
  const errors = validateMeta(slug, meta);
  if (errors.length) throw new ItemError(rel, errors.join('; '));

  const blog = await readFile(join(dir, 'blog.md'), 'utf8').catch(() => null);
  const social = await readFile(join(dir, 'social.md'), 'utf8').catch(() => null);
  if (meta.platforms.includes('wordpress') && blog === null) {
    throw new ItemError(slug, 'platform wordpress requires blog.md');
  }
  return { slug, dir, meta, blog, social };
}

// Enumerate item dirs under contentDir/<year>/<slug>. Non-item files are
// ignored; a dir with a meta.json is an item.
export async function listItems(contentDir) {
  const out = [];
  let years = [];
  try {
    years = await readdir(contentDir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const y of years) {
    if (!y.isDirectory() || !/^\d{4}$/.test(y.name)) continue;
    const yDir = join(contentDir, y.name);
    for (const d of await readdir(yDir, { withFileTypes: true })) {
      if (d.isDirectory()) out.push(join(y.name, d.name));
    }
  }
  return out;
}
