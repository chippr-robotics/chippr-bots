# Runbook — marketing publisher credentials (issue #169)

What a human does, once, to take the publisher from dry-run to live. Everything Terraform can
declare is declared in `infra/terraform/`; this page is the part it deliberately cannot: secret
**payloads**, platform-side account actions, and repository variables.

Constitution IV: payloads live only in Secret Manager. Nothing below writes a secret to disk, a
shell history, or a chat.

## 0. Apply the roots (operator / ops node)

```bash
# once, with owner rights — local state, COMMIT terraform.tfstate afterwards
cd infra/terraform/bootstrap && terraform init && terraform apply
terraform output -raw workload_identity_pool_name   # -> paste into ../marketing/terraform.tfvars
terraform output -raw workload_identity_provider    # -> repo variable WIF_PROVIDER

# then the marketing root (GCS state; needs TF_MODULES_TOKEN with Contents:read on chippr-tf-modules)
git config --global url."https://x-access-token:${TF_MODULES_TOKEN}@github.com/".insteadOf "https://github.com/"
cd ../marketing && terraform init && terraform plan   # expect: 1 SA, 1 binding, 3 containers, 3 grants
terraform apply
terraform output -raw publisher_service_account      # -> repo variable WIF_SERVICE_ACCOUNT
```

Commit `bootstrap/terraform.tfstate` and both roots' `.terraform.lock.hcl` (the guardrail gate warns
until they exist).

## 1. Create the platform credentials

| Platform | Where | What to create | Least privilege |
|---|---|---|---|
| WordPress (`chipprbots.com`) | wp-admin ▸ Users | a **dedicated user** `marketing-bot`, role **Editor** (Author cannot create tags/categories over REST); then Profile ▸ Application Passwords ▸ name `marketing-publisher` | one user, one app password; revoke = delete the app password |
| Mastodon | Preferences ▸ Development ▸ New application | app `chippr-marketing-publisher`, scopes **`write:statuses`** only (add `read:accounts` for claim verification) | copy the access token |
| Bluesky | Settings ▸ App Passwords | name `chippr-marketing-publisher` | an app password, never the account password |

Also on the WP host (ops node, one-time): `define('DISABLE_WP_CRON', true)` in `wp-config.php` and a
system cron `*/5 * * * * curl -s https://chipprbots.com/wp-cron.php?doing_wp_cron` — Jetpack sharing
and ActivityPub delivery ride WP-Cron even though the publisher posts at-time.

## 2. Add the payloads (byte-exact)

Never pass a secret through `$(...)` (strips the trailing newline) or as an argv (visible in `ps`
and shell history). Paste from a prompt that does not echo:

```bash
read -rs WP_APP && printf '%s' "$WP_APP" | gcloud secrets versions add chipprbots-mkt-wp-app-password --project chippr-bots-site-wp --data-file=- && unset WP_APP
read -rs MASTO  && printf '%s' "$MASTO"  | gcloud secrets versions add chipprbots-mkt-mastodon-token  --project chippr-bots-site-wp --data-file=- && unset MASTO
read -rs BSKY   && printf '%s' "$BSKY"   | gcloud secrets versions add chipprbots-mkt-bsky-app-password --project chippr-bots-site-wp --data-file=- && unset BSKY
```

Verify readback length only, never the value:
`gcloud secrets versions access latest --secret chipprbots-mkt-wp-app-password | wc -c`.

## 3. Repository variables (Settings ▸ Secrets and variables ▸ Actions ▸ Variables)

| Variable | Value | Note |
|---|---|---|
| `WIF_PROVIDER` | bootstrap output `workload_identity_provider` | the OIDC audience; project **number**, not id |
| `WIF_SERVICE_ACCOUNT` | marketing output `publisher_service_account` | |
| `MARKETING_APPROVERS` | `realcodywburns` (comma-separated logins) | the publisher refuses items whose meta.json PR lacks an APPROVED review from this list |
| `WP_BASE_URL` | `https://chipprbots.com` | public config |
| `WP_USERNAME` | `marketing-bot` | public config |
| `MASTODON_BASE_URL` | the instance URL | public config |
| `BSKY_IDENTIFIER` | the brand handle (e.g. `chipprbots.com`) | public config |
| `MARKETING_LIVE` | **unset** until steps 0–3 are verified, then `true` | the second key; flips the cron from short-circuit to live |

## 4. First live run

1. `workflow_dispatch` `marketing-publish` with `MARKETING_LIVE` still unset → dry-run report shows
   every platform `dry-run`, approval reads succeed.
2. Set `MARKETING_LIVE=true`. The next tick verifies approval, publishes WordPress, then Mastodon and
   Bluesky with the real post URL, writes receipts to the `receipts` ref.
3. Read back: `git fetch origin receipts && git show origin/receipts --stat`; confirm the LinkedIn
   share landed via Jetpack (the receipt says `delegated` — go look).

## Rotation / revocation

Revoke at the platform (delete the app password / token), add the new payload as a new version,
disable the old version: `gcloud secrets versions disable <n> --secret <id>`. The publisher reads
`latest`. No workflow change, no redeploy.
