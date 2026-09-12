# Marketing root inputs (issue #169).

project_id     = "chippr-bots-site-wp"
region         = "us-central1"
default_branch = "primary"

# From ../bootstrap: `terraform output -raw workload_identity_pool_name`. The project NUMBER is
# resolved at bootstrap apply time; fill this in from the output, never by hand.
workload_identity_pool_name = "projects/000000000000/locations/global/workloadIdentityPools/chippr-bots-github"

# Mirrors marketing/secrets/registry.js exactly (marketing/check.js G6 fails on drift). Containers
# only — payloads are added per docs/runbooks/marketing-secrets.md.
secret_ids = [
  "chipprbots-mkt-wp-app-password",
  "chipprbots-mkt-mastodon-token",
]

# Pre-existing owner-managed containers (registry `preExisting: true`): granted, never created.
secret_accessor_secrets = [
  "chippr-social-bluesky",
]
