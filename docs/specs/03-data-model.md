# Data model

## Goal and status

**Confirmed from the project handoff:** The public journal uses Markdown with structured metadata. Sessions, individual events, persistent entities, documents, and illustrations share stable references. The record distinguishes established facts, character statements, rumors, interpretations, and unknowns. Later discoveries may add context; Codex must not invent established campaign history. There is no initial database or access control.

**Current preview contract:** Separate shared events from accounts that present them. Accounts are chronological presentations, not independent copies of canonical events. The local design preview uses Markdown under `content/accounts/` and `content/entries/`, TypeScript types, and fictional demo material. This preview contract does not establish the full compiler or publishing pipeline. Every example is a fictional fixture.

The implemented preview schema lives in `src/lib/content.ts`: accounts select a format, and entries contain `accountId`, account-local `order`, display dates, prose, and ordered image/narration/dialogue panels. It validates schema versions, duplicate IDs, account references, and ordering. Canonical event IDs, claims, and stable illustration manifests below remain planned; the demo entries do not yet link to an event graph.

## Files and identity

| Record | Recommended path | ID prefix | Purpose |
|---|---|---|---|
| Session | `content/sessions/<id>.md` | `ses-` | Real-world play and recap |
| Event | `content/events/<id>.md` | `evt-` | One significant occurrence |
| Account | `content/accounts/<id>.md` | `acc-` | Chronological perspective/presentation over shared events |
| Entry | `content/entries/<id>.md` | `entry-` | An account's narration, dialogue, or panel content; shared event linkage follows in the full model |
| Entity | `content/entities/<id>.md` | `ent-` | Person, creature, group, place, or object |
| Document | `content/documents/<id>.md` | `doc-` | Letter, report, journal, prophecy, or other artifact |
| Illustration | `content/illustrations/<id>.yaml` | `img-` | Artwork metadata and asset selection |

**Recommended:** All files have `schemaVersion: 1`; IDs are globally unique, lowercase, readable kebab-case, immutable after publication, and identical to the filename stem. Names and titles may change without changing IDs. A removed record ID is never reused. The compiler creates a single ID index and rejects duplicate IDs, mismatched filenames, missing targets, and unsupported schema versions.

## Shared narrative fields

| Field | Recommended rule |
|---|---|
| `schemaVersion` | Required integer, initially `1` |
| `id`, `title` | Required nonempty strings |
| `summary` | Optional plain-text one or two sentence search/list excerpt; body may be richer |
| `links` | Optional array of `{ relation, targetId }`; relation is a controlled value and target is another narrative record ID |
| `illustrationIds` | Optional ordered array of illustration IDs; gallery order follows this array |
| `claims` | Optional array of atomic sourced claims; see below |
| Markdown body | Presentation text, not the only place important searchable facts live |

**Recommended relations:** `features`, `occurs-at`, `involves`, `mentions`, `discovered-in`, `contains`, `follows`, `reveals`, and `contradicts`. The relation describes the source record's view of the target. Relationships need only be authored once; reverse backlinks and cross-reference counts are derived at build time. Validation rejects unsupported relations and self-links. `reveals` and `contradicts` connect a later event or document to the earlier record; they do not alter the earlier event's place in history.

## Record-specific fields and ordering

| Record | Recommended required metadata | Recommended optional metadata |
|---|---|---|
| Session | `number` (positive integer) | `playedOn` (real-world ISO date) |
| Event | `sessionId` (session ID), `order` (positive integer within session) | `inWorldDateText` (unparsed display text) |
| Entity | `kind` | `aliases` (string array) |
| Document | `documentKind` | `foundInEventId` (event ID), `attributedToId` (entity ID) |

**Recommended:** Session numbers are unique and need not be contiguous. An event belongs to one session; `(sessionId, order)` is unique. The canonical chronology sorts by session `number`, then event `order`. The optional `playedOn` is a real-world play date, not a sorting key. A fantasy calendar is neither required nor parsed in MVP. Unknown dates, flashbacks, and stories about older events can be described in prose and cross-linked without corrupting the order in which the party learned them. A later enhancement can add a separate in-world timeline with explicit uncertainty.

**Recommended entity kinds:** `player-character`, `npc`, `creature`, `faction`, `organization`, `location`, `item`, `historical-figure`, `other`. `documentKind` is initially free text so an unusual artifact does not require a schema change. Kind controls filtering, not page access or truth.

## Claim-level historical accuracy

**Recommended claim fields:**

| Field | Rule |
|---|---|
| `id` | Required immutable, globally unique `clm-` ID |
| `text` | Required single proposition in plain text |
| `status` | Required: `fact`, `statement`, `rumor`, `interpretation`, or `unknown` |
| `sourceIds` | Required array of event, session, or document IDs supporting where the information entered the record; may be empty only for `unknown` |
| `assertedById` | Required entity ID for every `statement`; optional for `rumor`; otherwise omitted |
| `correctsClaimId` | Optional older claim ID when correcting an editorial error |
| `clarifiesClaimIds` | Optional array of older claim IDs explained by a later discovery |

**Recommended semantics:** `fact` means the DM has established the proposition as campaign history; a source citation alone never upgrades a proposition to fact. `statement` records what a character said, without endorsing its content. `rumor` is unverified circulating information, even if an origin is known. `interpretation` is an inference drawn by a character or editor. `unknown` preserves a question or explicitly missing information. `sourceIds` are provenance to records, not a proof of truth. The claim owner gives additional context, but cross-record provenance stays explicit. A source record can be the containing record itself.

**Recommended correction rule:** If an editor transcribed a session incorrectly, retain the old claim ID and add a new claim with `correctsClaimId`; the display may mark the older claim as corrected. If characters learn new information, add a new claim in the later event with `clarifiesClaimIds`, and link that event to the earlier record with `reveals` or `contradicts`. Preserve the old statement, rumor, and chronology. Do not silently change a statement into a fact. An actual retcon of established lore requires explicit DM instruction and a documented correction.

**Tradeoff:** Atomic claims add a little authoring work. They make search, provenance, and later corrections possible while leaving narrative prose free-form. MVP need not extract every sentence into a claim; use claims for consequential names, discoveries, statements, and open questions.

## Fictional fixture

The following names and events are invented to illustrate the schema. They are not campaign facts.

`content/sessions/ses-001.md`:

```markdown
---
schemaVersion: 1
id: ses-001
title: The Bell at Reed Ford
number: 1
playedOn: "2026-10-03"
summary: The party arrived at Reed Ford and heard a warning.
illustrationIds: [img-reed-ford-dusk]
---

The party reached [Reed Ford](record:ent-reed-ford) at dusk.
```

`content/events/evt-001-bell-warning.md`:

```markdown
---
schemaVersion: 1
id: evt-001-bell-warning
title: The bell keeper's warning
sessionId: ses-001
order: 2
links:
  - { relation: occurs-at, targetId: ent-reed-ford }
  - { relation: involves, targetId: ent-bell-keeper }
claims:
  - id: clm-bell-keeper-warns-of-flood
    text: The north bridge will wash away tonight.
    status: statement
    assertedById: ent-bell-keeper
    sourceIds: [evt-001-bell-warning]
---

The [bell keeper](record:ent-bell-keeper) warned the party.
![Reed Ford under a purple dusk sky](asset:img-reed-ford-dusk)
```

`content/events/evt-003-bridge-inspection.md` (a later event):

```markdown
---
schemaVersion: 1
id: evt-003-bridge-inspection
title: Inspection of the north bridge
sessionId: ses-003
order: 1
links:
  - { relation: reveals, targetId: evt-001-bell-warning }
claims:
  - id: clm-bridge-rope-cut
    text: A bridge rope was cut before the flood.
    status: fact
    sourceIds: [evt-003-bridge-inspection]
    clarifiesClaimIds: [clm-bell-keeper-warns-of-flood]
---

The discovery gave new context to the earlier warning.
```

These fragments assume `ses-003`, `ent-reed-ford`, `ent-bell-keeper`, and the illustration fixture exist; validation would reject an incomplete fixture set.

## Illustration contract

**Confirmed:** Artwork lives in Cloudflare R2, with stable IDs independent of URLs. Original large images should not normally be committed to Git. A local preview should work before upload.

**Recommended:** `content/illustrations/<img-id>.yaml` is the authored metadata and selection record. The compiler resolves the selected image to a local preview path or public asset URL through one asset resolver. Its versioned schema includes `schemaVersion`, `id`, `description`, `alt`, `relatedIds`, `promptPath`, `referenceImageIds`, nullable `generatedAt`, nullable `tool` and `model`, `selectedRevision`, `original: { key, sha256, width, height }`, and `variants: [{ key, sha256, width, height, format, bytes }]`. `generatedAt` is an ISO timestamp when known and null for imported art whose generation date is unknown. Optional `preparationFingerprint` records the processing inputs/toolchain as defined in [07](07-asset-management.md). `relatedIds` point to narrative records; `referenceImageIds` point to other illustration IDs. `selectedRevision` is a positive integer that advances when a new selected rendition replaces a prior one. Keys identify immutable content-hashed objects. A new local image uses the separate gitignored preview override while `original` and `variants` are completed by preparation; validation for publication requires their full metadata. Local filesystem paths never enter committed manifests.

## Dependencies, phases, and acceptance

**Preview:** Render fictional account, entry, and session Markdown with TypeScript-defined shapes. Accounts have `id`, `title`, `format` (`chronicle`, `letters`, `journal`, or `compendium`), and `author`. Entries have stable IDs, account-relative `order`, and a required `sessionId`. The preview validates session references and unique session IDs/numbers. Session-first browsing sorts by descending session number (newest first); chronological reading within each account remains ascending by entry order. Preview session metadata includes `playedOn`, `title`, `summary`, `location`, and `image`; dates are real-world play dates, not fantasy calendar dates. The supplied dates are fictional. Shared event links remain part of the later full model, not yet implemented.

**Later full model:** Compile all record types; validate IDs, claim status, source references, relationships, chronology, asset references, and Markdown links. Generate session/event order, account presentations, entity backlinks, search records, and galleries from the same source files.

**Later:** Add an uncertain in-world timeline, richer claim comparison, or structured calendar only when actual campaign content justifies them. Avoid a database or publication-state model until requirements change.

**Dependencies:** Content conventions and editorial workflow in [04-content-authoring.md](04-content-authoring.md), asset preparation in [07-asset-management.md](07-asset-management.md), frontend views in [05-frontend-ux.md](05-frontend-ux.md), and validation in [10-testing-quality.md](10-testing-quality.md).

**Acceptance criteria:** A reviewer can create one file of each type, link them by stable ID, view a session in deterministic event order, trace an important statement to its source, add a later clarifying fact without rewriting the original event, and have missing or duplicate references fail validation with file and field locations.
