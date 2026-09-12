variable "project_id" {
  description = "GCP project hosting the estate. SHARED — see bootstrap/main.tf."
  type        = string
}

variable "region" {
  description = "Default provider region."
  type        = string
  default     = "us-central1"
}

variable "workload_identity_pool_name" {
  description = "Full pool resource name from `terraform output -raw workload_identity_pool_name` in ../bootstrap."
  type        = string
}

variable "default_branch" {
  description = "Branch whose workflow runs may impersonate the publisher identity."
  type        = string
  default     = "primary"
}

variable "secret_ids" {
  description = "Secret Manager containers for the publisher's platform credentials. MUST equal the ids in marketing/secrets/registry.js — marketing/check.js gates the parity."
  type        = list(string)
}
