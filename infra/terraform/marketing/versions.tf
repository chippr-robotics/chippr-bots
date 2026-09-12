terraform {
  # Pinned so the same commit produces the same plan on any machine.
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
