# Bootstrap inputs (issue #169). This root runs ONCE, with owner rights, and its state is LOCAL and
# committed — it manages only the state bucket and the federation pool + provider.

project_id        = "chippr-bots-site-wp"
region            = "us-central1"
state_bucket_name = "chippr-bots-tfstate-chippr-bots-site-wp"
wif_pool_id       = "chippr-bots-github"
github_repository = "chippr-robotics/chippr-bots"
