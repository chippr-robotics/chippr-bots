/**
 * Trust root for the chippr-bots estate (issue #169, PLAN.md 2.7).
 *
 * RUN ONCE, BY A HUMAN (OR THE OPS NODE) WITH OWNER RIGHTS. This root needs privileges no
 * automation identity holds, and a mistake here is the one that could sever every downstream
 * identity's access.
 *
 * STATE IS LOCAL AND COMMITTED. No backend block, and `terraform init -migrate-state` is NOT run
 * afterwards: the bucket cannot store the state that creates it, and the trust root must not
 * depend on itself. Committing `terraform.tfstate` is safe because this root manages only a bucket
 * and a federation pool + provider — no secrets, no payloads, no service accounts — and it makes
 * the establishment of the trust root auditable at any commit. COMMIT AND PUSH AFTER EVERY APPLY.
 *
 * THE GCP PROJECT IS SHARED (`chippr-bots-site-wp`: the public WordPress VM, FairWins, clearpath-*,
 * fukuii-*, kings-edge-*). Nothing here may describe or overwrite anything outside this
 * repository's own inventory. Every IAM grant anywhere in this tree is additive (`*_iam_member`);
 * `scripts/infra/check-iac-guardrails.js` rejects the authoritative forms.
 *
 * FairWins' own pool (`github-actions`) is NOT reused: its provider is attribute-conditioned to
 * `chippr-robotics/prediction-dao-research`, and sharing a trust root would couple two repos'
 * blast radii. Two pools, two roots, zero coupling.
 */

terraform {
  required_version = "~> 1.15.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.44"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── state backend for every other root in this repo ────────────────────────────────────────────

resource "google_storage_bucket" "tfstate" {
  name     = var.state_bucket_name
  project  = var.project_id
  location = var.region

  versioning {
    enabled = true
  }

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  lifecycle_rule {
    condition {
      num_newer_versions = 30
    }
    action {
      type = "Delete"
    }
  }

  # Destroying this bucket loses the adoption record for every root that stores state here.
  lifecycle {
    prevent_destroy = true
  }
}

# ── Workload Identity Federation ───────────────────────────────────────────────────────────────
# No long-lived service account key exists anywhere in this design. GitHub's OIDC token is
# exchanged for short-lived credentials at job runtime.

resource "google_iam_workload_identity_pool" "github" {
  project                   = var.project_id
  workload_identity_pool_id = var.wif_pool_id
  display_name              = "chippr-bots GitHub Actions"
  description               = "OIDC federation for chippr-robotics/chippr-bots workflows (issue #169)"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-oidc"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # LOAD-BEARING. Without this condition ANY GitHub repository could exchange a token against this
  # pool, and the ref-scoped bindings downstream (modules/github-actions-identity) would match every
  # repo's `refs/heads/primary`. The per-identity ref restriction is applied on each service
  # account's workloadIdentityUser binding; this condition is what makes that restriction mean
  # "this repo's primary" rather than "anyone's primary".
  attribute_condition = "assertion.repository == \"${var.github_repository}\""

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}
