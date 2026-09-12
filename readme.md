# chippr-bots

Chippr Robotics' **brand-management and central-functions repo** — the home of the
marketing department (agents that run the blog → image → review → publish →
distribute flow), shared skills and prompts, asset-management tooling, and the
coordination surface for Chippr projects.

## What lives here

| Area | What it is |
|---|---|
| [`marketing/`](./marketing/) | The marketing department. Start with [`marketing/PLAN.md`](./marketing/PLAN.md) — landscape, agent roster, pipeline, phased rollout. |
| `.specify/` | [Spec Kit](https://github.com/github/spec-kit): constitution, templates, scripts. New functions are spec-driven (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`). |
| `.claude/skills/` | Shared agent skills (Spec Kit skills today; the common set grows here). |
| `specs/` | Per-feature Spec Kit artifacts (created as features land). |
| `packages/` | **Frozen legacy** (2019–2023 bridgette-era Yarn workspace). Prior art only — nothing new builds on it. `packages/compose/` remains the deployment convention reference. |

## Coordination

Chippr projects coordinate through this repo: concepts and campaigns are **issues**,
the work is **PRs** referencing them, and the GitHub Project board tracks flow. An
issue's state is its assignee, linked PRs, and open/closed.

## Ground rules

The constitution at [`.specify/memory/constitution.md`](./.specify/memory/constitution.md)
is binding; [`CLAUDE.md`](./CLAUDE.md) is the working guide for agents. Headlines:
one human gate on outbound content (CODEOWNER PR review — enforced by ruleset and
verified by the publisher), content is git, honest states everywhere, secrets only
in GCP Secret Manager, and the legacy workspace stays frozen.

## License

Apache-2.0 — see [LICENSE](./LICENSE).
