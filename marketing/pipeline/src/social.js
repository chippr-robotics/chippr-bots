// Extract per-platform copy from social.md. Sections are H2 headings whose
// text names the platform ("## X (Twitter)", "## Mastodon", "## Bluesky",
// "## LinkedIn"). The catalogue's copySections gives the fallback order
// (e.g. bluesky falls back to the X copy, which fits its 300-char limit).

const SECTION_ALIASES = {
  'x': ['x', 'x (twitter)', 'twitter'],
  'mastodon': ['mastodon'],
  'bluesky': ['bluesky'],
  'linkedin': ['linkedin'],
  'instagram': ['instagram'],
  'tiktok': ['tiktok'],
};

export function parseSocialSections(md) {
  const sections = {};
  if (!md) return sections;
  const lines = md.replaceAll('\r\n', '\n').split('\n');
  let current = null;
  let buf = [];
  const flush = () => {
    if (current) sections[current] = buf.join('\n').trim();
    buf = [];
  };
  for (const line of lines) {
    const h2 = /^##\s+(.*)$/.exec(line);
    if (h2) {
      flush();
      const name = h2[1].trim().toLowerCase();
      current = null;
      for (const [key, aliases] of Object.entries(SECTION_ALIASES)) {
        if (aliases.includes(name)) current = key;
      }
      // unrecognized sections (e.g. "Image prompt (...)") are ignored
      continue;
    }
    if (current) buf.push(line);
  }
  flush();
  return sections;
}

export class MissingLinkError extends Error {}

// Resolve the copy for one platform. `postUrl` replaces the reviewed
// "<link>" placeholder; copy that carries the placeholder is REFUSED when no
// URL exists yet (posting a literal "<link>" is worse than not posting).
export function copyFor(platform, sections, copySectionOrder, postUrl, maxChars) {
  let text = null;
  for (const key of copySectionOrder ?? [platform]) {
    if (sections[key]) {
      text = sections[key];
      break;
    }
  }
  if (!text) return null;
  if (text.includes('<link>')) {
    if (!postUrl) throw new MissingLinkError(`${platform} copy needs the post URL and none exists yet`);
    text = text.replaceAll('<link>', postUrl);
  }
  if (maxChars && [...text].length > maxChars) {
    throw new Error(`${platform} copy is ${[...text].length} chars, over the ${maxChars} limit — fix the copy, not the pipeline`);
  }
  return text;
}
