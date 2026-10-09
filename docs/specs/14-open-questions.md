# Open questions and recommended defaults

## Goal and status

Make the consequential choices visible without turning a personal journal into a large planning exercise. The confirmed technology stack and public-content policy are not reopened here. Every default below is proposed, not already accepted.

## Review before implementation

| Decision | Recommended default | Why / alternative | Needed by |
|---|---|---|---|
| Granularity and historical claims | One file per event; structured claims only for consequential facts/testimony/clues | More traceable than session-only prose; extracting every sentence would be excessive | Content compiler |
| Chronology | Session number, then event order; free-text fantasy date | Preserves the order of play/discovery; a second in-world timeline can come later | Schema and navigation |
| Account entry IDs | Preview uses `entry-`, separate from entity `ent-` and account `acc-` | Resolved as an implementation convention on 2026-10-08 | Implemented in preview |
| Initial art direction | Medieval/high fantasy for the Chronicle panel preview; refine palette and references against demo material | Establishes the approved broad direction while leaving detailed style choices open | Preview implementation |
| Publish behavior with new art | Prepare/upload, then stop on source changes for ordinary Git review/commit/push | Explicit source ownership; an optional selected-files auto-commit mode would reduce the rerun | Publisher implementation |

The DM owns these editorial/product choices. The recommended defaults form a coherent implementation proposal; accepting some does not imply accepting all. Review is required by the handoff before application development, not before producing this specification set.

## Resolve when the relevant milestone starts

| Question | Default or next action | Owner / blocking boundary |
|---|---|---|
| Campaign name, visual identity, first content | Keep working title; obtain one actual session plus recurring character/location references | DM; real content and artwork, not synthetic compiler tests |
| Single campaign | One campaign in this repository | DM; multi-campaign routing only if scope changes |
| Asset domain/zone | Use `assets.<owned-domain>` on a Cloudflare zone | DM; production asset delivery. Domain purchase/change is not authorized by this spec |
| Repository owner/name | Use `dnd-records` provisionally; configure Pages base from final repo | DM; GitHub setup and deployment |
| Cloudflare names/jurisdiction | Dedicated asset/state names, default jurisdiction | DM + implementer; bootstrap; document any endpoint changes |
| Terraform/R2 lock compatibility | Pin versions; test contention, read/write, cleanup on isolated backend key | Implementer; before any real application state changes; no silent unlocked fallback |
| Image tool entitlement/output | Use native subscription-backed generation when active; inspect account usage and output persistence | DM + implementer; first image generation. No silent paid API fallback |
| Canonical reference selection | First entity `illustrationIds` entry is canonical; prompt captures exact revision keys | DM; recurring art; add a dedicated field only if needed |
| Backup destination and cadence | Existing external disk, selection-time originals, post-publish/weekly copies, per-change state snapshots | DM; first publication must have a successful sample restore |
| R2 retention | Optional 30-day `originals/` protection; state snapshots only, never live state/locks | DM + implementer; before enabling retention |
| Dependency versions | Pin supported compatible releases and lockfiles during implementation | Implementer; scaffold; docs do not claim untested combinations work |
| Performance budgets | Initial advisory targets in [10](10-testing-quality.md), then measure against sample content | Implementer; first reader benchmark |

All artwork in the asset bucket, including selected originals, is public. There is no unresolved secrecy decision. Cloud infrastructure management credentials and Terraform state remain private operational data.

## Decisions deliberately deferred

- Specialized letter skins, a local studio, and richer image comparison.
- In-world calendars, complex relationship visualization, and fuzzy/full-text search beyond measured needs.
- Multiple campaigns, live editing, and browser authoring: require new product needs, not speculative infrastructure.
- Additional image formats, short-lived R2 credential vending, and automated offsite backups: adopt only for a demonstrated benefit.

## Tradeoffs, dependencies, and acceptance

Choosing defaults now keeps the compiler and first reader small. Domain/account setup and real campaign samples can proceed at their own milestone; they need not delay schema review. Locking and backup validation cannot be deferred past live infrastructure/publication respectively.

Dependencies: [index/confirmed baseline](README.md), [data model](03-data-model.md), [art](06-art-generation.md), [infrastructure](08-infrastructure.md), [publishing](09-ci-cd.md), and [roadmap](13-implementation-roadmap.md).

Acceptance: when a choice is resolved, record the decision/date here and update its authoritative specification. Remove conflicting recommendations instead of leaving several alternatives described as implemented. Keep unresolved operational tests explicitly marked untested until evidence exists.
