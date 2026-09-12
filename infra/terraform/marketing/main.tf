/**
 * The marketing publisher's cloud footprint (issue #169, PLAN.md 2.7): ONE federated identity for
 * the `marketing-publish` workflow, the secret containers it reads, and nothing else.
 *
 * What is deliberately absent: compute (the publisher is a GitHub-hosted job), networking (nothing
 * joins the default VPC the WordPress VM sits on, nor FairWins' VPC), Cloudflare (the site's zone
 * is not managed from here), and CI plan/apply identities (this root is applied by an operator —
 * the ops node — from the reviewed config; automatic apply on merge is a later decision).
 *
 * Secret PAYLOADS are added out of band and never appear here — see
 * docs/runbooks/marketing-secrets.md. The container list is mirrored by
 * marketing/secrets/registry.js, and marketing/check.js fails CI when the two drift.
 */

module "publisher_identity" {
  source = "git::https://github.com/chippr-robotics/chippr-tf-modules.git//modules/github-actions-identity?ref=1c30916491981917612f9bc93a53223ebb8ec9de"

  project_id                  = var.project_id
  workload_identity_pool_name = var.workload_identity_pool_name

  # Only merged code publishes. A pull_request run presents refs/pull/N/merge and never matches.
  allowed_ref = "refs/heads/${var.default_branch}"

  service_account_id           = "chippr-bots-marketing-publisher"
  service_account_display_name = "chippr-bots marketing publisher (GitHub Actions)"
  service_account_description  = "marketing-publish.yml on chippr-robotics/chippr-bots@primary. Reads the chipprbots-mkt-* platform credentials and holds no project role. Issue #169."

  secret_ids = var.secret_ids

  # Owner-managed containers that pre-date this root (the Bluesky app password lives in
  # `chippr-social-bluesky`, user-managed replication — not adoptable by import without a
  # replacement, which prevent_destroy refuses). Read access is granted; the container is never
  # created, moved or destroyed from here.
  secret_accessor_secrets = var.secret_accessor_secrets

  # No rotating credential in Phase 1. X's OAuth2 refresh token (Phase 2) would be the first entry.
  secret_version_adder_secrets = []
}
