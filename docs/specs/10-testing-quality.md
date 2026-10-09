# Testing and quality

## Goal

Keep the campaign record internally consistent and make the published journal dependable on desktop and mobile. Quality checks should catch broken references, historical inconsistencies, inaccessible presentation, and asset delivery failures without building enterprise test infrastructure.

## Confirmed decisions

- The application is a React, TypeScript, and Vite static site using HashRouter and GitHub Pages.
- Historical accuracy matters: established facts, character statements, rumors, interpretations, and unknowns must remain distinguishable.
- There is no backend or database.

## Recommended validation approach

Use the content compiler as a structural quality boundary. Parse the chosen record formats, validate schema and identifiers, resolve declared references, check deterministic ordering and asset metadata, and produce diagnostics with source path and field. Keep the source formats, exact paths, identifier prefixes, reference syntax, and generated JSON shape as recommendations in [03-data-model.md](03-data-model.md) and [04-content-authoring.md](04-content-authoring.md), not as additional confirmed decisions in this testing specification.

## Recommended quality gates

Treat the content compiler as the main quality boundary. It should parse front matter, validate schemas, produce useful file-and-field diagnostics, resolve references, and fail on ambiguous or duplicate identifiers before generating JSON.

Recommended checks include:

- Required fields and valid values for every record kind.
- Unique IDs and correct ID prefixes; reject ID changes in future history-aware checks where prior published data is available.
- Reference target existence and target kind compatibility.
- Session ordering, event ordering, dates, and declared chronology constraints.
- Structural validation of claim-status and attribution fields when present in the selected model. Do not infer truth from prose or reject a record solely because it documents a character's statement, rumor, or interpretation.
- Illustration record and asset manifest consistency, including required alt text and variants.
- Safe Markdown handling and HTML sanitization before rendering.
- Generated JSON determinism: identical source content produces identical output.

Diagnostics should identify the source path, record ID, field or relationship, and a concise correction. Validation should report all independent problems in one run.

Recommended rule: errors block compilation; editorial notes are warnings and do not block it. Warnings should be reserved for genuinely optional information, such as a missing optional illustration caption. Do not silently repair malformed source data during compilation.

Historical judgment remains with the author. Validation can check that authored claim labels and attributions are well-formed, but cannot decide whether a claim is true or whether prose is adequately cautious.

## Test layers

### MVP

- Unit tests for front matter parsing, schema validation, ID checks, reference resolution, chronology/order rules, Markdown sanitization, asset URL resolution, and deterministic output.
- Fixture-based compiler tests with valid content and focused invalid examples: duplicate IDs, missing links, wrong record kinds, malformed dates or claim metadata, absent asset variants, unsafe HTML.
- A build check proving that generated JSON and indexes can be consumed by the application.
- Browser smoke tests for the home/session list, one session detail, entity/event cross-links, search, image display, and a mobile viewport.
- Include a GitHub Pages project-subpath case and verify HashRouter links and reloads work under that base path.
- Accessibility checks in browser flows for semantic headings, keyboard navigation, focus visibility, form labels, image alt text, and contrast on core pages.

### Later

- Visual regression snapshots for key journal layouts after the visual system stabilizes.
- Link checker for deployed pages and remote asset variants.
- Optional content-history checks to flag silent changes to established claims or immutable IDs.

Recommended MVP scale fixture: 500 records and 3,000 illustration metadata records/references, with no eager loading of all media. Use it to catch accidental quadratic indexing, oversized initial payloads, and search slowdowns before content grows.

## Performance and accessibility

Recommended initial performance targets are advisory until measured on the first working build: initial application JavaScript at or below 250 KiB gzip, and the complete generated search index at or below 1 MiB gzip for the scale fixture. Measure on a production build and document actual results before considering either threshold blocking. Keep record payloads and indexes small; lazy-load below-the-fold images; use responsive derivatives and explicit dimensions to reduce layout shift. Search can be client-side over compact generated indexes. Never eagerly fetch the fixture's full media collection.

Use semantic HTML, meaningful focus order, visible focus, text alternatives for informative images, and reduced-motion behavior. Avoid requiring color alone to communicate status or claim certainty. Decorative images may use empty alt text when surrounding text conveys their purpose.

Recommended accessibility target: use [W3C WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) as a practical design and review reference, while keeping manual keyboard and screen-reader spot checks for high-value reading flows. Automated audits are useful signals, not proof of accessibility.

Recommended image checks should confirm that rendered variants declare dimensions and use alt text from illustration metadata. Visual review should confirm that important subjects remain clear at narrow screen widths.

## CI and local workflow

Recommended CI checks on pull requests and pushes to `main`: dependency install, formatting/lint checks if adopted, content validation, unit tests, production build, and browser smoke tests. CI should not generate paid artwork. It should verify referenced remote asset objects before a publication build, as defined in [09-ci-cd.md](09-ci-cd.md).

Keep the same core validation command locally and in CI so a failure can be reproduced without guessing at workflow-specific behavior. Browser tests should use a small stable fixture set; tests should not depend on production campaign details that may change during normal editing.

Recommended test data should include accented names, punctuation, long titles, missing optional artwork, multiple references to the same entity, and an event whose context is updated by a later discovery. These cases exercise the content shapes likely to stress rendering and chronology.

The preview implements `npm run build`, `npm run test:e2e`, and formatting commands. The full compiler's `npm run validate` and unit-test command remain planned. Use `npm ci` in local clean installs and CI to install from the committed lockfile reproducibly.

## Tradeoffs and dependencies

Validation rules should be strict for stable IDs, references, and chronology, but should not force editorial prose into an overly rigid template. A lightweight browser suite costs some setup time; it protects the project's essential mobile and hash-routing behavior. Exact tooling and performance budgets depend on the initial scaffold and are recommendations, not confirmed choices.

Dependencies: the schemas and claim model in [03-data-model.md](03-data-model.md) and [04-content-authoring.md](04-content-authoring.md); asset metadata in [07-asset-management.md](07-asset-management.md); publishing sequence in [09-ci-cd.md](09-ci-cd.md).

### Out of scope

Do not add load-testing clusters, a separate test database, complex staging environments, or broad mutation testing for this static personal project without a concrete need. Test coverage should follow the risks that matter: historical fidelity, broken links, unsafe content, wrong asset delivery, and a reader that fails on common devices.

## Acceptance criteria

- Invalid references, duplicate IDs, invalid ordering, and malformed records fail with actionable diagnostics.
- Valid content deterministically builds the recommended runtime records/indexes.
- Tests cover claim attribution and uncertainty, safe rendering, asset resolution, and chronology.
- Browser checks prove core navigation works on a GitHub Pages project subpath and at mobile width.
- Core pages support keyboard navigation and expose meaningful text alternatives for informative artwork.

## Quality ownership

The author remains the final authority on campaign facts, claim classification, and whether an illustration accurately depicts established lore. Automated checks can identify missing attribution or broken structure; they cannot certify historical truth. Editorial corrections should update source Markdown and YAML, then pass through the same validation and publication checks as other content.
