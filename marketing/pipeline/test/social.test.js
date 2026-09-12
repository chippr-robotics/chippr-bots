import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSocialSections, copyFor, MissingLinkError } from '../src/social.js';

const MD = `# Social kit

## X (Twitter)

X copy here 🔗 <link> #tag

## LinkedIn

Longer LinkedIn copy.

<link>

## Mastodon

Masto copy <link>

## Image prompt (Gemini / Nano Banana)

An illustration prompt that must be ignored.
`;

test('sections parse with aliases; image prompt ignored', () => {
  const s = parseSocialSections(MD);
  assert.match(s.x, /^X copy here/);
  assert.match(s.linkedin, /^Longer LinkedIn/);
  assert.match(s.mastodon, /^Masto copy/);
  assert.equal(Object.keys(s).includes('image prompt (gemini / nano banana)'), false);
});

test('fallback order: bluesky falls back to x copy', () => {
  const s = parseSocialSections(MD);
  const text = copyFor('bluesky', s, ['bluesky', 'x'], 'https://example.com/p/', 300);
  assert.match(text, /^X copy here/);
  assert.ok(text.includes('https://example.com/p/'));
  assert.ok(!text.includes('<link>'));
});

test('copy with <link> and no URL is refused, not posted literally', () => {
  const s = parseSocialSections(MD);
  assert.throws(() => copyFor('mastodon', s, ['mastodon'], null, 500), MissingLinkError);
});

test('over-limit copy is refused, never truncated', () => {
  const s = { mastodon: 'a'.repeat(501) };
  assert.throws(() => copyFor('mastodon', s, ['mastodon'], null, 500), /over the 500/);
});

test('missing section returns null', () => {
  assert.equal(copyFor('tiktok', {}, ['tiktok'], null, 100), null);
});
