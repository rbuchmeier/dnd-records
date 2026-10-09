# Development workflow

## Goal

Make it easy for one author, working with Codex, to edit campaign records, preview the site and artwork, and publish safely with a small number of understandable steps.

## Confirmed decisions

- Development uses React, TypeScript, Vite, and HashRouter; the site is hosted on GitHub Pages.
- R2 stores public artwork. No backend, database, CMS, authentication, or draft/public split is planned.
- Codex running locally is the development assistant and primary artwork workflow interface. Codex image generation may use the user's ChatGPT subscription where supported; generation is not assumed unlimited or included in an API budget.
- Sharp is the confirmed default for image optimization unless a better alternative emerges.

The record directories, YAML manifest format, local working directories, identifier prefixes, and compiled output structure described below are recommendations from [03-data-model.md](03-data-model.md) and [07-asset-management.md](07-asset-management.md), not additional confirmed decisions.

## Recommended local setup

Use a supported Node.js LTS release and npm, with versions recorded in repository configuration once the application scaffold exists. The repository should include a lockfile. A first-time setup should install dependencies, create a local environment file from a documented example if needed, and start Vite. Do not put secrets in the example file or commit local credentials.

Recommended development loop:

1. Edit a record or application component in a small change.
2. Run the proposed content validator and relevant unit checks.
3. Start the Vite server and preview the HashRouter routes, including the project subpath behavior.
4. For artwork, inspect local originals and derivatives in the preview workflow, then update the illustration record and asset manifest.
5. Review the diff, including generated metadata and any source records, before committing.

The design preview implements install, development, build, formatting, and browser-test commands; see the [project README](../../README.md). The full content validator and publisher below remain proposed:

| Proposed command | Purpose |
|---|---|
| `npm ci` | Install dependencies from the committed lockfile |
| `npm run dev` | Start Vite for local preview |
| `npm run validate` | Validate schemas, references, claims, chronology, and manifests |
| `npm run build` | Compile records and build the static site |
| `npm run publish` | Run the guarded local asset and publication workflow |

Recommended additional scripts can be added only when a real workflow needs them. Avoid aliases that obscure which steps validate, upload, build, or deploy. Document expected output and prerequisites next to every script as it is introduced.

## Codex collaboration

Recommended practice is to give Codex a narrow task with the relevant specifications, the specific files in scope, and an explicit instruction to preserve established campaign facts. Ask for a concise change summary and unresolved questions. Review prose for factual claims and inspect image results before adding them to the journal.

For cost-conscious delegation, use a lower-cost model for narrow, independent work such as proofreading a single record, checking metadata completeness, or proposing alt text. Keep architectural decisions, cross-record historical interpretation, and final review with the primary author or parent Codex. Delegation is optional and offers no guaranteed or quantified savings; parallel edits to overlapping content create merge and consistency risks. Provide only the context needed for the scoped task.

Codex must not silently convert guesses, rumors, or character testimony into established history. When information is missing, preserve the unknown or ask the author. See [04-content-authoring.md](04-content-authoring.md) for claim conventions and [06-art-generation.md](06-art-generation.md) for artwork handling.

## Publishing workflow

The proposed local `npm run publish` workflow follows the handoff defined in [09-ci-cd.md](09-ci-cd.md):

1. Validate authoring content and references.
2. Prepare local originals and variants, updating manifest metadata to describe their immutable keys, hashes, dimensions, and formats.
3. Run publish-mode validation on the prepared manifests.
4. Upload missing originals and variants to R2; never automatically delete remote objects.
5. If preparation changed tracked files, stop. The author reviews and commits/pushes the manifest and content changes.
6. On a clean tree at the exact pushed `main` revision, rerun `npm run publish` to dispatch `workflow_dispatch` for that exact SHA.
7. GitHub Actions verifies referenced remote assets, builds, and deploys the site to GitHub Pages.

Manifest metadata describes the bytes and intended keys; it is not an upload-success receipt. If upload fails, leave prepared files/manifests available for retry, report the failed asset IDs/keys, and do not dispatch publication. A content-only change can be built and previewed without image credentials. Full local publish may still need R2 credentials for remote existence/readability checks; credential-minimal CI can perform those checks with its scoped read-only credential. CI does not generate images or silently create paid artwork. A fetch-original/optimize recovery command in CI may be considered later, but is optional and must not block the basic workflow.

## Credentials and local configuration

Recommended local setup documents only the credentials needed for a task. The browser receives public asset URLs and no Cloudflare credentials. Local upload credentials should be narrowly scoped to the asset bucket. GitHub Actions credentials should be stored as repository secrets or environment secrets and scoped to asset verification/deployment needs. Use short-lived credentials where practical. Exact variable names and token permissions belong in [08-infrastructure.md](08-infrastructure.md) and [09-ci-cd.md](09-ci-cd.md), after provider details are verified. Terraform state and its snapshots can contain sensitive values; keep all such files and artifacts private, even though campaign content is public.

The remote Terraform state bucket is distinct from the public asset bucket. Its initial bootstrap and backend initialization are a one-time manual setup. Do not run `terraform apply` as part of routine content publication. State locking behavior remains subject to verification in the infrastructure specification.

Recommended repository hygiene: keep `.local/` out of Git, commit the package lockfile and generated manifests that are part of the content source, and avoid committing ephemeral build output. Review the ignore rules when adding a new image-processing or build directory so an original cannot slip into the public repository by accident.

Recommended commit practice is to group a coherent content or code change and use a message that names its purpose. Before pushing, inspect `git status` and the diff for accidental originals, secrets, generated caches, or unrelated Codex edits.

## Tradeoffs and dependencies

Local image processing keeps source assets and paid generation outside CI, but requires the author to retain local originals. The two-pass publication workflow adds a rerun after review, while making manifest changes visible before site deployment. Proposed scripts should remain small and idempotent rather than becoming a general publishing platform.

Dependencies: local conventions and asset lifecycle in [07-asset-management.md](07-asset-management.md), infrastructure credentials in [08-infrastructure.md](08-infrastructure.md), workflow implementation in [09-ci-cd.md](09-ci-cd.md), and validation in [10-testing-quality.md](10-testing-quality.md).

## Failure handling

Recommended behavior is to stop at the first publication boundary that could leave references inconsistent. If validation fails, do not optimize or upload. If upload fails, preserve prepared manifests/files for retry and do not claim the upload succeeded. If manifest changes are present, report the changed files and stop for review. If the CI workflow cannot verify a referenced R2 object, fail before the site build/deploy stage and include the asset ID and object key in logs without exposing credentials.

Local Vite preview should remain usable without Cloudflare credentials. If remote imagery is unavailable, the interface should show a clear missing-image placeholder during development rather than preventing the rest of the reader from loading.

Recommended troubleshooting notes should start with reproducible checks: confirm the Node version, reinstall from the lockfile if dependency state is inconsistent, run validation independently of the browser, and inspect the browser console for route or asset URL errors. Keep fixes in source/configuration, not one-off local workarounds.

## MVP and later

MVP: documented Node/npm setup, local Vite preview, content validation/build, local image preview, and guarded publish handoff. Later: a development-only gallery/studio if plain local previews prove inconvenient; optional remote-original recovery; additional delegated editorial helpers.

## Acceptance criteria

- A new contributor can install dependencies and preview the application using documented commands.
- A content-only change can build and preview without local image credentials.
- New images are optimized and uploaded before the site deploy that references them.
- Upload failure leaves prepared manifests/files retryable and never proceeds to dispatch.
- Publication stops for review when it changes manifests or content, and deploys only from the exact clean pushed `main` revision.
- Credentials remain outside the browser bundle and public repository; Terraform state and snapshots are handled as private data.
- Codex instructions preserve historical attribution and leave reviewable diffs.
