# GitHub Pages

The site is published at <https://rbuchmeier.github.io/dnd-records/>.

`.github/workflows/pages.yml` builds and deploys committed source on every push
to `main`. It can also be run manually from the repository's Actions tab.
GitHub Settings → Pages must use **GitHub Actions** as its build source.

The workflow installs locked dependencies with `npm ci`, uses the Node.js version
in `.nvmrc`, and runs the TypeScript/Vite production build. Only the resulting
`dist/` directory is uploaded. Deployment uses GitHub's built-in token; no cloud
credentials or repository secrets are required.

`SITE_BASE_PATH=/dnd-records/` keeps scripts, styles, and bundled artwork under
the GitHub Pages project path. Hash routing supports direct links and refreshes.
Artwork is bundled from the repository; this deployment does not require R2.

To check the same build locally:

```sh
npm ci
SITE_BASE_PATH=/dnd-records/ npm run build
SITE_BASE_PATH=/dnd-records/ npm run preview
```

Open <http://127.0.0.1:4173/dnd-records/>.

The initial deployment uses application commit `ddbad24`, plus the deployment
workflow and this document. Uncommitted local content and artwork are excluded.
Earlier documents describing Pages deployment as planned predate this setup.
