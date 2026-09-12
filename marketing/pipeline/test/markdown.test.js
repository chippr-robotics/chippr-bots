import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, splitBlog } from '../src/markdown.js';

test('headings, paragraphs, inline marks', () => {
  const html = renderMarkdown('## Title two\n\nSome **bold** and *ital* and `code`.\n');
  assert.match(html, /<h2>Title two<\/h2>/);
  assert.match(html, /<p>Some <strong>bold<\/strong> and <em>ital<\/em> and <code>code<\/code>.<\/p>/);
});

test('links pass, raw html is escaped', () => {
  const html = renderMarkdown('See [docs](https://example.com/x) <script>alert(1)</script>');
  assert.match(html, /<a href="https:\/\/example.com\/x">docs<\/a>/);
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
});

test('fenced code is escaped verbatim', () => {
  const html = renderMarkdown('```\nconst a = 1 < 2;\n```');
  assert.match(html, /<pre><code>const a = 1 &lt; 2;<\/code><\/pre>/);
});

test('lists and blockquote and hr', () => {
  const html = renderMarkdown('- one\n- two\n\n1. first\n2. second\n\n> quoted words\n\n---\n');
  assert.match(html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(html, /<ol><li>first<\/li><li>second<\/li><\/ol>/);
  assert.match(html, /<blockquote><p>quoted words<\/p><\/blockquote>/);
  assert.match(html, /<hr>/);
});

test('pipe tables with and without header separator', () => {
  const withHead = renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |\n');
  assert.match(withHead, /<thead><tr><th>a<\/th><th>b<\/th><\/tr><\/thead>/);
  assert.match(withHead, /<tbody><tr><td>1<\/td><td>2<\/td><\/tr><\/tbody>/);
  const bare = renderMarkdown('| | |\n|---|---|\n| **Series** | Accounts |\n');
  assert.match(bare, /<td><strong>Series<\/strong><\/td><td>Accounts<\/td>/);
});

test('splitBlog extracts title and italic subtitle', () => {
  const { title, subtitle, bodyMd } = splitBlog(
    '# The Title\n\n*A one-line subtitle*\n\nBody starts here.\n',
  );
  assert.equal(title, 'The Title');
  assert.equal(subtitle, 'A one-line subtitle');
  assert.match(bodyMd, /^Body starts here\./);
});

test('splitBlog refuses a file without an H1', () => {
  assert.throws(() => splitBlog('no title here\n'));
});

test('renders the real pilot blog.md without throwing and keeps its table', async () => {
  const { readFile } = await import('node:fs/promises');
  const md = await readFile(new URL('../../content/2026/passkey-smart-accounts/blog.md', import.meta.url), 'utf8');
  const { title, bodyMd } = splitBlog(md);
  assert.match(title, /Passkey Smart Accounts/);
  const html = renderMarkdown(bodyMd);
  assert.match(html, /<table>/);
  assert.ok(!/[<]script/.test(html));
});
