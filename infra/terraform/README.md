# infra/terraform

The marketing publisher's cloud footprint in the **shared** GCP project `chippr-bots-site-wp`
(issue #169, `marketing/PLAN.md` §2.7). Declarative, small, and applied by an operator from the
reviewed config — there is no automatic apply on merge yet.

| Root | State | Manages | Applied by |
|---|---|---|---|
| `bootstrap/` | local, **committed** | state bucket, WIF pool + provider (the trust root) | a human with owner rights, once |
| `marketing/` | GCS `chippr-bots-tfstate-chippr-bots-site-wp/marketing` | the publisher identity, its ref-restricted binding, the `chipprbots-mkt-*` secret containers, per-secret grants — via `chippr-tf-modules//modules/github-actions-identity` (SHA-pinned) | an operator / the ops node |

Deliberately absent: compute, networking, Cloudflare, secret payloads, CI plan/apply identities.

## Rules (enforced by `node scripts/infra/check-iac-guardrails.js`, CI job `infra-gates`)

- **IAM is additive only** — `*_iam_member`; the authoritative `_binding`/`_policy` forms strip
  other workloads' access in a shared project (G-01/G-02).
- **Never a secret version resource** (G-04) — containers and bindings only; payloads per
  `docs/runbooks/marketing-secrets.md`.
- **Protected types carry `prevent_destroy`** (G-06); **modules are SHA-pinned** (G-16);
  **literal names must match what this repo owns** (G-10 allow-list: `chippr-bots-*`,
  `chipprbots-mkt-*`, `github-oidc`).
- Roots use the GCS backend (`bootstrap` excepted, G-12) and commit their lockfile (G-13 warns until
  the first `init`).
- The `secret_ids` list in `marketing/terraform.tfvars` **must equal** `marketing/secrets/registry.js`
  — `marketing/check.js` (gate G6) fails CI on drift, because a missing grant otherwise surfaces
  later as `PERMISSION_DENIED`, which reads exactly like a broken login.

Add new modules in `chippr-robotics/chippr-tf-modules`, never under a local `modules/` here.
