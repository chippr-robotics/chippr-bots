# CLAUDE.md — Working in chippr-bots

`chippr-bots` is Chippr Robotics' **brand-management and central-functions repo**:
the marketing department (agents that publish the blog and social channels), shared
skills and prompts, asset-management packages, and the coordination surface for
Chippr projects, which use this repo's issues and project board to coordinate
without hosting code here.

**The constitution at `.specify/memory/constitution.md` is binding.** Read it before
planning or implementing. The short version: one human gate on outbound content
(PR review — enforced, not promised); content is git, coordination is issues/PRs;
honest states, never fabricated success; secrets only in GCP Secret Manager; the
legacy workspace is frozen; untrusted text never reaches an agent that can act;
new functions go through Spec Kit.

## Repository map

- `marketing/` — the marketing department. **Start with `marketing/PLAN.md`** (the
  founding plan: landscape, agent roster, pipeline, phases). Self-contained modern
  workspace — its `package.json`/lockfile are independent of the legacy root.
- `.specify/` + `.claude/skills/speckit-*` — Spec Kit. New features:
  `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`;
  artifacts under `specs/<NNN-feature-name>/`.
- `.claude/skills/` — shared skills (grow the set here; one skill per directory).
- `packages/` — **FROZEN legacy** (2019–2023 Yarn-v1/Lerna workspace: bridgette bots,
  Kotti-era contracts, node:12 Dockerfiles, dead Jenkins CI). Prior art only. Do not
  run `yarn install` at the root, do not import from `@chippr-bots/*` legacy
  packages, do not add a `package.json` under `packages/` (the `workspaces` glob
  would capture it into the stale workspace). Exception: `packages/compose/` is the
  house deployment convention (env-var images, ALLCAPS services, external
  `chipprbackbone` network) if something deploys to the existing Docker host.

## Conventions

- Scope new packages `@chippr-bots/<name>`; one service = one package = one
  Dockerfile; all config via env vars; Apache-2.0.
- Node ≥20 for new code; npm with a committed lockfile per workspace;
  `npm ci --ignore-scripts` in CI; GitHub Actions pinned by commit SHA.
- Branch from `primary`; PRs into `primary`. Content PRs need a CODEOWNER review —
  that review IS the publish gate; never weaken it to get something out the door.
- A content PR is authored by the machine identity, never a human's account: an
  agent pushes a `content/**` branch and `marketing-content-pr` opens the PR as
  `github-actions[bot]` (a session or Routine pushes as the account that runs it,
  and GitHub forbids an author approving their own PR — never open one by hand).
  No agent ever merges a content PR.
- Coordination: a concept/campaign is an **issue**; work lands as **PRs** that
  reference it (`Part of #N` / `Closes #N`); the GitHub Project board reads issue
  state — never mirror status into labels.
- Credentials: never in the repo, `.env`s gitignored, payloads only in GCP Secret
  Manager under the registry in `marketing/secrets/` (or its successor).

## The marketing pipeline (orientation)

Topic → brief → draft → design (Canva brand templates) → **human PR review** →
merge → deterministic publisher (WordPress REST first, then platform adapters;
LinkedIn is delegated to Jetpack Social with read-back). Receipts are committed to
the `receipts` ref. The 78-item 2026 FairWins backlog
(`prediction-dao-research/docs/blog/`) is **pre-approved**: it enters the pipeline
as `approved` with that provenance; any edit re-enters review. Details, phases, and
the platform reality table: `marketing/PLAN.md`.

## What not to do

- Don't publish, post, or schedule anything from a session directly — the pipeline
  and its gate are the only path to a public channel.
- Don't "fix" the legacy packages (570 Dependabot alerts live there deliberately —
  frozen means frozen; the alerts are why nothing new builds on those trees).
- Don't add secrets, tokens, or platform credentials to any file, workflow, or
  test fixture.
- Don't create status labels, don't hand-move project cards that automation moves,
  and don't let an agent approve or merge a content PR.
