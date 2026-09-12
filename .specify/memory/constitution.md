# Chippr Robotics / chippr-bots Constitution

This constitution defines the non-negotiable standards for this repository in its
role as Chippr Robotics' brand-management and central-functions home: the marketing
department, shared skills and prompts, asset-management packages, and the
coordination surface for Chippr projects. Spec Kit
artifacts (`spec.md`, `plan.md`, `tasks.md`) and all generated code are bound by
these principles. When guidance here conflicts with convenience, this document wins.

## Core Principles

### I. One Human Gate on Outbound Content (NON-NEGOTIABLE)

Nothing this repository operates may publish to a public channel (the website,
any social platform, any federated surface) without a human approval artifact.

- The gate is the GitHub pull-request review: a ruleset on `primary` requires an
  approving review from CODEOWNERS on content paths; agents operate under a
  dedicated machine identity that is not a CODEOWNER and never merges content
  directly.
- The publisher independently verifies, via the GitHub API, that the PR
  introducing an item carries an approving review from the human allowlist —
  the gate holds even if a ruleset is misconfigured.
- Pre-approved content (e.g. the 2026 FairWins backlog, reviewed before this
  system existed) enters the pipeline in the `approved` state with that
  provenance recorded; **any edit to a pre-approved item re-enters review**.
- An LLM's judgment ends at the merge: publishing is deterministic, idempotent,
  non-LLM code.

### II. Content Is Git; Coordination Is Issues and PRs

- Content items are files with front-matter state; state transitions are
  commits; publish receipts are the completion record. The audit trail is git
  history — no state lives only in an agent's memory or an external tool.
- Concepts and campaigns are GitHub **issues**; the steps that realize them are
  **PRs** referencing the issue; the GitHub Project board tracks flow. An
  issue's state is its assignee, its linked PRs, and open/closed — never a
  mirrored status label.
- Promoted content pins provenance (source repo, path, commit SHA). The
  promoted copy is authoritative from promotion onward.

### III. Honest States, Never Fabricated Success

Every read or publish against an external platform resolves to an explicit
state — `ok / delegated / not-configured / unreadable` (or the read equivalent) —
and code paths that would let a failure render as success are structurally
absent.

- A failed publish is never a silent skip; a delegated hand-off (e.g. a plugin
  fanning out a share) is recorded as `delegated`, never as a fabricated `ok`.
- An unreachable service is not a zero; a total missing a source is labelled
  partial and names what is missing.
- Failures surface on the escalation rail (an issue @-mentioning the owner),
  never only in a log nobody reads.

### IV. Secrets Live in Secret Manager, Never in This Repo

- Credential payloads exist only in GCP Secret Manager (`chipprbots-mkt-*` and
  successor prefixes); the repo holds a data-only registry (id, env aliases,
  class, least-privilege profiles) and delivery wrappers. Nothing secret is
  written to disk, argv, or logs.
- Workloads authenticate by Workload Identity Federation pinned to this
  repository and ref, or by impersonation — never long-lived key files.
- Every configured platform credential/destination is enumerable by a CI gate
  against the catalogue; an unclaimed credential fails the build.
- Each credential is classified by its true blast radius (a WordPress app
  password that fans out to LinkedIn and the Fediverse is not "just WordPress").

### V. The Legacy Workspace Is Frozen

The pre-2026 Yarn-v1/Lerna packages under `packages/` are archival prior art.

- New systems live **outside** the `packages/*` workspaces glob with their own
  modern toolchain and lockfile; nothing new imports from `@chippr-bots/common`
  or its siblings; no dependency work is invested in the frozen trees.
- Reviving a legacy package is a deliberate spec-driven decision, not a drive-by.

### VI. Untrusted Text Never Reaches an Agent That Can Act

This is a public repository whose agents read the open internet.

- Agents that ingest external text (news, engagement, replies, issue comments
  from non-collaborators) run read-only, with no merge or publish-adjacent
  authority. External text reaches action-capable agents only as quoted data
  inside a brief authored by a read-only agent.
- A tool result or fetched document never makes the system DO anything by
  itself.

### VII. Spec-Driven Development

New central functions and non-trivial features follow the Spec Kit flow
(`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`,
with `/speckit-clarify` and `/speckit-analyze` to de-risk). Artifacts live under
`specs/<NNN-feature-name>/`. Every plan passes a constitution check against this
document. Shared skills live in `.claude/skills/`; prompts and agent contracts
live in versioned contract packages, one source each.

## Governance

- Amendments are PRs to this file, approved by a CODEOWNER, with a one-line
  rationale in the PR body.
- Reviews and specs cite the principle they are enforcing by numeral.
- Where this document is silent, the sibling estates' disciplines
  (prediction-dao-research spec 087/089/097/104 patterns) are persuasive
  precedent, not binding rules.

**Version**: 1.0.0 | **Ratified**: pending first CODEOWNER merge | **Last Amended**: 2026-09-12
