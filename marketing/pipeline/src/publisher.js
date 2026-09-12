import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadCalendar, dueEntries } from './calendar.js';
import { loadItem } from './item.js';
import { receiptStore } from './receipts.js';
import { verifyApproval } from './approval.js';
import { parseSocialSections, copyFor, MissingLinkError } from './social.js';
import { splitBlog, renderMarkdown } from './markdown.js';
import * as reading from './reading.js';

// The publisher tick: deterministic, idempotent, non-LLM (constitution I).
// Ordering rules:
//   - platforms run in catalogue order; wordpress is first because social
//     copy needs the post URL;
//   - a receipt means done (skip);
//   - a claim without a receipt means a previous run may have died mid-call:
//     VERIFY via the platform API before any retry — never blind re-post;
//   - dry-run performs no external calls and writes nothing.

async function defaultAdapterLoader(row, marketingDir) {
  return import(join(marketingDir, row.adapter, 'index.js'));
}

export async function tick({
  now = new Date(),
  marketingDir,
  receiptsDir,
  env = process.env,
  dryRun = true,
  adapterLoader = defaultAdapterLoader,
  fetchImpl = fetch,
  log = () => {},
}) {
  const catalogue = JSON.parse(await readFile(join(marketingDir, 'catalogue.json'), 'utf8'));
  const contentDir = join(marketingDir, 'content');
  const calendar = await loadCalendar(join(contentDir, 'calendar.json'));
  const store = receiptStore(receiptsDir);

  const actions = [];
  const problems = [];
  const missedSlots = [];
  const record = (entry) => {
    actions.push(entry);
    log(`${entry.item} ${entry.platform ?? '-'} ${entry.action}: ${entry.status}${entry.reason ? ` (${entry.reason})` : ''}`);
    if (entry.status === reading.FAILED || entry.status === reading.UNREADABLE) problems.push(entry);
  };

  for (const due of dueEntries(calendar, now)) {
    let item;
    try {
      item = await loadItem(contentDir, due.item);
    } catch (e) {
      record({ item: due.item, action: 'load', status: reading.FAILED, reason: e.message });
      continue;
    }

    if (item.meta.state !== 'approved') {
      missedSlots.push({ item: due.item, state: item.meta.state, publishAt: due.publishAt.toISOString() });
      record({ item: due.item, action: 'gate', status: 'skipped', reason: `due but state=${item.meta.state} — missed slot` });
      continue;
    }

    const approval = await verifyApproval(item, { env, fetchImpl });
    if (!approval.approved) {
      const status = approval.unverifiable ? reading.UNREADABLE : reading.FAILED;
      record({ item: due.item, action: 'approval', status, reason: approval.reason });
      continue;
    }

    const rows = catalogue.platforms.filter(
      (r) => r.enabled && item.meta.platforms.includes(r.id),
    );
    const sections = parseSocialSections(item.social);

    // Post URL comes from the primary-channel receipt (existing or created
    // earlier in this same tick).
    let postUrl = (await store.getReceipt(due.item, 'wordpress'))?.receipt?.url ?? null;

    for (const row of rows) {
      const existing = await store.getReceipt(due.item, row.id);
      if (existing) {
        record({ item: due.item, platform: row.id, action: 'publish', status: 'skipped', reason: 'receipt exists' });
        continue;
      }

      if (row.kind === 'delegated') {
        if (postUrl) {
          const rec = reading.delegated(row.delegatedVia, `${row.mechanism} fans out the ${row.delegatedVia} publish`);
          if (!dryRun) await store.putReceipt(due.item, row.id, { ...rec, at: now.toISOString() });
          record({ item: due.item, platform: row.id, action: 'publish', status: rec.status, reason: rec.detail });
        } else {
          record({ item: due.item, platform: row.id, action: 'publish', status: 'skipped', reason: `waiting on ${row.delegatedVia} receipt` });
        }
        continue;
      }

      if (!row.adapter) {
        record({ item: due.item, platform: row.id, action: 'publish', status: reading.NOT_CONFIGURED, reason: 'no adapter shipped yet' });
        continue;
      }

      let adapter;
      try {
        adapter = await adapterLoader(row, marketingDir);
      } catch (e) {
        record({ item: due.item, platform: row.id, action: 'publish', status: reading.FAILED, reason: `adapter load: ${e.message}` });
        continue;
      }

      const cfg = adapter.isConfigured(env);
      if (!cfg.configured) {
        record({ item: due.item, platform: row.id, action: 'publish', status: reading.NOT_CONFIGURED, reason: `missing ${cfg.missing.join(', ')}` });
        continue;
      }

      // Build the payload BEFORE claiming: a payload error must not leave a claim.
      let payload;
      try {
        payload = buildPayload(row, item, sections, postUrl);
      } catch (e) {
        if (e instanceof MissingLinkError) {
          record({ item: due.item, platform: row.id, action: 'publish', status: 'skipped', reason: e.message });
        } else {
          record({ item: due.item, platform: row.id, action: 'payload', status: reading.FAILED, reason: e.message });
        }
        continue;
      }

      if (dryRun) {
        record({ item: due.item, platform: row.id, action: 'publish', status: 'dry-run', reason: describePayload(row, payload) });
        // Predict the post URL so downstream social copy still gets built and
        // length-checked in dry-run. Prediction is for VALIDATION ONLY — a
        // live tick always uses the URL from the real WP receipt.
        if (row.id === 'wordpress' && !postUrl) {
          const base = (env.WP_BASE_URL ?? 'https://chipprbots.com').replace(/\/$/, '');
          postUrl = `${base}/${payload.slug}/`;
        }
        continue;
      }

      const claim = await store.getClaim(due.item, row.id);
      if (claim) {
        const v = await adapter.verifyPublished({ item, claim, env, fetchImpl });
        if (v.found) {
          await store.putReceipt(due.item, row.id, { ...reading.ok(v.found), at: now.toISOString(), via: 'claim-verification' });
          record({ item: due.item, platform: row.id, action: 'verify-claim', status: reading.OK, reason: 'previous attempt had landed' });
          if (row.id === 'wordpress') postUrl = v.found.url ?? postUrl;
          continue;
        }
        if (v.unreadable) {
          record({ item: due.item, platform: row.id, action: 'verify-claim', status: reading.UNREADABLE, reason: v.unreadable });
          continue; // claim stays; no blind re-post
        }
        // definitively absent: fall through and publish again
      } else {
        await store.putClaim(due.item, row.id, { at: now.toISOString(), payloadHint: describePayload(row, payload) });
      }

      const result = await adapter.publish({ item, payload, env, fetchImpl });
      if (result.status === reading.OK) {
        await store.putReceipt(due.item, row.id, { ...result, at: now.toISOString() });
        if (row.id === 'wordpress') postUrl = result.receipt.url ?? postUrl;
      }
      record({ item: due.item, platform: row.id, action: 'publish', status: result.status, reason: result.reason });
    }
  }

  return {
    at: now.toISOString(),
    dryRun,
    actions,
    missedSlots,
    problems,
    ok: problems.length === 0,
  };
}

function buildPayload(row, item, sections, postUrl) {
  if (row.id === 'wordpress') {
    const { title, subtitle, bodyMd } = splitBlog(item.blog);
    return {
      title,
      excerpt: subtitle ?? '',
      html: renderMarkdown(bodyMd),
      slug: item.meta.slug,
      tags: item.meta.tags ?? [],
      categories: item.meta.categories ?? [],
    };
  }
  const text = copyFor(row.id, sections, row.copySections, postUrl, row.formats?.maxChars);
  // Missing copy is a content defect (recorded failed, fix the copy);
  // MissingLinkError from copyFor is a legitimate wait on the WP receipt.
  if (text === null) throw new Error(`no ${row.id} copy in social.md (checked sections: ${(row.copySections ?? [row.id]).join(', ')})`);
  return { text, postUrl };
}

function describePayload(row, payload) {
  if (row.id === 'wordpress') return `post "${payload.title}" slug=${payload.slug}`;
  return `${[...payload.text].length} chars`;
}
