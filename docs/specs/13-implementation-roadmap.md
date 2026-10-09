# Implementation roadmap

## Goal and current status

Build the Campaign Chronicle in small, reviewable vertical slices. The currently authorized slice is a local design preview with fictional demo material. Its existence does not imply that it has been completed or tested. Cloud infrastructure and publication remain later work.

## Confirmed direction

- The project is a public React, TypeScript, Vite application using HashRouter and GitHub Pages.
- Markdown with structured metadata is the content source; the frontend is static and has no backend or database.
- R2 stores optimized public assets. Terraform, GitHub Actions, and a separate R2 Terraform state bucket are selected.
- No server, database, CMS, authentication, or published/unpublished split is in scope initially.
- Local design preview and public GitHub repository implementation are authorized.
- Cloud infrastructure provisioning, paid image generation, asset publication, and deployment are not part of the current preview status and must be reported as unperformed until evidenced.

Recommended content layout uses Markdown/YAML records in per-kind `content/` directories, immutable `ses-`/`evt-`/`ent-`/`doc-`/`img-` IDs, `record:<id>` and `asset:<id>` references, deterministic session/event ordering, and generated runtime data. Local originals/candidates are gitignored. Exact file schema, directory paths, and JSON/index shape remain recommendations in [03-data-model.md](03-data-model.md) and [04-content-authoring.md](04-content-authoring.md).

## Recommended sequence

### Phase 0: Chronicle design preview

Goal: establish the main visual and content direction using fictional demo material.

Build the chronological, medieval/high-fantasy Chronicle with dramatic comic panels, narration, dialogue, and a couple of account presentations over shared events. Use Markdown in `content/accounts/` and `content/entries/` plus TypeScript types. Accounts carry an ID, title, format, and optional author; entries link to shared events. The event layer remains the shared source of history.

Acceptance: local preview communicates panel reading order and account perspective; demo material is clearly fictional; shared event links prevent account presentations from being treated as separate canon. Record any unfinished or unverified behavior as such.

### Phase 0.5: Review and settle full publishing contracts

Goal: resolve only the decisions required to start a small implementation; record remaining questions without blocking unrelated work.

Deliverables: reviewed specification set, initial content examples, and a short decision log. Confirm the intended project name/domain and initial representative content where needed.

Acceptance: model, claim distinctions, asset IDs, publish guard, and first release scope are internally consistent; open questions are labeled with an owner or a proposed default.

Recommended output of this gate is a short list of implementation-ready defaults, clearly separated from confirmed constraints. Do not delay compiler work for decisions about later visual flourishes or optional recovery automation.

### Phase 1: Content compiler and representative records

Goal: establish the durable source of truth and prevent broken content from reaching the UI.

Implement schemas and compiler for sessions, events, accounts, entries, entities, documents, and illustration metadata. Add deterministic ordering, cross-reference resolution, claim attribution, generated runtime records, and lightweight indexes. Seed a small set of representative records based on author-confirmed campaign facts.

Acceptance: valid fixtures compile deterministically; duplicate IDs, broken references, invalid chronology, malformed metadata, and unsafe rendered markup fail with actionable diagnostics. No invented campaign history is used as real content.

Recommended slice size: first compile one session, a few linked events, one entity, and one document; then add the remaining schema variants. This exposes relationships without needing to migrate a large archive.

### Phase 2: Reader experience

Goal: make the journal useful before introducing the full asset pipeline.

Extend the responsive reader with account-based Chronicle panels, event and entity detail pages, cross-links, basic search, and optional document presentation. Configure HashRouter for the GitHub Pages project path. Use approved public illustrations only where available.

Acceptance: a reader can navigate from session to event to entity, search representative content, and use core pages by keyboard and on a narrow mobile viewport. The production build serves correctly under a project subpath.

Recommended layout work should start with one polished session view and one entity view. Reuse typography, navigation, and claim presentation before adding separate presentation modes.

### Phase 3: Local artwork and asset pipeline

Goal: connect illustration metadata and locally reviewed images to the reader.

Implement the recommended `img-` records, manifest-based asset resolution, local preview, Sharp variants, deterministic hashed object keys, and the guarded upload/update workflow. Keep source originals out of Git. Before live infrastructure exists, exercise preparation and upload behavior with a mock S3-compatible endpoint or an upload adapter test double; this verifies request semantics without provisioning a bucket.

Acceptance: a local candidate can be previewed and optimized; mock upload tests verify keys, metadata, idempotent skips, and retry behavior; missing variants fail validation; existing remote assets are never deleted automatically. Live upload is deferred to Phase 4 after infrastructure exists.

The first slice should use one small image in a single role to validate all ID-to-manifest-to-URL steps. Add galleries and multiple display treatments after this basic path is dependable.

### Phase 4: Infrastructure and automated publication

Goal: establish inexpensive static hosting and repeatable deployment after the asset contract is proven locally.

Bootstrap the separate Terraform state bucket manually and verify backend and lock behavior. Manage the chosen R2 bucket/domain with Terraform where supported. Configure GitHub Pages through repository settings and GitHub Actions; it is not a Cloudflare Terraform resource. Add live asset upload, then Actions to verify referenced assets, build, and deploy the exact requested clean `main` SHA.

Before the first live publication, complete the minimum backup drill in [11-backup-recovery.md](11-backup-recovery.md): restore a Git bundle, recover/hash-check one original and one variant from independent disk, and inspect a private state snapshot. If infrastructure is not yet present, do the applicable repository/art checks first and rehearse state recovery against a disposable backend key once it exists.

Acceptance: state and asset storage are distinct; no credentials/state snapshots are committed or made public; an asset-reference change cannot deploy before remote verification; content-only builds work without local image files; the workflow does not generate paid images; and the initial backup drill is complete before public deployment.

Before enabling deployment, validate the workflow against a harmless test commit and inspect the build artifact and URL configuration. Keep manual provider setup notes alongside Terraform so a future recovery does not rely on remembered console clicks.

### Phase 5: Recovery and operational polish

Goal: make recovery understandable without adding a backup platform.

Repeat a small sample restore periodically and after changing the backup method. Polish repository recovery, restoration of local originals from the independent backup copy, re-publication of missing immutable R2 objects, and Terraform state recovery. Add optional CI original-fetch/optimization recovery only if it materially simplifies restoration and does not cause unexpected image generation or costs.

Acceptance: a documented recovery exercise can rebuild the site from Git and identify how to restore image sources and published variants. Avoid describing redundancy as an independent backup.

## MVP boundary

The design preview focuses on chronological comic panels, narration/dialogue, and account presentations over shared events. The later full release may add the compiler, claim-aware records, session/entity browsing, search, image optimization, asset verification, and GitHub Pages publication. A full comic-panel editor, advanced search, visual regression system, automated restoration, and large-scale gallery studio can follow when actual use demonstrates need.

## Dependencies and gates

The reader depends on stable generated JSON contracts. Asset publication depends on stable IDs and manifest rules. Automated deployment depends on verified R2 URLs and a reproducible build. Terraform setup depends on the manual state-bucket bootstrap and provider behavior review. Do not make a later phase a prerequisite for authoring and validating records in earlier phases.

Recommended phase gate: review the acceptance criteria and inspect the resulting artifact before moving to the next phase. Keep implementation changes small enough that a single author can understand and revert them.

At each gate, record decisions that changed, defects discovered, and any work intentionally deferred. This small log helps Codex and the author preserve context across sessions without introducing a project-management system.

Recommended working cadence is to stop after a usable slice, review it in the local browser, and adjust the next slice from observed friction. Avoid starting asset automation and advanced interface work in the same change; keeping each acceptance result attributable makes regressions easier to understand.

## Tradeoffs

This order delays automation until the source formats and asset workflow are demonstrated. It reduces rework in infrastructure and avoids coupling content authoring to external services. Early representative fixtures should cover real complexity without turning the first release into a generalized publishing platform. Scope can be adjusted after a phase exposes a concrete limitation.

## Risks to revisit at gates

- A schema that is too permissive can let contradictory or incomplete records accumulate; one that is too prescriptive can make routine authoring cumbersome.
- Hash-based routing and GitHub Pages base paths must be proven in the actual deployment build, not inferred from local root-path previews.
- Immutable hashed asset keys improve caching and make old references stable, but make accidental source replacement a new asset publication that needs manifest review.
- The author must retain a separate copy of originals if recovery from local loss is a goal; the Git repository and public R2 copy do not alone provide that source backup.

Review these risks using evidence from the current slice before adding infrastructure or process to address hypothetical cases.

## Related specifications

See [02-system-architecture.md](02-system-architecture.md), [03-data-model.md](03-data-model.md), [07-asset-management.md](07-asset-management.md), [08-infrastructure.md](08-infrastructure.md), [09-ci-cd.md](09-ci-cd.md), [10-testing-quality.md](10-testing-quality.md), and [11-backup-recovery.md](11-backup-recovery.md).
