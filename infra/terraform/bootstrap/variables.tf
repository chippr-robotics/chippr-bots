variable "project_id" {
  description = "GCP project hosting the estate. SHARED with unrelated Chippr workloads — every grant in this repo is additive and resource-scoped for that reason."
  type        = string
}

variable "region" {
  description = "Region for the state bucket."
  type        = string
  default     = "us-central1"
}

variable "state_bucket_name" {
  description = "Globally unique name for the Terraform state bucket used by every other root in this repo."
  type        = string
}

variable "wif_pool_id" {
  description = "Workload Identity Pool id for this repository's GitHub Actions federation. Distinct from FairWins' pool on purpose."
  type        = string
  default     = "chippr-bots-github"
}

variable "github_repository" {
  description = "owner/repo permitted to federate against the pool. Without this restriction any GitHub repository could exchange a token."
  type        = string
  default     = "chippr-robotics/chippr-bots"
}
