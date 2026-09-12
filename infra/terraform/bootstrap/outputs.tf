output "state_bucket" {
  description = "Name of the Terraform state bucket. Referenced by each root's backend.tf."
  value       = google_storage_bucket.tfstate.name
}

output "workload_identity_pool_name" {
  description = "Full pool resource name (projects/<number>/locations/global/workloadIdentityPools/<id>). Pass to modules/github-actions-identity as workload_identity_pool_name."
  value       = google_iam_workload_identity_pool.github.name
}

output "workload_identity_provider" {
  description = "Full provider resource name. Set as the WIF_PROVIDER repository variable; it is also the OIDC audience the publish workflow requests."
  value       = google_iam_workload_identity_pool_provider.github.name
}
