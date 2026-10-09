# This isolated fixture exercises the same R2 backend without creating any
# Cloudflare resources. Always initialize with its dedicated state key.
terraform {
  required_version = "= 1.16.5"

  backend "s3" {}
}

resource "terraform_data" "locking_probe" {
  input = "dnd-records-r2-locking-probe-v1"
}

output "probe" {
  value = terraform_data.locking_probe.output
}
