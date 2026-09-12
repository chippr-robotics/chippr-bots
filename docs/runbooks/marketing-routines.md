# Runbook — marketing agent routines

The agents in `marketing/PLAN.md` §2.2 run as Claude Code **Routines** (scheduled cloud sessions).
Their role contracts live in `marketing/contract/prompts/*.md`; the routine prompt only points a
fresh session at the repo and that file, so behaviour changes are PRs to the contract, not edits to
a schedule.

| Routine | Schedule | Contract | Needs |
|---|---|---|---|
| **Marketing Editor (daily)** | `0 13 * * *` UTC, fresh session per fire | `contract/prompts/editor.md` | GitHub connector (opens content PRs, maintains the "Marketing schedule status" issue, dead-man's check on the publisher) |
| Writer | fired per item by the Editor (not a schedule) | `contract/prompts/writer.md` | GitHub connector |
| Designer | fired per item by the Editor | `contract/prompts/designer.md` | GitHub + Canva connectors |
| Strategist | weekly, **Phase 2** (issue #165) — not created yet | — | GitHub + web |
| Analyst | monthly, **Phase 3** (issue #166) — not created yet | — | GitHub + platform read APIs |

## Invariants the routines cannot break

- The Editor **never merges** a content PR and **never publishes**. A content PR is merged only by
  a CODEOWNER after review; the deterministic `marketing-publish` workflow is the only path to a
  channel, and it verifies that approval independently (constitution I).
- Routines act under a machine identity once #167 lands. Until then they act as the account that
  created them — which is why the Editor routine is created **disabled** and enabled only after
  #167 (bot identity + `primary` ruleset) so a human review can satisfy a required-review rule on
  routine-opened PRs.
- A routine that lacks its connector stops and says so; it never routes around a missing tool.

## Creating / enabling / pausing

**Create routines from claude.ai ▸ Routines, with the GitHub (and, for the Designer, Canva)
connector attached.** The Claude Code Remote API cannot attach connectors to a routine in this
organization (`create_trigger: the connectors parameter is not available for this organization`),
so a routine created from a session would spawn sessions with no GitHub tools — and the contract
tells such a session to stop, not to improvise. Prompt for the Editor: point the session at the
repo's `primary` branch and `marketing/contract/prompts/editor.md`, schedule `0 13 * * *` UTC,
fresh session per fire, push notification on.

Enable the Editor after: #177 merged, #169 applied (WIF outputs → repo variables),
`MARKETING_APPROVERS` set, and #167's ruleset in place. Pause it by disabling — never by deleting
(run history is the audit trail).

## Dead-man's semantics

With `MARKETING_LIVE=true`, the Editor expects a `marketing-publish` run within the last hour and
receipts advancing for every due item. No run, or due items with no receipt and no `missed slot`
record, is an incident: the Editor opens/updates "Marketing schedule status" and @-mentions the
owner. It never marks anything published on its own authority — receipts are the only proof.
