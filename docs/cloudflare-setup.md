# Cloudflare setup for the later public release

The local design preview needs no Cloudflare configuration. Source is on GitHub; the eventual website remains on GitHub Pages. Cloudflare supplies artwork storage and Terraform's private remote state.

## Setup status — 2026-10-09

- Cloudflare account ID: `1cc8e0849274de00586869b1e28af330` (non-secret).
- Wrangler authorization and the account ID have been verified directly. Approved network commands now work.
- Created `dnd-records-tfstate`; verified `r2.dev` is disabled and no custom domains are attached.
- No custom domain for the initial preview; GoDaddy/DNS settings are unchanged. The artwork stack uses a development-only `r2.dev` origin.
- Terraform 1.16.5 is installed project-locally (system 1.6.6 unchanged). The artwork configuration pins Cloudflare provider 5.27.0.
- The management token and state credentials are configured in ignored, owner-only `.env.terraform`. Their values were not displayed or put in tracked files.
- Remote state and live lock contention/release checks passed. Terraform created `dnd-records-assets`, its managed development domain, and read-only browser CORS. A follow-up plan reports no drift.
- Uploaded and verified all three demo images at `https://pub-a038eaee886e47f389756a4e7c054927.r2.dev/art/`. `.env.local` configures the reader to use this origin; the browser smoke test confirms all comic images load from R2.
- See the [infrastructure runbook](../infra/README.md) for exact resource ownership, versions, configuration, and verification results.

## Information to provide

1. **R2 activation:** enable R2 in the new Cloudflare account and complete any billing setup Cloudflare requires. A Cloudflare account alone does not activate R2 token creation. [R2 authentication](https://developers.cloudflare.com/r2/api/tokens/).
2. **Account ID:** the account identifier shown in the dashboard. It is configuration, not a secret token.
3. **Asset domain choice:** tell us whether you own a domain you want to use, such as `assets.example.com`. A production R2 custom domain uses a domain in the Cloudflare account. The `r2.dev` endpoint is a rate-limited development alternative, not the intended production origin. No domain purchase is required to review the local design. [Public R2 buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).

## Credentials to configure locally when infrastructure work begins

Do not paste credentials into chat or commit them to the public repository.

| Purpose | Credential | Scope |
|---|---|---|
| Terraform Cloudflare resources | Cloudflare API token via `CLOUDFLARE_API_TOKEN` | R2 management (`Workers R2 Storage Write`) for the selected account; selected-zone access only where the chosen domain setup requires it |
| Terraform backend | Separate R2 access key ID/secret exposed to Terraform as `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Object Read & Write for the private state bucket only |
| Local image uploader | R2 access key ID/secret via `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Object Read & Write for the public asset bucket only |
| CI asset verification | Different R2 read-only access key ID/secret, stored as GitHub Actions secrets | Object Read only for the public asset bucket only |

R2 data-plane keys and the Cloudflare management token serve different APIs. Bucket-scoped object keys are created after the relevant bucket exists. Keep saved credentials in your password manager/local credential environment and expose only the ones required for the current task. [R2 permission types](https://developers.cloudflare.com/r2/api/tokens/).

## Remaining work

The state and artwork buckets are operational. Next, implement immutable artwork publishing and asset verification, create dedicated uploader/CI credentials when those tools need them, and connect GitHub Pages deployment. Current demo uploads use Wrangler OAuth rather than the future S3 uploader. Select an independent backup destination before uploading irreplaceable campaign art. For production R2 delivery, replace the rate-limited development URL with a custom domain. Architecture and protection requirements are in [08-infrastructure.md](specs/08-infrastructure.md).

No public website deployment or DNS changes were performed by this infrastructure rollout.
