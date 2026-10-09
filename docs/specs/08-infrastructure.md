# Infrastructure

## Goal and decisions

Provision the smallest infrastructure needed for public artwork and durable Terraform state. This document is a researched proposal; no account has been inspected, no resources created, and no remote backend tested.

**Confirmed:** GitHub Pages hosts the site; Cloudflare R2 hosts artwork; Terraform manages Cloudflare infrastructure; a separate R2 remote state bucket is required from the beginning. Credentials and state never enter the public repository.

## Verified documentation findings — 2026-10-08

| Topic | Finding and design consequence |
|---|---|
| R2 backend | Cloudflare documents Terraform's `s3` backend with its R2 endpoint, compatibility flags, and `auto` region. Its example embeds credentials and uses an older provider generation; adapt it rather than copy it verbatim. [R2 backend](https://developers.cloudflare.com/terraform/advanced-topics/remote-backend/) |
| Terraform locking | S3 backend locking is opt-in with `use_lockfile`; it uses a separate `.tflock` object requiring read/write/delete. [HashiCorp S3 backend](https://developer.hashicorp.com/terraform/language/backend/s3) |
| R2 conditional writes | R2 documents conditional `PutObject`, including `If-None-Match`. This supports the primitive needed by native S3 locks, but is not an end-to-end Terraform/R2 certification. [R2 compatibility](https://developers.cloudflare.com/r2/api/s3/api/) |
| Provider resources | Current Cloudflare provider documentation includes bucket, CORS, lifecycle, lock, managed-domain, and custom-domain resources. An older R2 example's claim that only buckets can be managed no longer describes current coverage. [Current R2 Terraform resources](https://developers.cloudflare.com/api/terraform/resources/r2/) |
| Imports | Current `cloudflare_r2_custom_domain` documentation says import is unsupported. Inspect import support for the pinned resource version before adopting existing resources. [Custom-domain resource](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/r2_custom_domain) |
| Retention | R2 bucket locks block overwrite/delete for selected prefixes and periods. This differs from Terraform mutual exclusion and from version history. [Bucket locks](https://developers.cloudflare.com/r2/buckets/bucket-locks/) |

**Recommended:** Pin a current tested Terraform release supporting native S3 locks and a tested Cloudflare provider 5.x release during implementation; commit `.terraform.lock.hcl`. Exact patch versions remain an implementation choice. Use `use_lockfile = true`, contingent on the mandatory compatibility test below. Do not silently disable locking or add DynamoDB.

## Recommended ownership

| Resource | Owner and policy |
|---|---|
| Private state bucket, e.g. `dnd-records-tfstate` | One-time manual bootstrap, documented outside the application's destroy lifecycle; no public domain or `r2.dev` access |
| Public assets bucket, e.g. `dnd-records-assets` | `cloudflare_r2_bucket`; `prevent_destroy = true`; no force-empty behavior |
| Asset custom domain | `cloudflare_r2_custom_domain` once the user selects a Cloudflare-managed domain/zone; wait for active TLS |
| Managed development domain | Disable in production through `cloudflare_r2_managed_domain` |
| CORS | `cloudflare_r2_bucket_cors` only if required; GET/HEAD and explicit website/local origins |
| Retention | Optional prefix-based `cloudflare_r2_bucket_lock` for originals and state snapshots, after reviewing retention duration |
| Asset objects | Upload tool, not Terraform resources |

Keep the bootstrapped state bucket manually owned in MVP to avoid a dependency loop. Record its name, endpoint, creation procedure, and protection settings in an operations note containing no secrets. This is the sole bootstrap exception to Terraform-managed infrastructure. Provider capability does not imply a need to use every resource; no automatic object-expiry lifecycle is proposed.

## One-time bootstrap runbook (future work)

1. Select a Cloudflare account, enable R2, and choose unique state/asset bucket names. Recommend the default jurisdiction; if a restricted jurisdiction is selected, use its matching endpoint.
2. Create the **private state bucket** using the Cloudflare dashboard/API before any application Terraform initialization. Confirm both public access methods are disabled. Do not create a temporary local-state-managed application stack.
3. Create a bucket-scoped state Object Read & Write credential; store access key/secret in the local credential manager. It must allow operations on the state and `.tflock` objects. Keep a separate infrastructure API token for bucket configuration.
4. Create `infra/backend.hcl` from a non-secret example with names/endpoint only. Supply secrets through `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in the Terraform process environment. Use `CLOUDFLARE_API_TOKEN` independently for the provider.
5. Run `terraform -chdir=infra init -backend-config=backend.hcl`. This initializes remote state from the first application operation. If a future migration is needed, back up and use the documented `init -migrate-state` process; `-reconfigure` alone does not migrate state.
6. Complete a disposable state-key compatibility test. Then inspect the real plan, take a state snapshot when state exists, and perform the separately authorized infrastructure apply in the implementation phase.
7. After provisioning, create separate asset upload/read credentials and configure GitHub Pages. These credentials cannot access the state bucket.

R2 supports bucket-scoped object credentials; management and data-plane permissions differ. [R2 authentication](https://developers.cloudflare.com/r2/api/tokens/).

Illustrative backend configuration; placeholders are not executable values:

```hcl
terraform {
  backend "s3" {}
}
# Separate backend.hcl (no credentials):
# bucket = "dnd-records-tfstate"
# key = "state/campaign/terraform.tfstate"
# region = "auto"
# endpoints = { s3 = "https://<account-id>.r2.cloudflarestorage.com" }
# use_path_style = true
# skip_credentials_validation = true
# skip_metadata_api_check = true
# skip_region_validation = true
# skip_requesting_account_id = true
# skip_s3_checksum = true
# use_lockfile = true
```

Compatibility flags follow Cloudflare's backend guidance; the lock option follows HashiCorp's backend contract. Credentials in backend flags/files may leak into local metadata/plans, so avoid them. Gitignore `.terraform/`, `*.tfstate*`, plan files, local secret variable files, and `.env*` except redacted examples. Plan/state snapshots stay private even though campaign content is public.

## Locking test and protection boundaries

**Unresolved operational validation, required before real state changes:** Against an isolated key in the state bucket, with the pinned Terraform version, verify initialization and state write/read; hold a first Terraform operation at its confirmation point; start a second and confirm it cannot acquire the same lock; finish/cancel the first and confirm lock cleanup and retry. Inspect failed-write/retry behavior and capture versions/results. Use a minimal built-in test resource so no application infrastructure is created by the test. Remove only the disposable test objects after confirming neither process is active.

R2 support for the needed conditional API makes lock compatibility a reasonable inference, not a tested fact in this specification. If the test fails, stop infrastructure work and investigate; do not proceed with unprotected concurrent state. A single operator and serialized infrastructure commands are an additional safeguard, not a lock substitute. Never force-unlock an active operation.

Do not put a retention rule over `state/` or its `.tflock`: live state must be overwritten and locks deleted. If retained state copies are desired, use `snapshots/<timestamp>-<sha>.tfstate` and restrict retention to `snapshots/`. `prevent_destroy` cannot protect against dashboard deletion, removed Terraform configuration, or compromised administration; independent backups remain necessary.

## Scope and acceptance

MVP: one public asset bucket, separate bootstrapped private state bucket, custom asset domain, narrow credentials, tested locking, and snapshots. Later: automate bootstrap/import only if the manual note becomes a burden; short-lived credential vending only if it reduces rather than increases operations.

Tradeoff: manual bootstrap is simple and prevents the stack from destroying its own backend; the one-time procedure must be retained. A custom domain adds domain setup but enables the intended production R2 delivery. No Worker proxy or backend is required.

Dependencies: [assets](07-asset-management.md), [credentials/publishing](09-ci-cd.md), [backup](11-backup-recovery.md). Acceptance: backend exists before application state; lock contention blocks a second writer; state has no public endpoint; planned bucket deletion is blocked; image URL works without credentials; state/asset credentials cannot be interchanged.
