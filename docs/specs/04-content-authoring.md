# Content authoring and editorial rules

## Goal and status

**Confirmed from the project handoff:** The DM primarily writes the campaign record, with Codex assisting in editing, formatting, organization, and artwork. Content is Markdown with structured metadata in a public GitHub repository. Players may see spoilers. A convenient local preview is desirable; an approval workflow is not required. Codex must not silently create campaign history.

**Recommended:** Author one record per file, keep prose pleasant to read in ordinary Markdown, and reserve YAML front matter for identity, navigation, consequential claims, and provenance. The syntax and rules here are proposals for review, not implemented behavior.

## Folder and file conventions

```text
content/
  accounts/acc-main-chronicle.md
  entries/entry-opening-scene.md
  sessions/ses-001.md
  events/evt-001-bell-warning.md
  entities/ent-bell-keeper.md
  documents/doc-ferry-ledger.md
  illustrations/img-reed-ford-dusk.yaml
art/
  prompts/img-reed-ford-dusk-r1.md
```

**Recommended:** Names use stable IDs, not mutable titles. Every Markdown record starts with YAML front matter bounded by `---`; text after it is standard Markdown. The directory determines record type. Do not use MDX or executable components in campaign content. Store source prompts and style/reference notes as small text files in Git; keep original bitmap files outside Git by default. [03-data-model.md](03-data-model.md) defines the field contract.

## Writing a record

**Proposed preview authoring shape:**

1. Define an account with immutable `acc-` ID, title, format (`chronicle`, `letters`, `journal`, or `compendium`), and optional author.
2. Add ordered entries with stable `entry-` IDs. Keep account-specific narration and dialogue in the entry. The design preview contains standalone fictional entries; in the full model these will link to shared canonical event records, with `ent-` reserved for entities.
3. Use fictional demo material in the design preview. Real campaign notes are not present in this specification work.

**Full content workflow (later):**

1. Decide whether the material is a play session, a shared event, an account entry, a persistent entity, or an in-world document. A session recap can link to several events; account entries present events from a chosen perspective.
2. Give the file an immutable ID and `schemaVersion: 1`. Write `title` and, when useful, a short `summary` for lists and search results.
3. Add type-specific metadata: session `number`, event `sessionId` and `order`, entity `kind`, or document `documentKind`.
4. Write the body for readers. Add structured `claims` for consequential assertions and `links` for meaningful connections. Cite the event, session, or document where each claim entered the campaign record.
5. Add illustrations by `img-` ID and accessible alt text. Preview locally, run validation, then use the normal publishing workflow.

**Recommended granularity:** Record one event for a discovery, encounter, decision, battle, or consequential exchange. Mundane travel and atmosphere can remain in the session body. An entity page should summarize its enduring identity and link to appearances; it should not duplicate a whole session. A document page should preserve the artifact's wording, with attribution and discovery context in front matter.

## Fictional entity and document fixtures

All names, statements, and dates in these examples are fictional fixtures and are not established campaign lore. They continue the invented example in [03-data-model.md](03-data-model.md).

`content/entities/ent-bell-keeper.md`:

```markdown
---
schemaVersion: 1
id: ent-bell-keeper
title: The bell keeper
kind: npc
aliases: [Keeper of Reed Ford]
summary: A watchful resident who warned the party about the north bridge.
links:
  - { relation: mentions, targetId: ent-reed-ford }
---

The party first met the bell keeper during [the warning](record:evt-001-bell-warning).
```

`content/documents/doc-ferry-ledger.md`:

```markdown
---
schemaVersion: 1
id: doc-ferry-ledger
title: The ferry ledger
documentKind: ledger
foundInEventId: evt-003-bridge-inspection
links:
  - { relation: discovered-in, targetId: evt-003-bridge-inspection }
claims:
  - id: clm-ledger-shows-missing-rope
    text: The ledger records a missing coil of bridge rope.
    status: fact
    sourceIds: [doc-ferry-ledger]
---

> One coil, absent from the stores at dawn.

The ledger was found during [the inspection](record:evt-003-bridge-inspection).
```

The `fact` above means the ledger contains that entry; it does not by itself prove who took the rope. If a character alleges who took it, record that proposition separately as a `statement`, `rumor`, or `interpretation` with its own attribution and source.

## Record and asset links

**Recommended:** Use ordinary Markdown with two custom target schemes:

```markdown
[the north bridge](record:ent-north-bridge)
![A bell tower over the ford at dusk](asset:img-reed-ford-dusk)
```

At build time, the content compiler resolves `record:<id>` to a HashRouter route and `asset:<img-id>` through the asset resolver. It validates targets and reports the source file and line for broken references. External `https:` links remain ordinary Markdown links. Avoid hard-coded site URLs, R2 URLs, or asset keys in narrative prose; stable IDs survive route and storage changes. `illustrationIds` supplies a record gallery; an inline image places art at a particular point in the prose. A page should avoid showing the same image twice unless the layout calls for it.

**Recommended accessibility rule:** Every displayed image needs contextual alt text. An inline image's Markdown alt describes its role there; illustration metadata `alt` is the fallback for galleries and cards. Decorative art may use empty alt only when the same information is already conveyed nearby. Generated text within an image is not the canonical text of a letter or clue; put legible words in HTML/Markdown.

## Illustration metadata and references

**Recommended:** A selected illustration has one authored metadata file. This fixture illustrates the full publication shape; the hashes, keys, dimensions, dates, and filenames are invented placeholders.

`content/illustrations/img-reed-ford-dusk.yaml`:

```yaml
schemaVersion: 1
id: img-reed-ford-dusk
description: Establishing view of the fictional settlement at dusk.
alt: A bell tower stands above a river crossing in violet evening light.
relatedIds: [ses-001, ent-reed-ford]
promptPath: art/prompts/img-reed-ford-dusk-r1.md
referenceImageIds: []
generatedAt: "2026-10-04T18:30:00Z"
tool: Codex image generation
model: null
selectedRevision: 1
original:
  key: originals/<sha256-of-original>.png
  sha256: <sha256-of-original>
  width: 2048
  height: 1536
variants:
  - key: images/<sha256-of-variant>.webp
    sha256: <sha256-of-variant>
    width: 1440
    height: 1080
    format: webp
    bytes: 240000
```

`relatedIds` links artwork to narrative records. `referenceImageIds` names canonical visual references by stable illustration ID. `promptPath` points to a committed text prompt, not an image blob. The image preparation step writes real checksums, dimensions, format, and byte sizes for the selected original and optimized variants. `selectedRevision` increments when another rendition is chosen; immutable content-hashed keys keep old cached objects valid. Local preview may use a temporary local asset mapping before R2 upload. See [06-art-generation.md](06-art-generation.md) and [07-asset-management.md](07-asset-management.md).

## Editorial truth and later discoveries

**Recommended:** Distinguish what happened from what someone claimed happened. Keep each important assertion in an atomic claim with `status` and `sourceIds`. Use `statement` for an attributed utterance, `rumor` for unverified circulation, `interpretation` for an inference, `unknown` for a tracked open question, and `fact` only for a proposition the DM establishes. A generated recap is a draft until checked against session notes; Codex may suggest candidate claims but must not promote them to facts without DM-supplied evidence or explicit direction.

**Recommended review rule:** Before changing lore, inspect the target record, linked events and documents, existing claim status, and any aliases. When the source is ambiguous, retain ambiguity in the prose and structured claim. Ask the DM about a material contradiction that cannot be reconciled from existing records. Preserve original wording of an in-world statement even when it later proves false.

**Recommended provenance practice:** In a session's Sources section, preserve a short DM-supplied note excerpt, a dated confirmation, or a link/location in the supplied Roll20 notes/transcript. Self-referencing `sourceIds` identify where a claim was recorded, but do not independently establish its truth. Copy essential source context into the repository when an external link is temporary; never invent a transcript or confirmation. Real campaign source material has not been supplied in this specification phase.

**Recommended corrections:** For a transcription mistake, add a corrected claim with `correctsClaimId`, retain the old claim for provenance, and annotate the body briefly if readers would otherwise be confused. For a later revelation, create a new event or document claim with `clarifiesClaimIds` and a `reveals` or `contradicts` record link. Do not reorder the old event to the date it discusses. Repository history provides an additional audit trail but does not replace explicit correction links in the readable record.

## Workflow, tradeoffs, and acceptance

**MVP workflow:** The DM supplies notes or a draft; Codex identifies possible records and unresolved assertions; the DM confirms substantive lore; Codex writes or edits Markdown/YAML; local validation reports schema and reference errors; Vite preview shows the rendered pages and local images; the ordinary publishing process prepares assets and deploys. No publication status field, private-content branch, or review gate is needed.

**Tradeoff:** Separate event files take more small edits than a single session essay, but they make chronology, search, backlinks, and correction manageable over hundreds of sessions. Structured claims are selective so authors can still write natural narrative prose. Markdown remains diffable and recoverable through Git.

**Later:** Bulk import from Roll20 exports, assisted extraction of events from rough notes, richer editorial views for unresolved claims, and a dedicated local gallery may be added after the basic workflow proves useful. None is a prerequisite for writing the first sessions.

**Dependencies:** The schema in [03-data-model.md](03-data-model.md), art workflow in [06-art-generation.md](06-art-generation.md), asset preparation in [07-asset-management.md](07-asset-management.md), validation in [10-testing-quality.md](10-testing-quality.md), and the local workflow in [12-development-workflow.md](12-development-workflow.md).

**Acceptance criteria:** A DM can add a session, two linked events, an entity, a document, and an illustration through text files; see all links and art in local preview; receive actionable validation errors for a bad ID, claim source, or asset; and add a later revelation without altering the historical order or silently changing an earlier statement into a fact.
