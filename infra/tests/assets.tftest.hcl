mock_provider "cloudflare" {}

run "preview_configuration" {
  command = plan

  assert {
    condition     = cloudflare_r2_bucket.assets.name == "dnd-records-assets"
    error_message = "Only the artwork bucket belongs in this stack."
  }
  assert {
    condition     = cloudflare_r2_managed_domain.assets.enabled
    error_message = "The domain-free preview needs a public development URL."
  }
  assert {
    condition     = toset(cloudflare_r2_bucket_cors.assets.rules[0].allowed.methods) == toset(["GET", "HEAD"])
    error_message = "Browser access must remain read-only."
  }
}

run "disable_development_access" {
  command = plan
  variables {
    enable_development_url = false
  }
  assert {
    condition     = !cloudflare_r2_managed_domain.assets.enabled && output.asset_base_url == ""
    error_message = "Disabling development access must also clear its advertised URL."
  }
}
