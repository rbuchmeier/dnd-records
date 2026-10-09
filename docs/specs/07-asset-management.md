# Asset management

## Goal and decisions

Keep thousands of illustrations manageable without adding image binaries to Git or breaking historical links.

**Confirmed:** One public R2 asset bucket, stable IDs independent of URLs, local previews, optimization with Sharp by default, originals retained where appropriate, no automatic remote deletion and no publication-status storage split.

**Recommended:** Retain every selected original. Use immutable SHA-256 object keys for both originals and display variants. Keep authored text plus prepared asset metadata together in one YAML file per image; compile a smaller runtime manifest. Prefixes distinguish file purpose, not public/private or draft/published status.

## Identity and manifest

`img-` identifies an illustration across revisions. A key identifies immutable bytes. Changing selected artwork increments `selectedRevision` and updates keys; older Git revisions continue pointing to their original bytes. Alt-text changes alone require no image upload.

Proposed manifest fragment (fictional, hash placeholders must be replaced by full lowercase 64-character SHA-256 values before validation):

```yaml
schemaVersion: 1
id: img-reed-ford-dusk
selectedRevision: 1
description: A watercolor view of the ford at dusk.
alt: A keeper stands beside a bell overlooking a river crossing.
relatedIds: [evt-001-bell-warning, ent-reed-ford]
promptPath: art/prompts/img-reed-ford-dusk-r1.md
referenceImageIds: []
generatedAt: '2026-10-08T18:00:00Z'
tool: null
model: null
original:
  key: originals/<original-sha256>.png
  sha256: <original-sha256>
  width: 1536
  height: 1024
variants:
  - key: images/<output-sha256>.webp
    sha256: <output-sha256>
    width: 960
    height: 640
    format: webp
    bytes: 123456
```

Required fields and cross-reference types match [03](03-data-model.md). Empty arrays are allowed; `tool`/`model` are null when unavailable. `generatedAt` is nullable for imported art with unknown generation time; add provenance in the prompt/source record rather than inventing a timestamp. `promptPath` may point to an import-provenance Markdown file when there was no prompt. `alt` must describe meaningful artwork; a decorative usage may explicitly supply empty alt in the component without changing the image's canonical description.

Authored fields are edited by the DM/Codex. Preparation updates only `original` and `variants`; never rewrites descriptions, selected revision, or references silently. Compute a preparation fingerprint from original SHA, canonical resize/encoding configuration, and Sharp/libvips versions. Persist this as optional `preparationFingerprint` in the YAML to detect stale preparation. The derivative key hashes actual output bytes, not the fingerprint. A toolchain change only requires reprocessing when deliberately requested.

Build the production manifest from selected variants and descriptions; omit prompts, local paths, and original downloads unless a view needs them. The repository and bucket are public nonetheless; omission is payload management, not secrecy.

## Local sources and previews

Store original/candidate files under `.local/art/<img-id>/r<revision>/` and derivatives in `.local/assets/`. A gitignored `.local/asset-overrides.json` maps image IDs to contained local files for Vite preview. Reject absolute paths, traversal, and files outside those directories. Local overrides are never committed or copied to the production bundle.

During authoring, a new manifest may lack `original`/`variants`; preview uses the override and shows a preparation warning. Publish validation requires complete prepared metadata for every selected illustration. This is a validation mode, not a publication status field or separate storage system. A clean clone can read existing public assets and build without downloading originals.

## Recommended image preparation

1. Read the selected original; verify supported raster type and dimensions. Preserve its bytes as the original.
2. Apply orientation, convert derivatives to sRGB, strip unnecessary metadata, and resize without enlargement.
3. Generate WebP plus JPEG fallback for opaque images; use WebP plus PNG for transparency. Start with widths 320, 640, 960, 1440, and 1920, clamped to source size and deduplicated. Portraits need only widths used by their layouts. Recommend quality 80 WebP and 82 JPEG; tune against real art before freezing the configuration.
4. Record actual dimensions, format, byte count, hash, and key. Validate decoded outputs. AVIF is a later option after measuring CPU cost and savings.
5. Use `<picture>`, `srcset`, `sizes`, explicit dimensions, and lazy loading for offscreen artwork; eagerly load only the visible lead image. Let the browser choose the rendition.

Sharp supports these output encoders and quality controls; availability is confirmed at dependency installation. [Sharp output documentation](https://sharp.pixelplumbing.com/api-output/).

## Idempotent storage and caching

For each original/variant referenced by the selected manifests, use bounded-concurrency S3 `HEAD` checks. Skip matching objects, comparing stored `sha256` custom metadata and length rather than assuming an ETag equals SHA-256. Where metadata is missing or suspicious, fetch and hash the object. Upload absent bytes with `If-None-Match: *`; if another uploader won, recheck. A hash/key mismatch fails; never overwrite different bytes at an existing immutable key. R2 documents conditional `PutObject` support. [R2 compatibility](https://developers.cloudflare.com/r2/api/s3/api/).

Set correct `Content-Type` and `Cache-Control: public, max-age=31536000, immutable` for hashed images. Production URL = configured asset origin plus validated encoded key. Manifest changes ride with a new website build; the asset bucket has no mutable `latest.json` dependency.

A custom asset domain is recommended for production; `r2.dev` is development-only and rate-limited. Configure GET/HEAD CORS only if JS fetch or canvas usage needs it; ordinary cross-origin `<img>` display does not require CORS. Never interpret CORS as access control. [Public R2 delivery](https://developers.cloudflare.com/r2/buckets/public-buckets/).

## Scale, tradeoffs, and acceptance

MVP uploads missing originals and derivatives before deploying references. Keep upload receipts locally for diagnostics, but verify remote availability during CI. Originals can outweigh all web variants; report total bytes/object count during preparation and periodically review account usage. Do not promise a fixed monthly bill or add an image transformation service.

Later: optional format tuning, reference comparison studio, and an explicit orphan report. An orphan report never deletes data; historical Git manifests may still need old images.

Dependencies: [art](06-art-generation.md), [infrastructure](08-infrastructure.md), [CI/CD](09-ci-cd.md), [recovery](11-backup-recovery.md). Acceptance: repeating preparation produces no metadata churn; repeating upload performs zero writes; deleting a required remote variant blocks deploy; clean-clone build works without local art; changing origins leaves content files untouched; original selection and historical revisions remain recoverable.
