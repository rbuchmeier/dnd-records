# D&D Campaign Chronicle

A React/TypeScript comic reader with session chronology, narration, dialogue,
and letters. Vite serves Markdown content from `content/`.

The Chronicle records the October 8, 2026 session; its session number is unset.
Panels use stable sequential IDs (A1, A2, …), visible only in DevTools.
Use narration, dialogue (`kind: thought` or `kind: shout`), and sound captions as needed.
Optional `roll: crit` or `roll: crit-fail` adds a green D20/20 or red D20/1 badge.
Panel images are optional;
add `image` and `alt` when artwork is ready. Preserve supplied dialogue verbatim.
Never invent campaign history or treat proposed details as established facts.

## Run and check

Use Node.js 24:

```sh
npm ci
npm run dev
npm run build
npm run test:e2e
npm run format:check
```

Open <http://127.0.0.1:5173>. Install Chromium with
`npx playwright install chromium` before the first browser test run.

## App and content

- `#/` (also `#/chronicle`): continuous panels and letters, newest session first.
  Text filtering and independent visibility toggles; Cmd/Ctrl+K focuses the filter.
- `content/sessions/`: session numbers and real-world play dates.
- `content/entries/`: prose and ordered panels linked by `sessionId` and `accountId`.
- `content/accounts/`: Chronicle and letter authors/presentations.
- `src/lib/content.ts`: current content schema and validation.
- `src/reading/`: Chronicle screen. `src/styles.css` holds the shared
  Molten Basalt palette. Unknown and retired routes show a minimal 404.

## Assets and infrastructure

Unused demo art remains in `public/art/`. The current session has no panel artwork yet.
Set public `VITE_ASSET_BASE_URL` to load panel art from R2, or leave it blank for
bundled art. No cloud credentials are needed to run the app.

R2 and its Terraform state bucket are operational; see [infrastructure](infra/README.md).
The site is live on [GitHub Pages](https://rbuchmeier.github.io/dnd-records/);
pushes to `main` deploy automatically. See [deployment](docs/deployment.md).
The shared event/claim model and immutable illustration manifests remain planned. [Specifications](docs/specs/README.md) and [initial-spec.md](initial-spec.md)
are historical proposals; this README and the code describe the current app.
