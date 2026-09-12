import { readFile } from 'node:fs/promises';

// content/calendar.json: [{ "item": "<year>/<slug>", "publishAt": "<ISO-8601 UTC>" }]
// Single writer: the Editor. The publisher only reads.

export async function loadCalendar(path) {
  const raw = JSON.parse(await readFile(path, 'utf8'));
  if (!Array.isArray(raw)) throw new Error('calendar.json must be an array');
  return raw.map((e, i) => {
    if (typeof e.item !== 'string' || !/^\d{4}\/[a-z0-9][a-z0-9-]*$/.test(e.item)) {
      throw new Error(`calendar[${i}]: item must be "<year>/<slug>", got ${JSON.stringify(e.item)}`);
    }
    const t = Date.parse(e.publishAt);
    if (Number.isNaN(t) || !/Z$|[+-]\d{2}:\d{2}$/.test(String(e.publishAt))) {
      throw new Error(`calendar[${i}]: publishAt must be ISO-8601 with timezone, got ${JSON.stringify(e.publishAt)}`);
    }
    return { item: e.item, publishAt: new Date(t) };
  });
}

export function dueEntries(calendar, now) {
  return calendar.filter((e) => e.publishAt.getTime() <= now.getTime());
}
