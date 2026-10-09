# D&D Illustrated Campaign Chronicle — specifications

Status: **local design preview implemented**, using fictional demo material. It includes a three-chapter comic Chronicle, three additional account formats, search, transcripts, bookmarks, and generated sample artwork. The public source repository is [rbuchmeier/dnd-records](https://github.com/rbuchmeier/dnd-records). Cloud infrastructure, R2 uploads, and website deployment remain unimplemented. [initial-spec.md](../../initial-spec.md) remains the historical handoff and is unchanged. See the [project README](../../README.md) for working commands and current limits.

## How to review

Start with [product vision](01-product-vision.md), [data model](03-data-model.md), and [open decisions](14-open-questions.md). Then review the publishing and infrastructure contracts before beginning those implementation milestones.

- **Confirmed** means explicitly selected in the handoff or user request.
- **Recommended/proposed** means a default offered for review; writing it here does not record user acceptance.
- **Verified** identifies current behavior supported by linked official documentation, checked on the stated date. Documentation research is not a live account/integration test.
- **Open** means a user decision or an operational check remains. See [14](14-open-questions.md) for whether it blocks a milestone.

All illustrative people, places, dates, and events are fictional fixtures, not established campaign history. Commands, file trees, and schemas describe future implementation unless explicitly stated otherwise.

## Specification index

| File | Purpose |
|---|---|
| [01-product-vision.md](01-product-vision.md) | Audience, outcomes, scope, non-goals |
| [02-system-architecture.md](02-system-architecture.md) | Static components, compiler, data flows, routing |
| [03-data-model.md](03-data-model.md) | Records, identity, chronology, sourced claims |
| [04-content-authoring.md](04-content-authoring.md) | Markdown/YAML examples and editorial discipline |
| [05-frontend-ux.md](05-frontend-ux.md) | Reader flows, presentation, mobile and accessibility |
| [06-art-generation.md](06-art-generation.md) | Codex capability, references, style, revision loop |
| [07-asset-management.md](07-asset-management.md) | Image metadata, variants, hashing, preview, uploads |
| [08-infrastructure.md](08-infrastructure.md) | R2, Terraform backend/bootstrap, locking validation |
| [09-ci-cd.md](09-ci-cd.md) | Local-to-CI handoff, deployment, credentials, rollback |
| [10-testing-quality.md](10-testing-quality.md) | Validation, browser checks, performance, accessibility |
| [11-backup-recovery.md](11-backup-recovery.md) | Independent copies, restore procedures, state safety |
| [12-development-workflow.md](12-development-workflow.md) | Local setup, proposed commands, Codex collaboration |
| [13-implementation-roadmap.md](13-implementation-roadmap.md) | Small milestones, dependencies, acceptance gates |
| [14-open-questions.md](14-open-questions.md) | Decisions to review and recommended defaults |

## Confirmed baseline

| Area | Decision |
|---|---|
| Application | React, TypeScript, Vite, React Router HashRouter |
| Development and artwork | Local Codex; subscription-supported image generation where available |
| Source/content | Public GitHub repository; Markdown with structured metadata |
| Website | GitHub Pages, deployed through GitHub Actions |
| Artwork | One public Cloudflare R2 asset bucket; stable IDs; local preview |
| Infrastructure | Terraform, distinct R2 remote state bucket from the beginning |
| Image processing | Sharp unless a better alternative emerges |
| Scope | No backend, database, auth, CMS, MCP/tunnel, DM secrecy, or publication-status storage split |
| Editorial standard | Preserve established history; distinguish testimony, rumors, interpretations, and unknowns |
| Current work | Local design preview for the dramatic, medieval/high-fantasy Campaign Chronicle; public GitHub repository |
| Collaboration | Use lower-cost sub-agents where practical, with parent integration review |

## Proposed implementation contracts and operational decisions

1. Separate chronological accounts from shared events, with Markdown under `content/accounts/` and `content/entries/`; preview uses fictional demo material.
2. Main reader is the dramatic comic-panel Campaign Chronicle. Letters, field journal, and compendium/encyclopedia are optional account/section formats.
3. Build-time validation/compilation into static JSON, with record data and search loaded as needed.
4. One YAML manifest per illustration, immutable hashed R2 keys, every selected original retained, and no automatic deletion.
5. `npm run publish` prepares/uploads local artwork; if manifests change, review/commit/push then rerun to deploy the exact `main` revision.
6. Private manually bootstrapped state bucket; native S3 state locking only after a pinned-version compatibility test; independent state/asset backups.

## Research and remaining validation

Official documentation informed the art, R2, Terraform, and Pages specifications, with source links beside the claims. Native image generation produced the preview's three sample illustrations; no API fallback was used. Terraform/R2 locking remains a required live compatibility test before application infrastructure changes. The design assumes no native R2 version restore and specifies independent backups.

Full publishing readiness depends on the operational decisions in [14](14-open-questions.md). The design preview has passed its production build and five Chromium browser checks, including mobile layout. It does not implement the full historical record/claim compiler or production image pipeline. Account entries use `entry-` IDs, distinct from `ent-` entities. Small optimized demo illustrations are bundled for portability; selected large originals remain local and ignored by Git.
