# Chippr Robotics Marketing Department — Founding Plan

Status: **Proposed** · Owner: Cody · Home: `chippr-bots/marketing/`
Scope: automate the blog → image → review → publish → distribute flow for all Chippr
projects (FairWins, Fukuii, ClearPath, King's Edge, Chippr Robotics itself), with agents
doing every step except one human review gate.

---

## 1. Landscape review (verified 2026-09-12)

### 1.1 The distribution channel

- **The live site is `chipprbots.com`** — WordPress, on the shared GCP project
  `chippr-bots-site-wp` (default VPC, deliberately excluded from the FairWins Terraform
  estate). `chipperbots.com` is **unregistered** (NXDOMAIN) — everything targets
  `chipprbots.com`; defensively registering the misspelling is a cheap optional.
- **The WP REST API is fully exposed and ready**: `https://chipprbots.com/wp-json/`
  answers with core `wp/v2`, and Application Passwords auth is enabled
  (`wp-admin/authorize-application.php` advertised). An agent can create posts, upload
  media, set categories/tags, and schedule (`status=future` + `date_gmt`) **today** with
  a dedicated least-privilege WP user + app password. No plugin work needed.
- **Jetpack is installed** (`jetpack/v4` namespace live). This is almost certainly the
  current "wp app publishes to linkedin": Jetpack Social auto-shares new posts through
  Automattic's pre-approved LinkedIn partner app — meaning **we never need our own
  LinkedIn API approval** (which is a vetted, weeks-to-months process for org posting).
  Free plan caps ~30 shares/month with one shared caption; ~$5/mo removes the cap and
  adds per-network captions.
- **The site already federates**: the ActivityPub WordPress plugin is active
  (`activitypub/1.0` namespace), so blog posts are natively followable from Mastodon
  before we post a single status.
- One known scheduling hazard: **WP-Cron only fires on page loads**, so `status=future`
  posts on a low-traffic site land in "Missed Schedule". Fix is either a real cron
  hitting `wp-cron.php`, or (our default) the publisher agent publishing at the target
  time with `status=publish` so scheduling lives in our pipeline, not WP's.

### 1.2 The content backlog — the surprise asset

`prediction-dao-research/docs/blog/` is a complete, unpublished content program:

| Series | Count | Audience | Shape |
|---|---|---|---|
| `posts/` | 36 | architecture/engineering | ~1,200–1,900-word deep-dives w/ sources |
| `knowledge/` | 21 | educational | plain-language primers |
| `finance/` | 18 | business-finance | briefings w/ "not advice" banner |
| `features/` | 3 | members | feature announcements |

Every item has `blog.md` **plus `social.md`** — a per-post X draft, LinkedIn draft, and
a detailed 16:9 image prompt. Inventories with per-topic scoring and a suggested
publishing order (04→12→15→06→29→25) already exist. **The marketing team's first job is
publishing ~78 existing drafts, not generating content.** That inverts the usual
cold-start problem: the pipeline can run at full cadence from week one, and generation
(steps 1–3 of the current flow) can be automated last, against a live pipeline.

### 1.3 Canva

- Account has **3 brand kits** (Chipprbots `kAFgdsz5WZQ`, Fairwins `kAG8zNcVnd0`,
  KingsEdgePoker `kAGwVS7HZX8`) and **zero usable brand templates** (the only one is a
  brand-guidelines presentation with an empty dataset). Today's headers are one-off
  template copies — that's the manual step 4 we're replacing.
- The formal **Autofill API is Canva Enterprise-only**; the connected MCP server
  accordingly does not expose `autofill-design`. This does **not** block us: the
  headless rail available on the current plan is
  `create-design-from-brand-template → edit-design (replace_text / update_fill) →
  export-design`, which returns a 24-h download URL. Verified live against this account.
- Consequence: **authoring the template library is a required Phase-1 workstream** —
  per brand × per format masters with tagged fields (`headline`, `subhead`,
  `hero_image`, `logo`), published as brand templates. `resize-design` bootstraps sizes
  from a master (then hand-tune), but stays out of the per-post hot path (it re-flows
  layout heuristically).
- Rate limits comfortably exceed blog cadence (exports 20/min, 500/day/user); Magic
  Studio generation is credit-metered and non-deterministic — ideation only, never the
  production rail. Commercial use of exports on a paid plan is clean (no watermarks;
  don't extract stock elements standalone; no Canva library content in logos).

### 1.4 Social platform reality (per-platform friction, verified against current docs)

| Platform | Path | Friction | Cost | Prerequisite before launch |
|---|---|---|---|---|
| LinkedIn | Jetpack Social (already installed) | none | $0–5/mo | confirm page connection + cap |
| Mastodon | `POST /api/v1/statuses`, native `scheduled_at` | none | $0 | pick instance, mark account as bot |
| Bluesky | app password + `createRecord` vs bsky.social | none | $0 | DNS TXT `_atproto` → `@chipprbots.com` handle |
| X | API v2 pay-per-use | low | ~$0.20/link post (~$6–10/mo) | buy credits; OAuth2 `tweet.write` |
| Instagram | Graph API, "Instagram Login" path | medium | $0 | business/creator acct; Meta App Review (~2–4 wks) |
| TikTok | Content Posting API | high | $0 | **audit before launch** — unaudited posts are locked private |
| Fediverse (bonus) | ActivityPub plugin | already live | $0 | none |

Notes: X's free tier is closed to new signups (Feb 2026); budget at the $0.20 link-post
rate, and re-verify unit prices in the developer console (primary pricing page 404'd
during research). Bluesky/Mastodon are the zero-friction wins and ship first.

### 1.5 Bluesky PDS decision

A self-hosted PDS is **not needed for anything in this plan**: posting works against
`bsky.social` with an app password, and the branded `@chipprbots.com` handle is a DNS
TXT record, not a server. The old `packages/compose/pds` stack (and whatever GCP assets
remain — live check requested from ops_node_1) can stay **off**. Revisit self-hosting
only if data custody of the brand's AT Proto repo becomes a goal in itself; it's a
1 CPU / 1 GB / 20 GB VM plus a wildcard DNS record if so. The floppy-keystore skill's
`did atproto` tooling (did:web + secp256k1 Multikey) is available if we later want a
cryptographically anchored agent identity on AT Proto.

### 1.6 The chippr-bots repo (the new home)

Dormant Yarn-v1/Lerna-6 monorepo, last real activity 2023–2025. Deep-read verdict:

- **Nothing is runnable-reusable** (Node 12, Twitter v1.1, discord.io, Kotti testnet,
  Jenkins+Vault+Swarm CI that no longer exists).
- **Three conventions worth keeping**: the `@chippr-bots/<name>` package scope; one
  service = one package = one Dockerfile with env-var-only config; the
  `packages/compose/<stack>` deployment shape (ALLCAPS service, `image: ${X_IMAGE}`,
  bind mounts from `${X_DATA}`, external `chipprbackbone` network) if anything deploys
  to the existing Docker host.
- **Prior art worth re-reading, not importing**: `bridgette-twitter`'s mode state
  machine + tunable-thresholds state object; its `setInterval`-with-no-queue scheduler
  is the first thing we replace.
- **Hazards**: the `workspaces: ["packages/*"]` glob auto-captures any new dir with a
  `package.json` into the stale Yarn-v1 workspace (native-module breakage on Node ≥18
  likely), so the marketing system lives **outside** `packages/`; the
  `packages/chippr-agi` gitlink is a broken submodule pointer (no `.gitmodules`) that
  breaks submodule-touching CI; `.github/dependabot.yml` is invalid as written; the only
  live CI is CodeQL.

### 1.7 Patterns to import from the FairWins estate

- **Secrets (spec 097 shape)**: a data-only registry (id / env aliases / class /
  least-privilege profiles), a wrapper that injects a profile into a child process env,
  payloads only in GCP Secret Manager, never on disk/argv/logs. Marketing credentials
  get their own prefix (`chipprbots-mkt-*`).
- **Honest states (specs 089/104)**: every platform read/publish resolves
  `ok / not-configured / unreadable` — a failed publish is never a silent skip, an
  unconfigured platform is not an error, and no metric fabricates a zero.
- **Credential enumeration gate (FinOps C2b lesson)**: every configured platform
  credential/destination must be enumerable by a CI check against a catalogue — "we
  forgot that account posts" must be impossible.
- **One contract package**: prompts, tool tables, and honest-failure wording for the
  agents live in one place (`@chippr-bots/marketing-contract`), consumed by every agent
  — the `@fairwins/assistant-contract` device.

---

## 2. Design

### 2.1 Principles

1. **One human gate.** The current flow has humans at every step; the target flow has
   exactly one — review/approval (step 5) — and it is load-bearing. Nothing reaches a
   public channel without a human approval artifact. Everything else is agents.
2. **Content is git.** Content items are files with front-matter state; the review gate
   is a pull-request review; the audit trail is git history. This reuses the exact
   muscle the team already has, gives the approval a cryptographic-ish artifact (merge
   commit + review), and makes the pipeline resumable and inspectable at every stage.
3. **The pipeline is a state machine**, not a chain of hand-offs:
   `idea → brief → drafted → designed → in-review → approved → publishing → published`
   (+ `parked`, `rejected`). Every transition is a commit; the publisher writes
   per-platform **receipts** (post URL, id, timestamp) back into the item's dir.
4. **Platform adapters behind one interface.** `publish(item, rendition) → receipt`,
   with per-platform capability declared in a catalogue (formats, char limits, media
   specs, scheduling model: native vs at-time). Adding a platform = adding an adapter +
   a catalogue row + a credential registry row; CI fails if any of the three is missing.
5. **Fetched content is counterparty-authored.** Engagement data, comments, and web
   research that flow back into agent context never trigger actions by themselves
   (prompt-injection posture from spec 104).
6. **Mechanism note.** The one-gate design is deliberate: review capacity is the scarce
   resource, so the pipeline optimizes for cheap rejection (reviewer sees a finished
   post + rendered images + per-platform copy in one PR, approves or rejects in one
   act) rather than cheap production. Cadence commitment lives in the calendar, not in
   reviewer willpower; a missed review slides the schedule visibly instead of silently.

### 2.2 The agent roster (maps 1:1 onto the current 8-step flow)

| Agent | Replaces step | Job | Runs as |
|---|---|---|---|
| **Editor** (orchestrator) | — | owns calendar + state machine, assigns work, opens/merges content PRs, chases the gate | scheduled Claude session (Routine) |
| **Strategist** | 1–2 | watches project repos (releases, merged specs) + digital-asset news → topic briefs per audience (architecture / educational / business-finance) | scheduled Claude session |
| **Writer** | 3 | brief → `blog.md` + `social.md` (per-platform copy, image prompt). For the 78-post backlog: adapt, don't generate | Claude session per item |
| **Designer** | 4 | Canva rail: pick brand template by (brand, format) → fill → export renditions; uploads to WP media | Claude session / deterministic script |
| **Reviewer** | 5 | **HUMAN** — PR review on the content PR (rendered post + all images + all copy) | Cody / delegate |
| **Publisher** | 6–8 | on merge + due time: WP REST (media, post), then platform adapters in catalogue order; writes receipts; LinkedIn rides Jetpack on the WP publish | deterministic worker (GH Actions cron) |
| **Analyst** (Phase 3) | — | engagement readback, spend catalogue (FinOps discipline), monthly report | scheduled Claude session |

Agents are Claude Code sessions driven by CCR Routines (the machinery running this very
session — and `ops_node_1` already demonstrates the pattern for ops); the Publisher is
deliberately **not** an LLM: publishing is deterministic I/O against APIs and must be
idempotent, retryable, and boring. LLM judgment ends at the merge.

### 2.3 Repo layout (new, outside the legacy workspace)

```
chippr-bots/
  marketing/                  # self-contained modern workspace (npm, Node ≥20, TS)
    package.json              # its OWN workspace root + lockfile — never joins packages/*
    contract/                 # @chippr-bots/marketing-contract: prompts, tool tables, wording
    pipeline/                 # content model, state machine, calendar, receipts
    adapters/
      wordpress/              # REST client: media, posts, taxonomy, at-time publish
      mastodon/  bluesky/  x/  instagram/  tiktok/   # one interface, capability catalogue
    studio/                   # Canva integration + template registry (brand × format → id)
    secrets/                  # registry.js (data only) + with-secrets wrapper (gcloud, no deps)
    content/
      calendar.json           # the schedule; single writer: Editor
      <YYYY>/<slug>/          # item dirs: brief.md, blog.md, social.md, images/, receipts/
    catalogue.json            # platforms, formats, credentials — the C2b-style CI gate reads this
  .github/workflows/
    marketing-publish.yml     # cron tick (15 min): publish approved+due items, commit receipts
    marketing-gates.yml       # PR checks: schema, state-machine legality, catalogue/credential parity
```

Content **source** stays with each project (FairWins drafts stay in
`prediction-dao-research/docs/blog/`); items are **promoted** into
`marketing/content/` by the Editor as scheduling-ready copies with provenance links.
One review surface, one state store, and project repos keep owning their own words.

### 2.4 Execution & scheduling

- **Publisher tick**: GitHub Actions cron every 15 min — read `calendar.json` +
  approved items due, publish, commit receipts. No new infra, secrets via GCP Secret
  Manager (WIF — no long-lived keys in GH). Platform scheduling models honored:
  Mastodon gets native `scheduled_at`; WP, Bluesky, X are published at-time (which also
  sidesteps WP-Cron entirely); LinkedIn fires from the WP publish via Jetpack.
- **Agent sessions**: CCR Routines — Strategist weekly, Editor daily, Writer/Designer
  fired per work item by the Editor. Escalation path: anything ambiguous lands as a PR
  comment or issue @-mentioning Cody, never a silent stall.
- If a resident worker ever becomes necessary (webhooks, heavier media), the
  `packages/compose/marketing/` stack in house style — or a `marketing` role VM on the
  FairWins `fairwins-stack@<role>` systemd pattern — is the pre-decided shape. Not
  Phase 1: the Actions cron is enough for blog cadence, and any GCP infra addition must
  follow the shared-project rules (additive-only IAM, own VPC, never the default
  network the WordPress VM sits on).

---

## 3. Rollout

### Phase 0 — Bootstrap (repo week)
1. Repo hygiene PR: remove the broken `chippr-agi` gitlink, fix/delete the invalid
   `dependabot.yml`, refresh root `readme.md`, note legacy packages as frozen.
2. Scaffold `marketing/` workspace + contract + pipeline skeleton + CI gates.
3. Secrets: create `chipprbots-mkt-*` containers in Secret Manager (WP app password
   first); registry + parity check. Create the dedicated WP service user (Author role).
   Ask ops_node_1 to provision/verify — read-only estate report already requested.

### Phase 1 — Primary channel + zero-friction socials (weeks 1–3)
1. **WordPress adapter** end-to-end: media upload → post create → at-time publish →
   receipt. Verify Jetpack Social's LinkedIn connection (page vs profile, share cap);
   upgrade to paid Social (~$5/mo) if per-network captions or >30 shares/mo needed.
2. **Canva template library**: for each brand (Chipprbots, Fairwins; KingsEdgePoker
   when needed) author + publish brand-template masters at: blog 1600×900,
   X/Bluesky 1200×675, LinkedIn 1200×627, IG 1080×1080 + 1080×1350,
   Story/TikTok 1080×1920, Mastodon/OG 1200×630. Tag `headline/subhead/hero_image/logo`
   fields; human eyeballs each master once before publish.
3. **Mastodon + Bluesky adapters** (token + app password). Set `@chipprbots.com`
   Bluesky handle via `_atproto` DNS TXT. Mark bot accounts as bots.
4. **First publishes through the full gate**: 2–3 items from the FairWins backlog in
   its documented order (04→12→15→06→29→25), each as a content PR (post + renders +
   copy) → human review → merge → auto-publish → receipts. This is the acceptance test.

### Phase 2 — Paid/reviewed platforms + steady cadence (weeks 3–8)
1. **X adapter**: buy API credits, OAuth2 user context, `POST /2/media/upload` +
   `/2/tweets`; verify real unit pricing in the console; route credit purchases through
   the same account as Grok for the up-to-20% xAI rebate.
2. **Instagram**: confirm account type; use the Instagram-Login API path (no Facebook
   Page needed); submit Meta App Review early (2–4 weeks lead); media served from WP
   media library URLs (public — qualifies).
3. **Cadence**: run the backlog at ~3 posts/week (2 engineering, 1 rotating
   knowledge/finance) — 78 items ≈ 6 months of runway. Editor keeps `calendar.json`;
   Strategist starts proposing net-new topics from repo activity so the queue never
   drains.
4. **Automated content generation** (steps 1–3 of the old flow) comes online here,
   validated against a pipeline that's already publishing.

### Phase 3 — Heavy platforms, media, and measurement (month 3+)
1. **TikTok**: submit Content Posting API audit first (unaudited = private posts);
   until passed, optionally ship Upload-to-Draft mode. Verify chipprbots.com domain for
   `PULL_FROM_URL`.
2. **Grok (xAI) media**: image gen ~$0.04–0.08/image, video $0.08/sec (≤15 s clips) for
   short-form video on TikTok/IG Reels/X. Re-verify pricing at build time. Canva stays
   the brand-consistency rail; Grok feeds raw imagery into it.
3. **Analyst**: engagement readback per platform, spend per channel in a FinOps-style
   catalogue (every revenue/cost source declared or CI fails), monthly report.

### Explicitly deferred / declined
- **Self-hosted Bluesky PDS** — off, not needed for posting or the branded handle.
- **Direct LinkedIn Community Management API** — vetted-partner process not worth it
  while Jetpack Social covers the need.
- **Reviving any legacy `packages/*` code** — prior art only.

---

## 4. Budget (steady state, ~12–16 posts/mo)

| Line | Est. |
|---|---|
| X pay-per-use (link posts @ ~$0.20) | $6–10/mo |
| Jetpack Social paid (if cap/captions needed) | $0–5/mo |
| Canva | existing plan (AI credits: ideation only) |
| Mastodon, Bluesky, IG, TikTok APIs | $0 |
| GH Actions publisher | $0 (public-repo minutes / negligible) |
| Grok media (Phase 3) | ~$0.05/image, ~$0.80/10 s clip, usage-based |
| Claude sessions (agents) | existing subscription |

Order-of-magnitude: **<$25/mo** until video volume says otherwise.

## 5. Risks

| Risk | Mitigation |
|---|---|
| Unapproved content reaches a channel | publisher refuses any item without merge + review artifact; CI gate on state-machine legality |
| Missed schedules (WP-Cron) | at-time publishing from our tick, not WP `future` status |
| Credential sprawl across 7 platforms | registry + catalogue parity CI gate; Secret Manager only; per-platform least privilege |
| Platform API drift (X pricing, Canva tiers) | verify-at-build items listed in §6; adapters read capability from `catalogue.json`, not assumptions |
| Legacy workspace contamination | `marketing/` has its own lockfile/toolchain outside `packages/*`; CI never runs legacy installs |
| Shared GCP project blast radius | no infra in Phase 1–2; any later addition: additive-only IAM, own network, ops_node_1 executes |
| Agent-fetched web/engagement content steering agents | injection posture: fetched text never triggers actions; publisher is non-LLM |
| Reviewer becomes bottleneck | whole item reviewable in one PR; cadence slides visibly; approval delegable per-series |

## 6. Verify-at-build checklist (facts that need one confirmation each)

- [ ] ops_node_1 estate report: WP VM state, PDS asset remnants, existing marketing secrets (requested, pending)
- [ ] Jetpack Social: LinkedIn connected to the **company page** (not a profile); current share-cap usage
- [ ] X pay-per-use unit prices in the developer console (third-party-sourced: $0.015/post, $0.20/link post)
- [ ] Canva plan tier (Pro vs Teams) + whether `update_autofill_field` tagging works below Enterprise (5-min live test on a scratch design)
- [ ] Instagram account type (business vs creator) and any linked Facebook Page
- [ ] Mastodon home instance choice for the brand account
- [ ] Grok Imagine current pricing at Phase-3 start
- [ ] Whether to defensively register `chipperbots.com`

## 7. Decisions requested (Cody)

1. **Content promotion model** — Editor copies scheduling-ready items into
   `marketing/content/` with provenance (recommended), vs publishing straight from
   project repos. One review surface vs zero duplication.
2. **Approval authority** — Cody-only at first, or per-series delegates (e.g., finance
   series needs its own eyes)?
3. **Jetpack Social paid upgrade** now (~$5/mo) vs ride the free cap until it binds.
4. **Cadence target** — plan assumes ~3/wk from backlog; confirm or set.
5. **X spend ceiling** — monthly credit cap for the X adapter.

---

*Sources: repo deep-reads (chippr-bots, prediction-dao-research), live probes of
chipprbots.com `/wp-json/`, live Canva MCP calls against this account, and current
platform docs (canva.dev, docs.x.com, developers.facebook.com, developers.tiktok.com,
docs.joinmastodon.org, docs.bsky.app, github.com/bluesky-social/pds). Full survey
detail in the PR description's research notes.*
