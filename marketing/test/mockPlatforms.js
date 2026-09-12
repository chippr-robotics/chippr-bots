import { createServer } from 'node:http';

// One mock server for all three platforms, path-prefixed:
//   /wp/wp-json/wp/v2/*      WordPress REST
//   /masto/api/v1/*          Mastodon
//   /bsky/xrpc/*             AT Protocol
// Tracks every request so tests can assert idempotency (call COUNTS, not
// just outcomes). `state` persists posts/statuses/records across ticks.

export async function startMockPlatforms() {
  const requests = [];
  const state = { wpPosts: [], mastoStatuses: [], bskyRecords: [], mediaIds: 0 };

  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    const url = new URL(req.url, 'http://localhost');
    requests.push({ method: req.method, path: url.pathname, query: url.search });
    const json = (code, value) => {
      res.writeHead(code, { 'content-type': 'application/json' });
      res.end(JSON.stringify(value));
    };

    // --- WordPress ---
    if (url.pathname === '/wp/wp-json/wp/v2/media' && req.method === 'POST') {
      return json(201, { id: ++state.mediaIds });
    }
    if (url.pathname === '/wp/wp-json/wp/v2/posts' && req.method === 'POST') {
      if (!String(req.headers.authorization ?? '').startsWith('Basic ')) return json(401, { code: 'no auth' });
      const post = JSON.parse(body.toString());
      const id = 100 + state.wpPosts.length;
      const record = { id, slug: post.slug, link: `${base}/wp/${post.slug}/`, title: post.title, status: post.status };
      state.wpPosts.push(record);
      return json(201, record);
    }
    if (url.pathname === '/wp/wp-json/wp/v2/posts' && req.method === 'GET') {
      const slug = url.searchParams.get('slug');
      return json(200, state.wpPosts.filter((p) => p.slug === slug));
    }

    // --- Mastodon ---
    if (url.pathname === '/masto/api/v1/statuses' && req.method === 'POST') {
      if (!String(req.headers.authorization ?? '').startsWith('Bearer ')) return json(401, { error: 'no auth' });
      const { status } = JSON.parse(body.toString());
      const id = `m${state.mastoStatuses.length + 1}`;
      const record = { id, url: `${base}/masto/@chipprbots/${id}`, content: `<p>${status}</p>` };
      state.mastoStatuses.push(record);
      return json(200, record);
    }
    if (url.pathname === '/masto/api/v1/accounts/verify_credentials') {
      return json(200, { id: 'acc1' });
    }
    if (url.pathname === '/masto/api/v1/accounts/acc1/statuses') {
      return json(200, state.mastoStatuses);
    }

    // --- Bluesky ---
    if (url.pathname === '/bsky/xrpc/com.atproto.server.createSession' && req.method === 'POST') {
      const { identifier, password } = JSON.parse(body.toString());
      if (!identifier || !password) return json(401, { error: 'AuthenticationRequired' });
      return json(200, { accessJwt: 'jwt-test', did: 'did:plc:test', handle: 'chipprbots.com' });
    }
    if (url.pathname === '/bsky/xrpc/com.atproto.repo.createRecord' && req.method === 'POST') {
      const { record } = JSON.parse(body.toString());
      const rkey = `rk${state.bskyRecords.length + 1}`;
      const rec = { uri: `at://did:plc:test/app.bsky.feed.post/${rkey}`, cid: `cid-${rkey}`, value: record };
      state.bskyRecords.push(rec);
      return json(200, { uri: rec.uri, cid: rec.cid });
    }
    if (url.pathname === '/bsky/xrpc/com.atproto.repo.listRecords') {
      return json(200, { records: state.bskyRecords });
    }

    // --- GitHub API (approval verification) ---
    // Models: primary's last commit on the pilot meta.json came in via PR #900,
    // merged, approved by "realcodywburns".
    if (url.pathname === '/gh/repos/chippr-robotics/chippr-bots/commits' && url.searchParams.get('path')) {
      return json(200, [{ sha: 'abc123abc123' }]);
    }
    if (url.pathname === '/gh/repos/chippr-robotics/chippr-bots/commits/abc123abc123/pulls') {
      return json(200, [{ number: 900, merged_at: '2026-09-12T13:00:00Z' }]);
    }
    if (url.pathname === '/gh/repos/chippr-robotics/chippr-bots/pulls/900') {
      return json(200, { number: 900, merged_at: '2026-09-12T13:00:00Z' });
    }
    if (url.pathname === '/gh/repos/chippr-robotics/chippr-bots/pulls/900/reviews') {
      return json(200, [{ state: 'COMMENTED', user: { login: 'someone' } }, { state: 'APPROVED', user: { login: 'realcodywburns' } }]);
    }

    json(404, { error: `unmocked ${req.method} ${url.pathname}` });
  });

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  return {
    base,
    requests,
    state,
    countOf: (pathSuffix, method = 'POST') =>
      requests.filter((r) => r.method === method && r.path.endsWith(pathSuffix)).length,
    env: {
      WP_BASE_URL: `${base}/wp`,
      WP_USERNAME: 'marketing-bot',
      WP_APP_PASSWORD: 'test test test test',
      MASTODON_BASE_URL: `${base}/masto`,
      MASTODON_TOKEN: 'masto-token',
      BSKY_SERVICE: `${base}/bsky`,
      BSKY_IDENTIFIER: 'chipprbots.com',
      BSKY_APP_PASSWORD: 'bsky-app-pass',
      GITHUB_API_URL: `${base}/gh`,
      GITHUB_REPOSITORY: 'chippr-robotics/chippr-bots',
      GITHUB_TOKEN: 'gh-test-token',
      MARKETING_APPROVERS: 'realcodywburns',
    },
    close: () => new Promise((r) => server.close(r)),
  };
}
