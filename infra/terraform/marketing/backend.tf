terraform {
  backend "gcs" {
    # Created by ../bootstrap. One prefix per root: a marketing apply cannot reach any other root's
    # state, and never FairWins' (a different bucket entirely).
    bucket = "chippr-bots-tfstate-chippr-bots-site-wp"
    prefix = "marketing"
  }
}
