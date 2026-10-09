# Cloudflare setup for the later public release

The local design preview needs no Cloudflare configuration. Source is on GitHub; the eventual website remains on GitHub Pages. Cloudflare supplies artwork storage and Terraform's private remote state.

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

## Work performed after that information is available

Bootstrap a private state bucket, initialize and verify the R2 Terraform backend/locking, provision the public asset bucket and domain, configure scoped upload/read credentials, then connect asset verification and GitHub Pages deployment. Select an independent backup destination before uploading irreplaceable campaign art. The detailed procedure and remaining live compatibility checks are in [08-infrastructure.md](specs/08-infrastructure.md).

None of these resources or credentials has been created by the design-preview implementation.
