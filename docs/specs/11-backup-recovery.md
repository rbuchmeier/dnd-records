# Backup and recovery

## Goal and decisions

Protect accumulated artwork and state with a small routine the DM can maintain and actually restore.

**Confirmed:** GitHub stores source/history; R2 stores artwork and Terraform state. Backups should be lightweight and cover originals, published variants, state, deletion, and rebuilding.

**Verified 2026-10-08:** The reviewed R2 S3 compatibility table does not document S3 bucket versioning or version-list/restore operations. No native object-version recovery is assumed in this design; treat overwritten/deleted bytes as unavailable unless independently preserved. This is a conservative operational conclusion from the documented API, not a claim that a recovery test was performed. [R2 S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/).

R2 offers prefix-based retention locks that prevent deletion/overwrite while in force. Administrators can change lock rules. Retention helps prevent accidents; it does not supply historical versions or protect against account loss. [R2 bucket locks](https://developers.cloudflare.com/r2/buckets/bucket-locks/).

## Recommended minimum routine

| Data | Primary copy | Independent protection | When |
|---|---|---|---|
| Source, prompts, manifests | GitHub plus working clone | Dated Git bundle including all branches/tags on external disk | After publication, at least weekly during active work |
| Selected originals | Local art directory and R2 `originals/` | Copy to independent external disk; retain every selected revision | At image selection, before discarding any local source |
| Published variants and prior keys | R2 `images/` | Additive download to disk, checksum inventory, no deletion mirroring | After publication or weekly, whichever is sooner |
| Terraform state | Private state bucket | Private dated snapshot on disk before and after state-changing operations | Every infrastructure change |
| Account/credential recovery | Credential manager | Existing independent recovery method and account recovery codes | On setup/rotation |

MVP recommendation: one external disk using existing local backup habits. Keep it disconnected outside backup/restore activity when practical. The author chooses a real destination before first publication; the project must not pretend an unset backup path is protection. A laptop copy plus R2 is useful redundancy, but same-account R2 copies or mirrors that propagate deletion are not independent backups.

Use an additive copy operation for remote assets, not a deletion-mirroring sync. Record full object keys, SHA-256, byte length, and copy time in a dated inventory. Compare new bytes to the selected manifests, and periodically hash older samples. Preserve old hashed keys even if the current manifest no longer references them. Keep dated Git bundles/state files instead of overwriting a single `latest` copy.

For a personal campaign, recommend retaining selected originals and deployed variants indefinitely until a deliberate storage review; retain each pre/post-change state snapshot. Report storage growth; do not schedule unattended pruning. Unselected candidate images are optional unless the author marks them worth keeping.

## Optional retention without breaking Terraform

Recommend discussing a 30-day R2 lock on `originals/` for additional accident protection. This is optional and does not replace the disk copy. If state snapshots are also copied into the private state bucket, lock only `snapshots/`; never lock live `state/` or `.tflock` objects. Terraform must overwrite state and delete its coordination lock. See [08](08-infrastructure.md).

The application assets bucket remains public, including originals. State and its backups remain private operational data. This separation does not introduce private DM content or unpublished asset buckets.

## Restore procedures

### Lost local checkout or broken website

Clone GitHub, or restore from the latest Git bundle if the repository is unavailable. Verify the selected commit and dependency locks, restore public configuration, install locked dependencies, validate content/manifests, verify remote objects, then build and publish. Local originals are not needed to rebuild a site whose assets still exist.

### Missing or damaged artwork

Resolve the missing object key from the relevant current or historical Git manifest. Find identical bytes on the disk backup or local art store; verify SHA-256, then restore the exact key with correct type/cache metadata and verify public delivery. A CDN cache hit is not proof the origin is restored. A wrong object at an expected hash key requires an explicit corrective operation; normal publishing refuses to overwrite it.

If only an original survives, regenerate derivatives with the recorded toolchain/configuration. If bytes differ, give them new hash keys, update the manifest, and publish a new source revision. Recover historical variant bytes directly where possible. Generating a similar image from a prompt is not recovery of the original artwork.

### Lost R2 account/bucket

Recover source from Git/disk and artwork from independent disk. Recreate asset infrastructure in a recoverable account, restore keys, set a new public origin if needed, and rebuild. The stable asset IDs need no narrative edits. Account credentials, custom domain ownership, and service setup are recovery dependencies, not items source code can reconstruct.

### Lost or corrupted Terraform state

Stop all infrastructure writers. Retrieve the newest valid private snapshot, inspect lineage/serial and resource IDs, and compare it with actual cloud resources. Restore to the designated backend using the documented Terraform state recovery process, without forcing lineage/serial checks casually. Run a refresh/plan and inspect differences before further changes. An older snapshot may predate created resources: import/reconcile those rather than applying a plan that recreates them. If no state snapshot survives, reconstruct via supported imports/manual reconciliation; unsupported import resources need special handling.

Live locks are not backup material. Restore a state snapshot, not a stale `.tflock`. Remove an abandoned lock only after confirming there is no active operator/process.

## Recovery expectations and acceptance

Recommended target: no loss of selected artwork once copied at selection; up to one week's unbacked remote/history changes if the routine was skipped; infrastructure state snapshots at every change. Aim to restore a sample site within a working session, not an uptime SLA. Document the last completed backup and drill date.

MVP acceptance: before first live publication, restore a Git bundle into a temporary directory, recover and hash-check one original and one variant from disk, and inspect a private state snapshot. Once infrastructure exists, rehearse state restoration against a disposable backend key, never the live state. Repeat a small sample restore every few months or after changing the backup method.

Tradeoff: a single local disk does not cover loss of both laptop and disk in the same incident. An optional second offsite copy improves that later; no elaborate backup service is required now.

Dependencies: [asset keys](07-asset-management.md), [state bootstrap](08-infrastructure.md), [publication](09-ci-cd.md), [quality gates](10-testing-quality.md).
