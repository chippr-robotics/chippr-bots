output "publisher_service_account" {
  description = "Set as the WIF_SERVICE_ACCOUNT repository variable on chippr-bots."
  value       = module.publisher_identity.service_account_email
}

output "publisher_allowed_principal" {
  description = "The exact principal set that may assume the publisher identity — diff in review."
  value       = module.publisher_identity.allowed_principal
}

output "publisher_readable_secret_ids" {
  description = "Everything the publisher can read. Must match marketing/secrets/registry.js."
  value       = module.publisher_identity.readable_secret_ids
}
