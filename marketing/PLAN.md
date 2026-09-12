# Chippr Robotics Marketing Department — Founding Plan

Status: **Accepted — phased approach approved 2026-09-12** (rev 3) · Owner: Cody · Home: `chippr-bots/marketing/`
Scope: automate the blog → image → review → publish → distribute flow for all Chippr
projects, with agents doing every step except one human review gate.

Decisions taken (2026-09-12): the **GitHub PR + Actions process is the human gate**;
the **78 backlog posts are pre-approved** (they enter the pipeline as `approved`; any
edit re-enters review); a **GitHub Project** provides content management — issues track
concepts, PRs track the steps. Phase 0 widened: this repo becomes Chippr's core
brand-management and central-functions home (Spec Kit + shared skills + prompts +
asset-management packages), and the coordination surface for other Chippr projects
via the same issues/Project machinery. The repo's constitution now lives at
`.specify/memory/constitution.md`.

---

## 1. Landscape review (2026-09-12)

Evidence grades used below: **verified** = probed live this session; **probable** =
consistent secondary evidence, needs one confirmation (tracked in §6).

### 1.1 The distribution channel

- **The live site is `chipprbots.com`** (verified) — WordPress, on the shared GCP
  project `chippr-bots-site-wp` (default VPC, deliberately excluded from the FairWins
  Terraform estate). `chipperbots.com` is **unregistered** (NXDOMAIN, verified) —
  everything targets `chipprbots.com`; defensively registering the misspelling is a
  cheap optional (§7).
- **The WP REST API is exposed and ready** (verified): `https://chipprbots.com/wp-json/`
  answers with core `wp/v2` and advertises Application Passwords auth
  (`wp-admin/authorize-application.php`). An agent can create posts, upload media,
  assign taxonomy, and publish today with a dedicated WP service user. Role note:
  **Author cannot create categories/tags over REST** (`manage_categories` is missing) —
  the service user is either Editor-role, or Author against a pre-seeded fixed taxonomy
  that the pipeline only assigns. Decided in Phase 0.
- **Jetpack is installed** (verified: `jetpack/v4` namespace) — and that is *all* that
  is verified. The working assumption is that Jetpack Social is the current "wp app
  publishes to linkedin", which would mean we never need our own LinkedIn API approval
  (a vetted, weeks-to-months process for org posting). But plugin activation proves
  neither a WordPress.com connection, nor the Social module being enabled, nor a
  LinkedIn connection, nor page-vs-profile, nor free-cap headroom (~30 shares/mo, one
  shared caption; paid ~$5/mo lifts the cap and adds short per-network captions — not
  long-form bodies). The whole chain is **probable** and is verified as a Phase-1
  acceptance item (§6). The direct Community Management API is **deferred pending that
  test**, not declined.
- **ActivityPub plugin is active** (verified: `activitypub/1.0` namespace) — actual
  federation (WebFinger, actor config, delivery) is **probable** and gets a live
  follow-and-receive test in §6. Note its outbox delivery rides WP-Cron.
- **WP-Cron gets a real cron regardless.** Our publisher posts at-time
  (`status=publish`), which removes scheduled-post dependence on WP-Cron — but Jetpack
  sharing and ActivityPub delivery still run through it, so a low-traffic site needs
  `DISABLE_WP_CRON` + a system cron hitting `wp-cron.php` every 1–5 min. One-time
  change on the WP host (ops_node_1, Phase 0).

### 1.2 The content backlog — the surprise asset

`prediction-dao-research/docs/blog/` is a complete, unpublished content program:

| Series | Count | Audience | Lane runway at plan cadence |
|---|---|---|---|
| `posts/` | 36 | architecture/engineering | **18 weeks** at 2/wk |
| `knowledge/` | 21 | educational | 39 weeks at 1/wk (rotating) |
| `finance/` | 18 | business-finance | ″ |
| `features/` | 3 | members | **not metered** — time-sensitive, scheduled on their own logic |

Every item has `blog.md` **plus `social.md`** — X copy, LinkedIn copy, and a detailed
16:9 image prompt (written for a generative model). Inventories with per-topic scoring
and a suggested publishing order (04→12→15→06→29→25) exist. **The marketing team's
first job is publishing the backlog, not generating content.** Per the 2026-09-12
decision, **these 78 items are pre-approved**: promotion enters them at `approved`
with `review: pre-approved (2026 batch)` provenance — no per-item re-review; an
edited item re-enters review like net-new content. Three honest caveats:

1. The binding runway is the **engineering lane: ~18 weeks** — net-new generation must
   be producing publishable engineering briefs by **month 3–4**, not month 6.
2. The backlog's social copy covers **X and LinkedIn only** — Mastodon/Bluesky copy is
   net-new (light) Writer work per item.
3. The 78 image prompts are only usable once a generative image rail exists (§1.3,
   Phase 2 pulls Grok forward for exactly this reason).

### 1.3 Canva

- Account has **3 brand kits** (Chipprbots `kAFgdsz5WZQ`, Fairwins `kAG8zNcVnd0`,
  KingsEdgePoker `kAGwVS7HZX8`) and **zero usable brand templates** (verified live).
- The formal **Autofill API is Canva Enterprise-only**; the connected MCP server
  accordingly does not expose `autofill-design`. The intended production rail on the
  current plan is `create-design-from-brand-template → edit-design (replace_text /
  update_fill) → export-design` (24-h download URL). **Read-side verified live;
  the write path is unexercised** — there was no template to exercise it on — and
  whether `update_autofill_field` *tagging* is Enterprise-gated is unknown. So:
  - **Phase-0 gate**: a 5-minute scratch test — create-from-template → fill → export →
    fetch the URL — before anything is built on the rail.
  - **Tagging is decoupled from filling**: placeholder-text conventions +
    `find_and_replace_text` work on any plan tier; field tagging is an enhancement,
    not a dependency.
- `resize-design` bootstraps sizes from a master (then hand-tune) but stays out of the
  per-post hot path (it re-flows layout heuristically). Magic Studio generation is
  credit-metered and non-deterministic — ideation only. Commercial use of exports on a
  paid plan is clean (no watermarks; no stock elements standalone; no library content
  in logos).
- **Hero images are the one asset the Canva rail cannot make.** Fills require uploaded
  Canva assets; the backlog's prompts target a generative model. Resolution: Phase-1
  templates are **typographic** (headline/subhead/logo on brand fields — no per-post
  hero); Phase 2 brings Grok image generation forward (~$0.05/image ⇒ <$2/mo) to feed
  `hero_image` and unlock the 78 prompts.

### 1.4 Social platform reality

| Platform | Path | Friction | Cost | Prerequisite before launch |
|---|---|---|---|---|
| LinkedIn | Jetpack Social (**probable**, §1.1) | low if chain confirms | $0–5/mo | verify chain §6; paid plan is **required** if the backlog's LinkedIn drafts are to be used (free = one shared caption) |
| Mastodon | `POST /api/v1/statuses`, at-time | none | $0 | pick instance, mark account as bot |
| Bluesky | app password + `createRecord` vs bsky.social | none | $0 | DNS TXT `_atproto` → `@chipprbots.com` handle |
| X | API v2 pay-per-use | low | ~$0.20/link post | credits; **prefer OAuth 1.0a user context** (static creds — v2 posting accepts it) over OAuth2, whose single-use rotating refresh tokens break a stateless cron; if OAuth2, persist-then-use writeback (§2.4) |
| Instagram | Graph API, "Instagram Login" path | medium | $0 | business/creator acct; **try dev-mode first** (works for accounts with a role on the app) — App Review (~2–4 wks) only if actually required. **JPEG only** — IG renditions export as JPG |
| TikTok | Content Posting API | high | $0 | **audit before launch** — unaudited posts are locked private |
| Fediverse (bonus) | ActivityPub plugin | active (federation **probable**) | $0 | live follow test §6 |

All platforms publish **at-time** from our tick — including Mastodon (its native
`scheduled_at` returns a scheduled-status id, not a post URL, i.e. a second scheduling
model and a wrong-shaped receipt for nothing; noted unused in the catalogue).

### 1.5 Bluesky PDS decision

A self-hosted PDS is **not needed for anything in this plan**: posting works against
`bsky.social` with an app password, and the branded `@chipprbots.com` handle is a DNS
TXT record, not a server. The old `packages/compose/pds` stack (and whatever GCP assets
remain — live check requested from ops_node_1) stays **off**. Revisit self-hosting only
if data custody of the brand's AT Proto repo becomes a goal in itself (1 CPU / 1 GB /
20 GB VM + wildcard DNS). The floppy-keystore skill's `did atproto` tooling is available
if we later want a cryptographically anchored agent identity on AT Proto.

### 1.6 The chippr-bots repo (the new home)

Dormant Yarn-v1/Lerna-6 monorepo, last real activity 2023–2025. Deep-read verdict:

- **Nothing is runnable-reusable** (Node 12, Twitter v1.1, discord.io, Kotti testnet,
  Jenkins+Vault+Swarm CI that no longer exists; 570 open Dependabot alerts on
  `primary`, all from the frozen trees).
- **Three conventions worth keeping**: `@chippr-bots/<name>` scope; one service = one
  package = one Dockerfile, env-var-only config; the `packages/compose/<stack>` house
  style if anything deploys to the existing Docker host.
- **Prior art worth re-reading, not importing**: `bridgette-twitter`'s mode state
  machine; its `setInterval`-no-queue scheduler is the first thing we replace.
- **Hazards**: the `workspaces: ["packages/*"]` glob auto-captures any new dir with a
  `package.json` into the stale workspace — marketing lives **outside** `packages/`;
  the `packages/chippr-agi` gitlink is a broken submodule pointer; `dependabot.yml` is
  invalid; the only live CI is CodeQL; **`primary` is currently unprotected**
  (`"protected": false` — verified), which §2.5 fixes.
- **The repo is public.** So the calendar, in-review drafts, and rejection history are
  world-readable pre-publication (the backlog source repo is public too, so nothing
  new leaks — but launch-timed `features/` content loses embargo the moment it is
  promoted). Visibility is a named decision in §7; if it stays public, time-sensitive
  items are promoted late.

### 1.7 Patterns to import from the FairWins estate

- **Secrets (spec 097 shape)**: data-only registry (id / env aliases / class /
  least-privilege profiles), wrapper-injected child env, payloads only in GCP Secret
  Manager. Marketing prefix: `chipprbots-mkt-*`. The WP app password is classified for
  its true blast radius: it fans out to LinkedIn (Jetpack) and Fediverse distribution.
- **Honest states (specs 089/104)**: every platform read/publish resolves
  `ok / not-configured / unreadable / delegated` — a failed publish is never a silent
  skip; an unconfigured platform is not an error; no metric fabricates a zero.
- **Credential enumeration gate (FinOps C2b lesson)**: every configured platform
  credential/destination is enumerable by a CI check against `catalogue.json`.
- **One contract package** (`@chippr-bots/marketing-contract`): prompts, tool tables,
  honest-failure wording — the `@fairwins/assistant-contract` device.

---

## 2. Design

### 2.1 Principles

1. **One human gate — as a mechanism, not a convention.** The current flow has humans
   at every step; the target flow has exactly one — review/approval — and it is
   enforced by branch protection + independent publisher verification (§2.5), not by
   agents promising to behave. Nothing reaches a public channel without a human
   approval artifact that the publisher can check.
2. **Content is git.** Content items are files with front-matter state; the review gate
   is a pull-request review; the audit trail is git history.
3. **The pipeline is a state machine** with per-platform sub-state:
   item-level `idea → brief → drafted → designed → in-review → approved → published`
   (+ `parked`, `rejected`, `retracted`), where **`published` means the primary-channel
   (WP) receipt exists**; each social platform tracks its own
   `pending / ok / failed / delegated / not-configured` beside it. There is no
   item-level "publishing" state to wedge: a crashed run leaves per-platform claim
   markers (§2.4) that the next tick resolves. Rejection is recorded by a commit
   (close-with-state-change), not by a closed PR alone. `retracted` covers
   post-publish corrections: human-initiated, publisher-executed (WP update/unpublish
   + follow-up posts where a platform allows).
4. **Platform adapters behind one interface**, with capability declared in
   `catalogue.json`: formats (**including media type — e.g. IG is JPEG-only**), char
   limits, auth model + token lifecycle, scheduling model, receipt shape. Adding a
   platform = adapter + catalogue row + credential registry row; CI fails if any of
   the three is missing.
5. **Untrusted text never reaches an agent that can act.** The repo is public: anyone
   can open issues and comment on PRs. Capability separation, not vibes: Strategist
   and Analyst (the agents that ingest external text — news, engagement, replies) run
   with **read-only tokens** and no merge/publish-adjacent authority; the Editor
   ingests issue/PR-comment text only from collaborators (filtered by author
   association) — non-collaborator text reaches action-capable agents only as quoted
   data inside a brief authored by a read-only agent. Stated in the contract package.
6. **Mechanism note.** Review capacity is the scarce resource, so the pipeline
   optimizes for cheap rejection: the reviewer sees a finished post + renders +
   per-platform copy in one PR and approves or rejects in one act. Slippage is an
   implemented behavior, not a hope: the publisher skips due-but-unapproved items and
   records a missed-slot marker; the Editor's daily run reschedules missed items
   forward and maintains one standing schedule-status issue @-mentioning the reviewer
   with pending items and days overdue.

### 2.2 The agent roster (maps 1:1 onto the current 8-step flow)

All agents operate under a **dedicated machine identity** (bot account / GitHub App) —
never Cody's account — so human review rules can actually bind (§2.5).

| Agent | Replaces step | Job | Runs as |
|---|---|---|---|
| **Editor** (orchestrator) | — | owns calendar + state machine, assigns work, **opens** content PRs (never merges — §2.5), chases the gate via the schedule-status issue | daily Claude session (Routine) |
| **Strategist** *(Phase 2)* | 1–2 | watches project repos + digital-asset topics → briefs per audience; starts when net-new generation is needed (~month 3, engineering-lane exhaustion), not while the queue is full of perishable-input briefs nobody consumes | weekly Routine |
| **Writer** | 3 | brief → `blog.md` + `social.md`. Backlog mode: adapt existing drafts + add the missing Mastodon/Bluesky copy | per-item session |
| **Designer** | 4 | Canva rail: template by (brand, format) → fill → export renditions (JPG for IG); Phase 2+: Grok hero images via `upload-asset-from-url` | per-item session / script |
| **Reviewer** | 5 | **HUMAN** — approving PR review (the gate) | Cody / delegates |
| **Publisher** | 6–8 | on merge + due time: WP REST, then platform adapters per catalogue; two-phase publish + receipts (§2.4); LinkedIn delegated to Jetpack with read-back | deterministic worker (GH Actions cron) |
| **Analyst** *(Phase 3)* | — | engagement readback, spend catalogue (FinOps discipline), monthly report | scheduled Routine |

The Publisher is deliberately **not** an LLM: publishing is deterministic I/O and must
be idempotent, retryable, and boring. LLM judgment ends at the merge.

**Explicit scope boundary**: community management — replies, mentions, comments across
platforms — is **out of scope for Phases 1–3**. WP comments are closed or manually
moderated by Cody; platform accounts carry the bot flag where the norm exists.
Retraction/correction ownership: human-initiated, publisher-executed (roster above).

### 2.3 Repo layout (new, outside the legacy workspace)

```
chippr-bots/
  marketing/                  # self-contained modern workspace (npm, Node ≥20, TS)
    package.json              # its OWN workspace root + lockfile — never joins packages/*
    contract/                 # @chippr-bots/marketing-contract: prompts, tool tables, wording
    pipeline/                 # content model, state machine, calendar, receipts
    adapters/
      wordpress/  mastodon/  bluesky/  x/  instagram/  tiktok/
    studio/                   # Canva integration + template registry (brand × format → id)
    secrets/                  # registry.js (data only) + with-secrets wrapper (gcloud, no deps)
    content/
      calendar.json           # the schedule; single writer: Editor
      <YYYY>/<slug>/          # brief.md, blog.md, social.md, images/
    catalogue.json            # platforms, formats, credentials — CI parity gate reads this
  .github/workflows/
    marketing-publish.yml     # cron tick: publish approved+due, write receipts (to receipts ref)
    marketing-gates.yml       # PR checks: schema, state legality, catalogue/credential parity
```

- **Receipts live on a dedicated `receipts` branch**, not `primary`: they carry no gate
  authority, so the publisher's identity is scoped to that ref and never needs a
  branch-protection bypass on `primary` (a bypass for a workflow-editable job would
  collapse the gate to "anyone with write" — §2.5). "Published" state is *derived*
  from receipts, not a `primary` commit.
- **Promotion pins provenance**: front matter records source repo + path + **commit
  SHA** at promotion time; the promoted copy is authoritative from promotion onward
  and the source draft is frozen-once-promoted (review edits do not back-port).
  Content source stays with each project; one review surface, one state store.

### 2.4 Execution & scheduling

- **Publisher tick** (GH Actions cron, 15 min) hardened as follows:
  - `concurrency: { group: marketing-publish, cancel-in-progress: false }` —
    scheduled runs never overlap.
  - **Two-phase publish per (item, platform)**: push a claim marker to the receipts
    ref *before* the external call → post → push the receipt immediately
    (rebase-retry). A crash leaves a claim; the next tick **verifies via the platform
    API before retrying** — never a blind re-post. The receipt check before each call
    *is* the idempotency mechanism (WP `POST /posts` is not idempotent).
  - **Per-tick credential profiles**: fetch only the credentials for platforms with
    items due this tick — never the full set every 15 minutes.
  - Supply-chain: every action pinned by commit SHA; `npm ci` against the committed
    marketing lockfile with `--ignore-scripts`; the publish job runs in a GitHub
    environment restricted to `primary`; `pull_request`-triggered workflows get **no
    id-token and no secrets**.
  - **Token lifecycle** declared per adapter in the catalogue: X prefers OAuth 1.0a
    static user-context creds; any rotating token (X OAuth2, IG long-lived ~60-day)
    gets persist-then-use writeback — the SA holds `secretVersionAdd` on exactly those
    containers, the new refresh token is persisted *before* first use, and refresh
    failure surfaces as `unreadable` with a per-platform manual re-auth runbook.
  - **Observability**: any failed/partial tick files or updates a GitHub issue
    @-mentioning Cody (same rail as agent escalation); the Editor's daily run is the
    dead-man's check — it verifies the last expected tick ran and receipts advanced,
    which also catches GitHub's 60-day auto-disable of scheduled workflows in quiet
    repos.
  - **LinkedIn (Jetpack) honesty**: the leg is recorded `delegated`, a distinct state
    — never a fabricated `ok`. The publisher reads back Jetpack connection/share
    status and tracks cap usage, alerting before the free cap binds.
- **Agent sessions**: CCR Routines — Editor daily; Writer/Designer fired per item by
  the Editor; Strategist from Phase 2; escalation lands as an issue/PR comment
  @-mentioning Cody, never a silent stall.
- If a resident worker becomes necessary (webhooks, heavier media), the
  `packages/compose/marketing/` stack in house style — or a `marketing` role VM on the
  FairWins `fairwins-stack@<role>` pattern — is the pre-decided shape. Not Phase 1.

### 2.5 Enforcing the gate (the mechanism behind principle 1)

Today `primary` is unprotected and any write credential could push `approved` state
directly. Phase 0 installs, in this order:

1. **Machine identity**: agents act as a dedicated GitHub App/bot user with write
   access; Cody's account is never an agent identity (also: GitHub forbids a PR
   author approving their own PR — agent-opened PRs + human review only works when
   the identities are distinct).
2. **Ruleset on `primary`**: PRs required for all changes; ≥1 approving review from
   **CODEOWNERS** (`marketing/content/**` and `calendar.json` owned by Cody or
   per-series delegates); dismiss stale approvals on push; the bot identity is not a
   CODEOWNER and cannot satisfy the rule. Changes to
   `.github/workflows/marketing-*.yml` themselves require CODEOWNER review.
3. **Merge mechanics**: the Editor opens PRs and enables auto-merge; the merge happens
   only once the human approval lands. The Editor never merges directly.
4. **Independent verification**: the publisher does not trust the merge alone — before
   publishing an item it checks via the GitHub API that the PR introducing it carries
   an approving review from the human allowlist, and refuses otherwise. Belt and
   braces: the gate holds even if a ruleset is misconfigured.

### 2.6 Tracking: the GitHub Project (decided 2026-09-12)

Content management and cross-project coordination live on a GitHub Project board:

- **Issues are concepts**: a blog topic, a campaign, a phase epic, a coordination
  thread for another Chippr project. The Editor opens topic issues and
  keeps them current.
- **PRs are the steps**: draft, design, promotion, and pipeline changes land as PRs
  referencing their issue (`Part of #N`; `Closes #N` on the finishing PR — and read
  the issue back after merge rather than trusting the automation).
- **State is structural**: assignee = claim, linked PRs = progress, closed = done —
  no `status:*` labels (the sibling-estate lesson: a mirror drifts the moment an
  agent stops mid-task). GitHub's built-in Project workflows move items to Done on
  close/merge.
- One-time manual step: Projects v2 has no write API on our MCP toolset, so the
  board itself is created once in the UI (tracked as a Phase-0 issue) and issues
  are added there; everything after that is automatic or issue-driven.

### 2.7 GCP footprint (small, but real — declared, not clicked)

The secrets + WIF bootstrap **is infrastructure in the shared project** and follows
the imported spec-087 discipline rather than click-ops:

- A **marketing Terraform root** (own state prefix, module added to
  `chippr-robotics/chippr-tf-modules`, SHA-pinned) declares: the WIF pool/provider
  with `assertion.repository == "chippr-robotics/chippr-bots" && assertion.ref ==
  "refs/heads/primary"`, a dedicated minimal SA, and per-secret `_iam_member`
  accessor bindings on `chipprbots-mkt-*` containers only. Additive IAM only; never
  the default network; FairWins' WIF/state is untouched (its provider is
  attribute-locked to its own repo and its allow-list admits only `fairwins-*`).
- ops_node_1 executes/verifies the apply and the WP-host cron change — from the
  declared config, not ad hoc.

---

## 3. Rollout

### Phase 0 — Bootstrap: the repo's new life (widened 2026-09-12)

Phase 0 now prepares chippr-bots as **Chippr's core brand-management +
central-functions repo**, not just the marketing dir.

**Done in this PR:**
- Spec Kit installed: `.specify/` (templates, scripts, workflows) + the
  `speckit-*` skills in `.claude/skills/` — new central functions are spec-driven.
- **Constitution** written: `.specify/memory/constitution.md` (the gate, content-as-
  git, honest states, secrets, frozen legacy, injection posture, spec-driven dev).
- `CLAUDE.md` (agent working guide) + root `readme.md` rewritten for the new
  mission, including the cross-project coordination model.
- Hygiene: broken `chippr-agi` gitlink removed; `dependabot.yml` fixed (valid,
  scoped to new surfaces only — legacy stays frozen).

**Remaining Phase 0 (tracked as issues):**
1. **Gate mechanism** (§2.5): bot/App identity for agents, `primary` ruleset +
   CODEOWNERS file, workflow-file protection. Needs repo-admin action; precedes any
   publishing code.
2. **GitHub Project board** (§2.6): create in the UI, wire built-in workflows, add
   the phase epics.
3. Scaffold `marketing/` workspace + contract + pipeline skeleton + CI gates.
4. **GCP bootstrap** (§2.7): Terraform root, WIF, SA, `chipprbots-mkt-*` containers
   (WP app password first). WP service user: **Editor role** (or Author + pre-seeded
   taxonomy — decide with the WP admin). ops_node_1: apply + install the real
   `wp-cron.php` system cron.
5. **Canva write-path gate**: the 5-minute scratch test (create-from-template → fill →
   export → download). If tagging is Enterprise-gated, fall back to placeholder-text
   `find_and_replace_text` conventions — the pipeline shape is unchanged.
6. Shared skills/prompts inventory: pull in the other commonly-used third-party
   skills as they're identified; custom asset-management packages get spec'd through
   Spec Kit as they're needed (each is a `specs/<NNN>` feature, per constitution VII).

### Phase 1 — Primary channel + zero-friction socials (weeks 1–3)
1. **WordPress adapter** end-to-end: media upload → post create → at-time publish →
   receipt on the receipts ref.
2. **Jetpack/LinkedIn chain verification** (§6): WP.com connection → Social module →
   LinkedIn connection → page vs profile → cap usage; then **one live Jetpack→LinkedIn
   share as part of acceptance**. Decide paid Social (~$5/mo) — **required** if the
   backlog's LinkedIn drafts are to be delivered rather than a generic caption.
3. **Canva masters, minimum set**: blog-header/OG (1600×900 + 1200×630) for Chipprbots
   and Fairwins only — 2–4 typographic masters (no per-post hero yet). Every Phase-1
   platform renders link previews from the OG/featured image, so per-platform
   renditions have no consumer until Phase 2; placeholder/hand-made headers are
   acceptable for acceptance — **the test is the pipeline, not the artwork**.
4. **Mastodon + Bluesky adapters** (token + app password, at-time). Bluesky handle
   `@chipprbots.com` via `_atproto` DNS TXT. Bot-flag the accounts. ActivityPub live
   follow test (§6).
5. **Acceptance**: 2–3 backlog items in documented order (04→12→15→06→29→25), each as
   a content PR (post + renders + copy incl. net-new Mastodon/Bluesky lines) → human
   review → auto-merge → publish → receipts verified, including the LinkedIn
   `delegated` read-back.

### Phase 2 — Paid/reviewed platforms, images, steady cadence (weeks 3–10)
1. **X adapter**: credits purchased (routed through the same account as Grok for the
   up-to-20% xAI rebate); OAuth 1.0a user context preferred; unit prices verified in
   the console; `POST /2/media/upload` + `/2/tweets`.
2. **Instagram**: confirm account type; **dev-mode first** (brand account holding a
   role on the app) on the Instagram-Login path; App Review only if genuinely
   required. JPG renditions. Media from WP media URLs (public — qualifies).
3. **Grok images come forward**: hero images at ~$0.05/image via
   `upload-asset-from-url` into the Canva fill — this is what makes the backlog's 78
   image prompts usable. Per-platform template formats (X 1200×675, LinkedIn
   1200×627, IG 1080×1080/1350) authored now, beside the platforms that consume them.
4. **Cadence**: ~3 posts/week (2 engineering + 1 rotating knowledge/finance).
   Per-lane runway: engineering ~18 weeks — so **Strategist + net-new generation
   start by month 3**, timed to the engineering lane, not the aggregate. `features/`
   items are scheduled on their own (launch-timed) logic, promoted late while the
   repo is public.

### Phase 3 — Heavy platforms, video, measurement (month 3+)
1. **TikTok**: Content Posting API audit first (unaudited = private posts); until
   passed, optionally Upload-to-Draft. Verify chipprbots.com domain for
   `PULL_FROM_URL`. Story/TikTok 1080×1920 templates authored here.
2. **Grok video**: $0.08/sec (≤15 s clips) for TikTok/Reels/X short-form.
3. **Analyst**: engagement readback, spend per channel in a FinOps-style catalogue
   (every revenue/cost source declared or CI fails), monthly report.

### Explicitly deferred / declined
- **Self-hosted Bluesky PDS** — off; not needed for posting or the branded handle.
- **Direct LinkedIn Community Management API** — deferred pending the Phase-1 Jetpack
  chain test; applied for only if that rail fails to deliver.
- **Community management / replies** — out of scope Phases 1–3 (§2.2).
- **Reviving any legacy `packages/*` code** — prior art only.

---

## 4. Budget (steady state, ~12–16 blog posts/mo)

| Line | Est. | Basis |
|---|---|---|
| X pay-per-use | ~$3/mo (1 status per post @ $0.20) — ~$6–8/mo if threading (2–3 statuses/post; a content decision, §7) | modelled |
| Jetpack Social paid | $0 or ~$5/mo (required for per-post LinkedIn copy) | vendor price, verify |
| Grok images (Phase 2+) | ~$1–2/mo (@ ~$0.05/image) | modelled |
| Grok video (Phase 3) | ~$0.80/10 s clip, usage-based | modelled |
| Canva | existing plan (AI credits: ideation only) | — |
| Mastodon, Bluesky, IG, TikTok APIs | $0 | — |
| GH Actions publisher | $0 at public-repo rates (revisit if repo goes private — still ~free at this cadence) | — |
| Claude sessions (agents) | existing subscription | — |

Order-of-magnitude: **<$15/mo** through Phase 2; video volume is the first thing that
changes it.

## 5. Risks

| Risk | Mitigation |
|---|---|
| Unapproved content reaches a channel | enforced gate (§2.5): ruleset + CODEOWNERS + distinct bot identity + publisher-side review verification; receipts off `primary` so no bypass actor exists |
| Publisher workflow edited maliciously | workflow files under CODEOWNER review; publish job in `primary`-restricted environment; PR-triggered runs get no secrets/id-token |
| Double-posting / crash windows | concurrency group; claim-marker two-phase publish; verify-via-API before any retry |
| One compromised job = every platform | per-tick credential profiles; SHA-pinned actions; `npm ci --ignore-scripts`; WP app password classified for its Jetpack/ActivityPub blast radius |
| Silent publisher death (red runs, 60-day cron auto-disable) | failure issue @Cody per bad tick; Editor daily dead-man's check |
| LinkedIn silent skip (cap, dead connection) | `delegated` state + Jetpack read-back + cap alerting; never fabricated `ok` |
| Rotating tokens strand a platform | persist-then-use writeback on exactly the rotating containers; `unreadable` + re-auth runbook |
| Prompt injection via public issues/PR comments/news | capability separation (§2.1.5): read-only ingestion agents; author-association filter; non-LLM publisher |
| Missed schedules (WP-Cron) | at-time publishing; real system cron for Jetpack/ActivityPub delivery |
| Pre-publication content world-readable | named decision §7; `features/` promoted late while public |
| Legacy workspace contamination | own lockfile/toolchain outside `packages/*`; CI never runs legacy installs |
| Shared GCP project blast radius | declared Terraform (§2.7), additive IAM, repo+ref-pinned WIF, own state |
| Reviewer bottleneck | one-PR-per-item review; missed-slot markers + standing schedule-status issue (§2.1.6); delegable per series |

## 6. Verify-at-build checklist

- [ ] ops_node_1 estate report: WP VM state, PDS asset remnants, existing marketing secrets (requested, pending)
- [ ] **Jetpack chain, in order**: WP.com connection → Social module enabled → LinkedIn connection exists → page vs profile → current cap + usage → per-post REST fields (`jetpack_publicize_connections`/message) + real custom-message length → **one live share** (Phase-1 acceptance)
- [ ] **ActivityPub live test**: follow the blog actor from a Mastodon account, publish a test post, confirm delivery
- [ ] **Canva write path** (Phase-0 gate): create-from-template → fill → export → download; whether `update_autofill_field` tagging works below Enterprise
- [ ] X unit prices in the developer console ($0.015/post, $0.20/link post are third-party-sourced); OAuth 1.0a availability on the account
- [ ] Instagram account type (business vs creator), any linked FB Page, dev-mode posting with a role-holding account
- [ ] Mastodon home instance choice for the brand account
- [ ] WP service-user role decision (Editor vs Author+fixed taxonomy)
- [ ] Grok Imagine pricing at Phase-2 start
- [ ] Whether to defensively register `chipperbots.com`

## 7. Decisions

**Decided 2026-09-12** (Cody): the phased approach; GitHub PR + Actions as the human
gate; the 78 backlog posts are pre-approved (edits re-enter review); a GitHub Project
for content management (issues = concepts, PRs = steps); Phase 0 widened to prepare
the repo as the brand-management/central-functions home with Spec Kit + shared
skills, coordinating other Chippr projects here.

**Still open:**

1. **Repo visibility** — keep `chippr-bots` public (pre-publication calendar/drafts
   world-readable; accepted for evergreen content, `features/` promoted late) or go
   private (forfeits nothing material; Actions still ~free).
2. **Approval authority** — Cody-only at first, or per-series CODEOWNER delegates.
3. **Jetpack Social paid** (~$5/mo) — required if the backlog's LinkedIn drafts are to
   be used as written; confirm with the chain test.
4. **Cadence + X threading** — ~3/wk assumed; is one X status per post enough, or
   threads (2–3×, prices the X line at ~$6–8/mo)?
5. **X spend ceiling** — monthly credit cap for the adapter.

Default assumed unless redirected: the Editor promotes scheduling-ready items into
`marketing/content/` with SHA-pinned provenance (promoted copy authoritative) rather
than publishing straight from project repos — it is what makes the PR gate and the
Project board the single surface.

---

*Sources: repo deep-reads (chippr-bots, prediction-dao-research), live probes of
chipprbots.com `/wp-json/`, live Canva MCP calls against this account, GitHub API
(branch protection state), and current platform docs (canva.dev, docs.x.com,
developers.facebook.com, developers.tiktok.com, docs.joinmastodon.org, docs.bsky.app,
github.com/bluesky-social/pds). Rev 2 incorporates a three-critic adversarial review
(API reality / security-ops / mechanism); the survey and critique transcripts live in
the session record.*
