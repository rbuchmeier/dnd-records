# Artwork infrastructure

This stack owns `dnd-records-assets`, its public development URL, and read-only
browser CORS. The separate `dnd-records-tfstate` bucket was created with Wrangler
on 2026-10-09. Its `r2.dev` access is disabled and it has no custom domains. It is
deliberately not owned by this stack, so an application teardown cannot delete
its own backend.

Account: `1cc8e0849274de00586869b1e28af330`. Default jurisdiction, Standard storage.
No DNS, Workers, lifecycle expiration, or automatic object deletion is configured.
Public artwork must not contain private campaign material or credentials.

## Tooling

Use Terraform **1.16.5** and Cloudflare provider **5.27.0**. The provider lockfile
is tracked. The system Terraform 1.6.6 is too old for the selected S3 state locking.
The wrapper uses the ignored binary at
`.local/tools/terraform-1.16.5/terraform`, or an absolute `TERRAFORM_BIN` override.
On another machine, download the matching architecture from
[HashiCorp's release](https://releases.hashicorp.com/terraform/1.16.5/), verify its
SHA256 against the official checksum list, and extract it to that directory.
This does not require replacing a system-wide installation.

## Credentials (local only)

Fill the ignored `.env.terraform` file with these three values:

```dotenv
CLOUDFLARE_API_TOKEN=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

- Management token: Account → Workers R2 Storage → Edit, restricted to this
  account. No zone/DNS permission is needed.
- Backend access key and secret: a separate R2 Object Read & Write credential
  restricted to `dnd-records-tfstate`. It must be able to delete lock objects.

Keep the file readable only by its owner (`chmod 600 .env.terraform`). Never put
credentials in `VITE_*` variables, HCL, command arguments, Git, or chat. The npm
wrapper loads this file into the Terraform process environment. Wrangler's OAuth
login does not supply Terraform's S3 backend credentials.

[Create R2 credentials](https://developers.cloudflare.com/r2/api/tokens/).
[Create the management token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

## Required backend/locking verification

Do this before the first artwork apply. The fixture has only a built-in
`terraform_data` resource; it does not create Cloudflare infrastructure.

```sh
npm run infra:terraform -- --lock-test init -backend-config=../backend.r2.hcl -backend-config=key=checks/locking/terraform.tfstate
npm run infra:terraform -- --lock-test apply
```

Leave the first apply waiting at its confirmation prompt. In a second terminal:

```sh
npm run infra:terraform -- --lock-test plan -lock-timeout=5s
```

The second command must fail to acquire the lock. Approve the first fixture
apply, then rerun its plan and confirm no changes (state read/write and lock
cleanup). If locking fails, stop; never work around it with `-lock=false`.
Destroy only the fixture resource afterward with
`npm run infra:terraform -- --lock-test destroy`. Its small, non-secret test state
can remain at the isolated `checks/locking/terraform.tfstate` key. Do not delete
an active `.tflock` or use force-unlock on a running operation.

## Provision the image bucket

After the locking check succeeds:

```sh
npm run infra:terraform -- init -backend-config=backend.r2.hcl
npm run infra:terraform -- validate
npm run infra:terraform -- plan -out=artwork.tfplan
npm run infra:terraform -- apply artwork.tfplan
npm run infra:terraform -- output -raw asset_base_url
```

Inspect the plan: only the artwork bucket, its managed domain, and CORS should
be added. The state key is `state/campaign/terraform.tfstate`; locking is always
enabled. The image bucket has `prevent_destroy`. Do not put retention rules on
live state/lock keys: state must be overwritten and locks removed. Before future
changes, retain a private state snapshot outside Git.

For offline configuration checks (no credentials or cloud writes):

```sh
npm run infra:terraform -- init -backend=false
npm run infra:terraform -- validate
npm run infra:terraform -- test
```

Mock-provider tests validate configuration, not live backend compatibility.

## Connect the reader

Upload the bundled preview files under the same `art/` keys. For example, after
Terraform creates the bucket:

```sh
npx wrangler r2 object put dnd-records-assets/art/arrival.webp --file=public/art/arrival.webp --content-type=image/webp --remote
```

Repeat for `threshold.webp` and `relic.webp`, then verify unauthenticated GETs at
the public URL return the expected images. Wrangler uses the existing login;
the state credentials must never be reused for artwork uploads. These three demo
keys are a preview exception; the full immutable artwork pipeline remains future
work.

Set `VITE_ASSET_BASE_URL` in `.env.local` to the `asset_base_url` output, with no
`/art` suffix. Restart Vite. For deployment, supply the same public variable at
build time. The application appends the authored `art/*.webp` paths and continues
to lazy-load images. An unset/blank variable uses bundled files, including under
a GitHub Pages project subpath. Changing it requires restarting/rebuilding, not
changing content. Keep `.env.terraform` separate from frontend configuration.

The domain-free `r2.dev` origin is rate-limited and intended for development.
Before production, select a custom domain, configure it separately, and disable
the development URL via `enable_development_url = false`.
The provider warns that removing the managed-domain resource from Terraform
does not delete it in Cloudflare; disable it explicitly before removing it.

## Verified rollout — 2026-10-09

- `dnd-records-tfstate`: private; both public-access methods checked after apply.
- R2 backend initialized at `state/campaign/terraform.tfstate`.
- Terraform 1.16.5 locking probe passed: a held apply caused a second process to
  fail with HTTP 412 `PreconditionFailed`; after the first apply, a fresh plan
  successfully read state and reported no changes. The fixture resource was
  destroyed afterward; its empty state remains under `checks/locking/`.
- Applied Cloudflare provider 5.27.0 plan: three resources added, no changes or
  deletions. A follow-up plan reported no changes.
- `dnd-records-assets`: Standard storage, protected from Terraform destruction,
  with public development access and GET/HEAD CORS for the documented origins.
  A plan-only destruction check was rejected by `prevent_destroy`; no bucket
  deletion was applied.
- Image origin: `https://pub-a038eaee886e47f389756a4e7c054927.r2.dev`.
- Uploaded `art/arrival.webp`, `art/threshold.webp`, and `art/relic.webp` using
  Wrangler OAuth. Unauthenticated GETs returned HTTP 200, `image/webp`, correct
  CORS headers, and byte-identical SHA256 hashes against the bundled files.
- `.env.local` selects the public image origin for local development/builds.
  The live browser smoke test loaded all nine comic panels from R2 with lazy
  loading retained and no local-art fallback requests.
- All 44 browser tests passed with R2 enabled. Wireframe HTML stays on the app
  origin. The GitHub Pages subpath build passed; a scan of all 30 build files
  found none of the local Terraform credential values.

Rerun the live browser check with the local server using this origin:

```sh
EXPECTED_ASSET_BASE_URL=https://pub-a038eaee886e47f389756a4e7c054927.r2.dev npm run test:e2e -- tests/remote-art.spec.ts
```

Deployment CI still needs this public `VITE_ASSET_BASE_URL` value supplied at
build time. GitHub Pages deployment, immutable asset publishing, and independent
backups remain separate work. No custom domain or DNS settings were changed.
