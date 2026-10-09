terraform {
  required_version = "= 1.16.5"

  backend "s3" {}

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "= 5.27.0"
    }
  }
}

# Read CLOUDFLARE_API_TOKEN from the process environment, never from state.
provider "cloudflare" {}

locals {
  account_id = "1cc8e0849274de00586869b1e28af330"
}

# The private state bucket is bootstrapped separately and intentionally absent
# from this stack: destroying the artwork stack must never destroy its backend.
resource "cloudflare_r2_bucket" "assets" {
  account_id    = local.account_id
  name          = "dnd-records-assets"
  storage_class = "Standard"

  lifecycle {
    prevent_destroy = true
  }
}

# Temporary public preview origin. Disable when a production custom domain is
# configured. r2.dev is rate-limited and is not a production CDN endpoint.
resource "cloudflare_r2_managed_domain" "assets" {
  account_id  = local.account_id
  bucket_name = cloudflare_r2_bucket.assets.name
  enabled     = var.enable_development_url
}

# Read-only browser fetch/canvas access; no browser uploads or credentials.
resource "cloudflare_r2_bucket_cors" "assets" {
  account_id  = local.account_id
  bucket_name = cloudflare_r2_bucket.assets.name
  rules = [{
    id = "webapp-read-only"
    allowed = {
      methods = ["GET", "HEAD"]
      origins = [
        "https://rbuchmeier.github.io",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:4173",
        "http://localhost:4173",
      ]
    }
    max_age_seconds = 3600
  }]
}

variable "enable_development_url" {
  description = "Expose the artwork bucket publicly through r2.dev for previews. Never enable on the state bucket."
  type        = bool
  default     = true
}

output "asset_bucket" {
  value = cloudflare_r2_bucket.assets.name
}

output "asset_base_url" {
  description = "Public value for VITE_ASSET_BASE_URL; empty when development access is disabled."
  value       = var.enable_development_url ? "https://${cloudflare_r2_managed_domain.assets.domain}" : ""
}
