# marketing/

The Chippr Robotics marketing department — an agent team that automates the
blog → image → review → publish → distribute flow for every Chippr project.

**Start with [PLAN.md](./PLAN.md)** — the founding plan: landscape review (WordPress on
`chipprbots.com`, Canva, seven social platforms, the ~78-post FairWins content backlog),
the agent roster, architecture, phased rollout, budget, and open decisions.

Nothing in this directory joins the legacy Yarn-v1 workspace under `packages/` — it is
a self-contained npm workspace (Node ≥ 20, **zero runtime dependencies** by design:
the publisher is the security-critical surface, so `npm ci` has nothing to poison).

## Workspace map

| Path | What it is |
|---|---|
| `contract/` | `@chippr-bots/marketing-contract` — agent caps, honest wording, role prompts (`prompts/*.md`) |
| `pipeline/` | content model (`meta.json` state machine), calendar, receipts/claims, approval verification, markdown renderer, the publisher tick (`bin/tick.js`) |
| `adapters/` | `wordpress/` (REST + app password), `mastodon/`, `bluesky/` — one interface: `isConfigured` / `publish` / `verifyPublished` |
| `secrets/` | data-only registry (`chipprbots-mkt-*` Secret Manager containers) + gcloud fetch wrapper |
| `content/` | `calendar.json` (single writer: Editor) + `<year>/<slug>/` item dirs (`meta.json`, `blog.md`, `social.md`, `images/`) |
| `catalogue.json` | platform capability rows — the credential-parity CI gate reads this |
| `check.js` | structural gates G1–G5 (`npm run check`) |
| `test/` | mock-platform e2e: dry-run isolation, publish ordering, idempotency, crash-window claim verification |

Run locally: `npm ci --ignore-scripts && npm run check && npm test`.
Dry-run a tick: `npm run tick` (dry-run is the default; `--live` additionally
requires `MARKETING_LIVE=true`, and a live tick still publishes nothing until
credentials are delivered — an unconfigured platform is `not-configured`, never
a fabricated success). The publisher verifies, via the GitHub API, that the PR
which last changed an item's `meta.json` on `primary` is merged with an
approving review from `MARKETING_APPROVERS` before publishing it — `meta.json`
can never self-declare approval.

Receipts live on the **`receipts` ref**, never `primary` (no branch-protection
bypass actor); "published" is derived from receipts. The publisher workflow is
`.github/workflows/marketing-publish.yml` (15-min cron, serialized, no
third-party actions); PR gates are `.github/workflows/marketing-gates.yml`.

| Stage | Human? | What happens |
|---|---|---|
| topic → draft → images | agents | Strategist / Writer / Designer (Canva brand templates) |
| review | **yes — the one gate** | PR review on the content item |
| publish → distribute | deterministic worker | WordPress REST, then Mastodon / Bluesky / X / IG / TikTok adapters; LinkedIn via Jetpack Social |
