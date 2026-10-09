# Public configuration only. Credentials are supplied through the environment.
bucket = "dnd-records-tfstate"
key    = "state/campaign/terraform.tfstate"
region = "auto"
endpoints = {
  s3 = "https://1cc8e0849274de00586869b1e28af330.r2.cloudflarestorage.com"
}
use_path_style              = true
skip_credentials_validation = true
skip_metadata_api_check     = true
skip_region_validation      = true
skip_requesting_account_id  = true
skip_s3_checksum            = true
use_lockfile                = true
