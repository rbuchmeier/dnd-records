# Frontend UX

## Goal

Define how readers navigate and read a high-fantasy Campaign Chronicle across screen sizes. Its main experience is dramatic comic-book panels with narration and dialogue, supported by clear chronology, legible text, and accessible controls.

## Confirmed decisions

- The frontend uses React and TypeScript, built with Vite.
- Navigation uses React Router `HashRouter`, compatible with GitHub Pages.
- Search, links among records, and illustrations are part of the reader experience.
- All content is public. There are no account or spoiler-control flows.
- The underlying content model uses stable IDs and Markdown content. See [data model](03-data-model.md) and [content authoring](04-content-authoring.md).
- Accounts must also be browsable together by play session, newest session first. The Campaign Chronicle remains primary, with independent visibility toggles for player letters, field notes, and compendium accounts.

**Latest design direction:** The primary view is continuous reading, not a collection of cards that require opening. Put the chronology in the left sidebar, newest first; scrolling over that rail moves through the story, and the active session follows the main reading position. Render the full comic panels, narration, dialogue, and letters inline. Focus on letters for now, with one show/hide control; defer journal/compendium controls in this view. Session buttons may remain as optional scroll shortcuts. On small screens use a compact sticky chronology strip and stack letters below the panels. The working implementation is at `#/` and `#/chronicle`.

### Design comparison preview

**Filtering and supplemental content:** In the continuous reader, letters (and future supplementary items) follow the session's panels, never a side column. A minimal sticky navigation bar contains a live text filter and adjacent Chronicles/Letters visibility toggles. Toggles persist per browser. Match whole entries independently using case-insensitive text containment; multiple whitespace-separated terms must all match somewhere in the entry. Search includes prose, metadata, narration, dialogue, alt descriptions, and author, not image pixels. Remove sessions with no enabled matching entries from the story and chronology; retain clear recovery controls for no matches or both types disabled. Load all entry text at startup and lazy-load every comic image independently, reserving its layout space. The old chapter reader and comparison studies remain separate from this behavior.

**Reader cleanup:** Keep the continuous reader minimal: session numbers and dates in the rail, one Letters toggle, full comic panels, and letter bodies. No visible campaign branding, chapter titles, introductory copy, summaries, progress/footer ornamentation, letter wrapper headings, or design-study links. Retain accessible region labels without adding visible clutter. Earlier study routes remain isolated from the main reading experience.

The working prototype retains `#/designs` and three earlier alternatives: `#/designs/timeline` (Story Thread), `#/designs/wheel` (Chronicle Wheel), and `#/designs/folio` (Session Folio). Each uses the same session records and account filters. Filters travel in the URL between alternatives and survive reloads. These older card-based studies remain for comparison; the continuous reader supersedes them as the main design. The original per-chapter reader remains at `#/accounts/acc-chronicle`.

## Visual direction

Use a medieval/high-fantasy visual language suited to a dramatic illustrated chronicle. Build the primary story as ordered comic-book panels with narration and dialogue. Reserve decorative type for short labels or titles; body copy should use a highly readable font with comfortable line length and line spacing.

Treat the journal metaphor as surface styling, not as an interaction model. Controls should look and behave like familiar links, buttons, search fields, and navigation. Avoid faux handwriting for long passages, low-contrast aged-paper textures, tiny annotations, or ornamental frames that consume phone space.

Suggested page anatomy:

- A compact site header with campaign title and primary navigation.
- A consistent content column with a clear page title and breadcrumbs or equivalent context.
- Distinct, readable event metadata: session, order, in-world date if present, and claim status where relevant.
- Illustrations placed near the text they support, with captions and source/context when available.
- Related-record links grouped by meaning, not hidden in decorative marginalia.

The visual treatment should support the panels without compromising modern usability.

## Routes and information architecture

The following routes are recommendations; the chronological Chronicle is primary. Accounts are distinct presentations of shared events. Letters, field journal, and compendium/encyclopedia are optional sections:

| Route | Reader purpose |
|---|---|
| `#/sessions` | Browse sessions newest first |
| `#/accounts/:id` | Read an account's chronological presentation of shared events |
| `#/sessions/:id` | Read a session summary and its ordered event list |
| `#/events/:id` | Read one event and its sources, status, links, and illustrations |
| `#/entities` | Browse the minimal entity compendium |
| `#/entities/:id` | Read an entity overview and its linked appearances |
| `#/documents/:id` | Read an in-world document and its context |
| `#/search` | Search indexed textual content and open a result |
| `#/` (optional) | Landing page linking into sessions, search, and selected records |

Use meaningful document titles and preserve the hash URL as the shareable address for each record. Unknown IDs should render a designed not-found page with a route back to sessions and search, not a blank screen.

## Primary reader flows

### Browse the chronology

1. Open the session index, ordered by descending campaign/session number (newest first).
2. Scan each session's concise summary and optional date or image.
3. Toggle optional player accounts, then open a session's Chronicle or accompanying letter, note, or compendium entry. Within a session, events retain their specified chronological order.
4. Read the event through the selected account's panels, narration, and dialogue; inspect sources, claim status, and related records as needed.
5. Use previous/next event links to continue the chronology, including a clear transition at session boundaries.

### Follow a person, place, or object

1. Open an entity link from an event, document, or search result.
2. Read its type, short description, and any current notes or illustration.
3. Follow a chronological list of linked appearances back to the source events.
4. Return to the originating record using browser back or a visible context link.

### Find a clue or remembered phrase

1. Open search from the site navigation.
2. Enter words from a title or body of a session, event, entity, or document.
3. Review grouped or clearly labeled results showing record type, title, and a useful excerpt.
4. Open a result and retain a direct URL that can be shared.

Search is text-oriented. It indexes record titles and authored text, including meaningful captions where the content model provides them; it does not index image pixels or treat an image as searchable just because it exists.

### Read an in-world document

1. Open a document from a linked event or document listing.
2. See the title, document type, source/context, and readable body.
3. Follow associated event/entity links to distinguish the artifact's contents from later interpretation.

## Page requirements

### Session index and detail

- Show session number and title, plus a concise summary.
- Keep session ordering explicit and stable, newest first. Keep the Chronicle visible while filtering optional player accounts.
- On detail pages, list events in their specified order with links and short summaries.
- Use a clear empty state if a session has no events yet.

### Event detail

- Show session and event context near the heading, plus previous/next navigation when available.
- Render claims with an explicit label for `fact`, `statement`, `rumor`, `interpretation`, or `unknown`.
- Show supplied source information adjacent to the claim it supports.
- Make relationships to entities, documents, and other events visible and actionable.
- Present corrections or later context in a way that retains what was recorded at the earlier time (exact presentation pattern is proposed and depends on the final model).

### Entity index and detail

- Provide a compact list of names and types, with text filtering/search support if useful.
- Detail view should include a summary, type, illustration if available, and chronological appearances.
- Do not imply certainty in an entity description beyond the underlying claim status and source.

### Document detail

- Clearly distinguish the artifact text from editorial framing and later commentary.
- Support long text with readable paragraph width and appropriate headings.
- Include links to originating events and referenced entities when known.

### Search

- Provide a visible label and keyboard-accessible input.
- Show a useful initial state before a query and a no-results state after a query with no matches.
- Indicate when search is unavailable or its index could not load; provide navigation to browse records.
- Keep the current query in the URL when practical so a search can be shared and restored.

## Responsive behavior

- Use a single-column reading layout on phones; avoid horizontal scrolling for ordinary text.
- Stack illustrations and content on narrow screens. Images should scale to the viewport while retaining their intended crop and aspect ratio.
- Keep navigation available without permanently consuming the small screen; use a compact menu with a keyboard-operable trigger if needed.
- Preserve event order, claim labels, source associations, and links at every width.
- At wider widths, a secondary index or contents column may be used if it improves orientation without narrowing the reading measure.
- Never rely on hover alone to reveal controls or essential information.

## Accessibility and interaction

- Use semantic landmarks, one clear page-level heading, hierarchical subheadings, and native links/buttons.
- Ensure the whole interface is keyboard operable, with a visible focus indicator and a sensible focus order.
- On route changes, update the document title and move focus to the new page heading; preserve expected browser back/scroll behavior. Provide a skip-to-content link.
- Maintain readable contrast between text, paper-like surfaces, and accents; verify decorative textures do not reduce contrast.
- Provide meaningful alt text for informative images. Mark purely decorative images accordingly; do not use filename or prompt text as a substitute.
- Ensure captions and claim/source labels remain available to assistive technology.
- Provide text alternatives for any visual-only navigation cue.
- Respect reduced-motion preferences; avoid requiring animation to understand a state or transition.

## Empty, error, and loading states

- Empty sessions, entity collections, and search results should explain what is absent and offer a useful route onward.
- Missing records should show the requested identifier or title when available, and link to sessions/search.
- Missing images should leave surrounding text readable and show a restrained placeholder rather than a broken-image icon alone.
- If a content bundle or search index fails to load, explain the problem and offer a retry or browsing route where possible.
- Loading states should preserve page structure and avoid sudden layout shifts, especially around images.

## MVP and later

**Design preview:** responsive navigation and chronological Chronicle panels, account selection/presentation, narration and dialogue, and fictional demo content. Entity, document, letter, journal, and compendium views remain optional scope.

The eventual reader may add search, deeper entity/document exploration, art comparison, and expanded galleries. These should preserve the chronology and keep account-specific presentation distinct from shared event canon.

## Tradeoffs

- A clear, restrained visual system preserves the journal atmosphere while keeping long passages comfortable to read.
- Explicit labels and source adjacency make uncertainty understandable, at the cost of additional metadata on some event pages.
- A compact set of routes keeps the information architecture learnable; richer presentation modes can be introduced only when actual content benefits from them.
- Static delivery is fast and inexpensive, but content and search-index errors need intentional fallback states because there is no application server to repair them dynamically.
- Showing chronologically linked appearances helps players recall context, but very long lists may eventually need filtering or pagination.

## Dependencies and related specifications

- [Product vision](01-product-vision.md) defines user goals and MVP boundaries.
- [Data model](03-data-model.md) determines claim/source rendering, ordering, and related-record links.
- [Content authoring](04-content-authoring.md) determines the text and metadata available to render.
- [Asset management](07-asset-management.md) determines image variants, URLs, and missing-asset behavior.
- [Testing and quality](10-testing-quality.md) should define accessibility, responsive, and route-level checks.

## Acceptance criteria

- Every listed MVP route has a defined page purpose and a usable empty/not-found behavior.
- A reader can complete each primary flow using pointer/touch and keyboard navigation.
- Session and event order is visible and consistent with the content data.
- Claim type and any supplied source are rendered with the relevant claim, rather than only in a distant metadata block.
- At narrow widths, the reader can view text and images without horizontal page scrolling.
- Informative illustrations expose authored alt text; image loading failures do not hide associated text.
- Search results identify record type and lead to stable hash URLs; search scope is limited to authored text and captions.
- Typography, controls, and focus indicators remain readable against the chosen visual treatment.
- No UX copy or seeded example asserts invented campaign history.
