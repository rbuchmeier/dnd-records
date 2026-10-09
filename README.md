# D&D Campaign Archive

A medieval/high-fantasy reader centered on a comic-panel Campaign Chronicle, with separate player accounts for letters, field journals, and compendiums.

The current application is a working **design preview**, using the entirely fictional campaign **The Hollow Crown**. It is not a record of the user's actual campaign.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The server binds to this computer only; no Cloudflare or other credentials are needed. Vite reloads the preview when source or Markdown changes.

## Explore the design

- **B6 Molten Basalt** is the active reader theme. Theme selection is editorial/source-only: change `ACTIVE_THEME_ID` in `src/styles-preview/themes.ts` through project work, not reader settings. All eight palette definitions and the color-only styling system remain available for future changes. The theme-selection UI is retired, `#/styles` redirects to the reader, and old `?theme=` parameters do not override the selected palette.
- [Independent wireframes A1–A5](http://127.0.0.1:5173/#/wireframes) provide grayscale discussion sketches with desktop/phone previews and individual links (`#/wireframes/A1`, etc.). Each was created by a fresh sub-agent given only a short requirements brief, without the existing app, screenshots, or other agents' designs. Controls in these sketches are illustrative; they do not replace the working reader.
- The [continuous Chronicle](http://127.0.0.1:5173/) is now the main design: the left sidebar is a newest-first chronology, and scrolling over it moves the full story. The highlighted session follows your reading position. Session buttons are optional shortcuts, not page changes.
- Comic panels, narration, dialogue, and complete letters render directly in the page. Letters appear beneath the panels at every screen size, leaving the same space for future supplemental items. **Chronicles** and **Letters** checkboxes independently hide/show each type and remember the choice in this browser. Journals and compendiums are intentionally left out of this focused design.
- A minimal sticky navigation bar filters entries as you type. Matching is case-insensitive; all space-separated search terms must occur somewhere in an entry's text (including prose, title/summary, panel narration, dialogue, illustration descriptions, and author). Entries are matched independently; sessions with no matching enabled entries also disappear from the chronology. Clear the filter to restore them. Cmd/Ctrl+K focuses the filter; Escape clears it.
- All text is loaded up front and indexed locally, so filtering does not depend on image downloads. Every comic image in the continuous reader uses native lazy loading and asynchronous decoding with reserved layout space. Browsers may fetch images near the viewport ahead of scrolling.
- The reading view deliberately omits campaign branding, chapter titles, introductions, summaries, decorative metadata, and links to earlier studies. Only session dates, the filter, and type toggles surround the story. Content metadata remains in Markdown for future use.
- [Session design gallery](http://127.0.0.1:5173/#/designs): compare the Story Thread (vertical timeline), Chronicle Wheel (interactive astrolabe), and Session Folio (latest issue and expandable older sessions).
- All three alternatives group entries by session, newest first. Letters, field notes, and compendium accounts can be toggled independently; the Campaign Chronicle stays visible. Filters are retained in the URL when switching designs or reloading.
- Three illustrated chapters with HTML narration/dialogue, a transcript view, table of contents, image enlargement, and chapter navigation.
- Separate letters, journal, and compendium accounts, each with two sample entries.
- Search across entry prose, narration, and dialogue.
- Bookmarks saved on the current browser/device.
- Responsive phone layout with stacked panels and archive navigation.

Edit presentation in [src/App.tsx](src/App.tsx) and [src/styles.css](src/styles.css). Accounts and entries live in [content/](content/), as Markdown with YAML front matter. The prototype validates these records with Zod at load time through [src/lib/content.ts](src/lib/content.ts).

Session records live in `content/sessions/`; each entry references one through `sessionId`. Sessions are ordered by descending `number`, independent of account reading order. Dates use real-world `playedOn` metadata; the three weekly dates in this preview are fictional. Missing session references and duplicate session IDs/numbers are rejected. The latest continuous design lives in `src/reading/` and opens at `#/` or `#/chronicle`. Earlier alternatives remain in `src/designs/` for comparison; the original chapter reader is still at `#/accounts/acc-chronicle`.

Three optimized, generated demo images are intentionally bundled under [public/art/](public/art/) so a fresh checkout can show the design without R2. The native image-generation prompts and provenance are in [art/prompts/demo-preview.md](art/prompts/demo-preview.md). Large original PNGs remain in gitignored `.local/art/demo/` on the authoring computer. Bundled sample art is a preview exception, not the proposed production asset-storage design.

## Verify

```sh
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser checks cover chapter/deep-link navigation, transcript, artwork, image dialog, bookmarks, accounts, search, not-found handling, session ordering, account filters, design switching, wheel selection, folio expansion, and phone layouts. Screenshots are generated in `.local/screenshots/`.

For a GitHub Pages project build, set `SITE_BASE_PATH=/dnd-records/` when building and previewing. Routing uses hash URLs.

## What is still planned

The full shared event/entity/claim model, build-time content compiler, immutable R2 asset manifests/uploads, backups, and GitHub Pages deployment workflow are still planned. The small preview currently bundles and parses its demo content in the browser; it is not yet the long-campaign delivery pipeline.

The R2 artwork bucket and private Terraform-state bucket are operational, with remote-state locking verified. The demo images are uploaded and the local reader retrieves them from R2 through `.env.local`. See [infra/README.md](infra/README.md) for setup, the public image origin, and verification results. On a fresh checkout or in deployment CI, set public `VITE_ASSET_BASE_URL` as shown in [.env.example](.env.example) to use uploaded art; leave it blank for bundled demo images. Never use frontend environment variables for credentials.

See the [specification index](docs/specs/README.md) and [Cloudflare setup checklist](docs/cloudflare-setup.md). The original [initial-spec.md](initial-spec.md) is retained as a historical handoff; the user's later comic-first direction supersedes its proposed field-journal-first roadmap.
