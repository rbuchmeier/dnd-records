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

- Three illustrated chapters with HTML narration/dialogue, a transcript view, table of contents, image enlargement, and chapter navigation.
- Separate letters, journal, and compendium accounts, each with two sample entries.
- Search across entry prose, narration, and dialogue.
- Bookmarks saved on the current browser/device.
- Responsive phone layout with stacked panels and archive navigation.

Edit presentation in [src/App.tsx](src/App.tsx) and [src/styles.css](src/styles.css). Accounts and entries live in [content/](content/), as Markdown with YAML front matter. The prototype validates these records with Zod at load time through [src/lib/content.ts](src/lib/content.ts).

Three optimized, generated demo images are intentionally bundled under [public/art/](public/art/) so a fresh checkout can show the design without R2. The native image-generation prompts and provenance are in [art/prompts/demo-preview.md](art/prompts/demo-preview.md). Large original PNGs remain in gitignored `.local/art/demo/` on the authoring computer. Bundled sample art is a preview exception, not the proposed production asset-storage design.

## Verify

```sh
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser checks cover chapter/deep-link navigation, transcript, artwork, image dialog, bookmarks, accounts, search, not-found handling, and the phone layout. Screenshots are generated in `.local/screenshots/`.

For a GitHub Pages project build, set `SITE_BASE_PATH=/dnd-records/` when building and previewing. Routing uses hash URLs.

## What is still planned

The full shared event/entity/claim model, build-time content compiler, R2 asset manifests/uploads, Terraform infrastructure, backups, and GitHub Pages deployment workflow are specified but not implemented. The small preview currently bundles and parses its demo content in the browser; it is not yet the long-campaign delivery pipeline.

See the [specification index](docs/specs/README.md) and [Cloudflare setup checklist](docs/cloudflare-setup.md). The original [initial-spec.md](initial-spec.md) is retained as a historical handoff; the user's later comic-first direction supersedes its proposed field-journal-first roadmap.
