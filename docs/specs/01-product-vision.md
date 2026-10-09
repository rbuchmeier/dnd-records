# Product vision

## Goal

Create a public, illustrated historical record for a long-running Dungeons & Dragons campaign. The site should make the campaign enjoyable to revisit as a story and useful to search as a record of what happened, who was involved, and what was known at a particular point in time.

The product is a reader first. The DM authors content in Markdown with Codex assistance; players browse it on desktop and mobile. The project favors a small, maintainable static application over a general publishing platform.

## Confirmed decisions

- The campaign record and artwork are public. Spoilers are acceptable; there is no account, permission, or public/private split.
- React, TypeScript, Vite, React Router `HashRouter`, GitHub Pages, and Cloudflare R2 are selected platform choices. Markdown with structured metadata is the content format.
- Stable references, useful chronology, historical distinctions, and later context are required; the exact schema is proposed in [data model](03-data-model.md).
- The content must not silently invent campaign history. Synthetic examples in specifications are illustrative only and are not campaign canon.

**Current design direction:** A dramatic, medieval/high-fantasy Campaign Chronicle told through comic-book panels with narration and dialogue. The chronology is the main reading experience. A couple of accounts can present the same shared events from different perspectives. Optional sections may include letters, a field journal, and a compendium/encyclopedia. These accounts are linked presentations of shared events, not competing versions of canon.

## Audience

### Primary reader: campaign player

Wants to recall a past session, find an NPC or place, understand a clue's provenance, or revisit an illustration. The reader may arrive from a shared link and may be using a phone between sessions.

### Primary author: Dungeon Master

Wants to turn notes into durable, linked records without learning a CMS or maintaining a database. The DM may use Codex to organize, edit, and illustrate material, while retaining editorial control over facts and uncertainty.

### Secondary reader: future campaign participant

May browse without detailed knowledge of the campaign. Navigation and page context should make it clear what a session, person, location, or document represents without requiring prior familiarity.

## Product principles

1. **Story through panels.** Comic panels, narration, and dialogue make the chronology compelling while keeping the written record readable and navigable.
2. **Keep claims situated.** A character's statement, a rumor, and an established event are visibly distinct kinds of information.
3. **Make connections navigable.** Every event can lead to its session and linked entities, documents, and related events.
4. **Work well on a phone.** Reading, searching, and opening artwork must work at narrow widths and with touch input.
5. **Keep authoring portable.** Content remains inspectable and editable as Markdown and structured metadata in source control.
6. **Separate events from accounts.** Shared events anchor the history; accounts determine how readers encounter them and whose perspective they follow.

## Core use cases

- Browse sessions in campaign order and open a session's event list.
- Read one event in context, then follow links to the people, places, objects, documents, or earlier events involved.
- Search journal text and discover matching sessions, events, entities, and documents.
- Read an entity overview and inspect its appearances in the journal.
- Read an in-world document with its source and related campaign context.
- View an illustration with useful alternative text and a path back to its associated record.
- Understand whether a claim is presented as fact, statement, rumor, interpretation, or unknown, and inspect its source where provided.
- Correct or enrich an older record while preserving what was understood at that earlier point in the campaign.

## Design preview scope

- Responsive Campaign Chronicle with chronological, dramatic comic-book panels, narration, and dialogue.
- A couple of chronological accounts over shared events, with account format and optional author attribution.
- Optional letter, field-journal, and compendium/encyclopedia sections.
- Minimal entity index and entity detail pages.
- Document detail pages for in-world writing.
- Search across textual content and titles; search does not index image pixels or attempt to infer image contents.
- Cross-links and chronological context between sessions, events, entities, and documents.
- Illustrations displayed from stable asset references, with descriptions and alt text.
- Clear empty, missing-record, and load-error states.
- Static public delivery without accounts, backend application server, database, or CMS.

## Later possibilities

- An art studio or comparison view for reviewing alternate image versions.
- Additional account formats and specialized document presentation templates.
- More advanced filters and relationship visualizations if real content volume makes them useful.

These are exploratory directions. They should reuse shared event records rather than introduce a second source of truth.

## Non-goals

- Running game sessions, character sheets, dice rolls, or encounter automation.
- Authentication, player-specific views, spoiler protection, or role-based publishing.
- A browser-based content management system.
- Automatically deciding whether campaign notes are true or resolving contradictions on behalf of the DM.
- Generating or asserting campaign events from synthetic examples.
- Requiring a backend service or database for reading the journal.

## Tradeoffs and product constraints

- A public static site is inexpensive and low-maintenance, but every committed record is publishable and may be discovered by players.
- Markdown is easy to review and maintain, but structured fields need validation to prevent broken references and inconsistent metadata.
- A flexible set of future presentation styles is desirable, but the MVP should not delay the useful reader by implementing multiple visual systems.
- Search can cover known text fields consistently; image metadata and descriptive captions may be indexed, but the site will not perform image recognition.
- Historical accuracy requires editorial discipline and provenance fields. The UI can communicate claim status, but cannot verify the campaign record itself.

## Dependencies and related specifications

- [Frontend UX](05-frontend-ux.md) defines routes, reader flows, responsive behavior, and accessibility requirements.
- [Data model](03-data-model.md) defines records, claims, ordering, and relationships.
- [Content authoring](04-content-authoring.md) defines Markdown conventions and validation.
- [Asset management](07-asset-management.md) defines image references and delivery.
- [Architecture](02-system-architecture.md) and [roadmap](13-implementation-roadmap.md) place the reader within the static publishing system.

## Acceptance criteria

- A player can move from the session list to a session, then to one of its events, and back to chronological context.
- A player can locate a known record using text search and follow a link between at least two record types.
- The reader renders event claim status and available source/context without presenting a rumor or character statement as established fact.
- Entity and document records can be read independently and linked to associated events.
- Illustrations do not block access to the associated text and have authored alternative text or an explicitly documented decorative role.
- Core reading and navigation remain usable on mobile, with keyboard navigation and visible focus.
- The specifications and examples do not introduce fictional campaign history as fact.

## MVP boundary

The current implementation target is a local design preview using fictional demo material. It should establish the Chronicle panel treatment and account model; it does not imply that the publishing pipeline or infrastructure is ready.
