// Minimal, dependency-free Markdown -> HTML for the WordPress body.
// Covers the subset the docs/blog corpus actually uses: ATX headings,
// paragraphs, bold/italic/inline code, links, images, fenced code blocks,
// unordered/ordered lists (one level), blockquotes, hr, and pipe tables.
// Raw HTML in the source is ESCAPED, never passed through: content files are
// reviewed as markdown, so markup smuggled past review must not execute.

function escapeHtml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function inline(s) {
  let out = escapeHtml(s);
  // images before links (shared syntax prefix)
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) =>
    /^https?:\/\//.test(src) ? `<img src="${src}" alt="${alt}">` : `[image: ${alt}]`);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) =>
    /^https?:\/\/|^\//.test(href) ? `<a href="${href}">${text}</a>` : text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|\W)\*([^*\n]+)\*(?=\W|$)/g, '$1<em>$2</em>');
  return out;
}

export function renderMarkdown(md) {
  const lines = md.replaceAll('\r\n', '\n').split('\n');
  const html = [];
  let i = 0;
  let para = [];

  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${para.map(inline).join(' ')}</p>`);
      para = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      flushPara();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      html.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      const level = h[1].length;
      html.push(`<h${level}>${inline(h[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
      flushPara();
      html.push('<hr>');
      i++;
      continue;
    }

    if (/^\|.*\|\s*$/.test(line)) {
      flushPara();
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) {
        rows.push(lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
        i++;
      }
      const isSep = (r) => r.every((c) => /^:?-{3,}:?$/.test(c) || c === '');
      let body = rows;
      let head = null;
      if (rows.length >= 2 && isSep(rows[1])) {
        head = rows[0];
        body = rows.slice(2);
      }
      const tr = (cells, tag) => `<tr>${cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`;
      html.push('<table>' +
        (head ? `<thead>${tr(head, 'th')}</thead>` : '') +
        `<tbody>${body.map((r) => tr(r, 'td')).join('')}</tbody></table>`);
      continue;
    }

    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushPara();
      const tag = ul ? 'ul' : 'ol';
      const re = ul ? /^\s*[-*]\s+(.*)$/ : /^\s*\d+\.\s+(.*)$/;
      const items = [];
      while (i < lines.length) {
        const m = re.exec(lines[i]);
        if (!m) break;
        items.push(`<li>${inline(m[1])}</li>`);
        i++;
      }
      html.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushPara();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      html.push(`<blockquote><p>${buf.map(inline).join(' ')}</p></blockquote>`);
      continue;
    }

    if (line.trim() === '') {
      flushPara();
      i++;
      continue;
    }

    para.push(line.trim());
    i++;
  }
  flushPara();
  return html.join('\n');
}

// Split a blog.md into { title, subtitle, bodyMd }: title is the first H1,
// subtitle the immediately following single-line *italic* paragraph (if any).
export function splitBlog(md) {
  const lines = md.replaceAll('\r\n', '\n').split('\n');
  let title = null;
  let subtitle = null;
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '') continue;
    const h1 = /^#\s+(.*)$/.exec(t);
    if (h1 && title === null) {
      title = h1[1].trim();
      start = i + 1;
      // optional one-line italic subtitle
      for (let j = start; j < lines.length; j++) {
        const s = lines[j].trim();
        if (s === '') continue;
        const it = /^\*([^*].*)\*$/.exec(s);
        if (it) {
          subtitle = it[1].trim();
          start = j + 1;
        }
        break;
      }
    }
    break;
  }
  if (title === null) throw new Error('blog.md has no leading H1 title');
  return { title, subtitle, bodyMd: lines.slice(start).join('\n').trim() };
}
