# Vercel deployment

The source is a Next.js App Router application. The existing Vite/Vinext
configuration builds a Cloudflare worker and remains available for Sites/local
previews. A Cloudflare worker artifact is not a Vercel deployment artifact.

For Vercel, the committed `vercel.json` selects the already-installed Next.js
framework and builds the same application source without the Cloudflare Vite
plugin, Workerd, or local preview authentication middleware:

- Project root: repository root (`.`).
- Framework: Next.js (`nextjs`), not the static Vite preset.
- Install: `npm run install:ci` (the existing locked installer).
- Build: `npm run build:vercel` (`next build`).
- Output: `.next` (not `dist`, `dist/client`, or `dist/server`).

`npm run build` also selects Next.js when `VERCEL=1`. Local portable and
managed-Linux builds retain their original Vinext/Vite behavior. Calling Vite
directly with `VERCEL=1` fails with an actionable error instead of producing an
incompatible worker artifact. No new dependencies or lockfile changes are needed.

## Verify locally

```sh
npm run install:ci
node --test scripts/run-framework.test.mjs
npm run lint
npx tsc --noEmit
npm run build:vercel
npm run start:vercel
```

The routing tests use isolated CLI doubles; they are not compilation tests.
CI retains the real Cloudflare build and additionally runs a real Next.js build
with `VERCEL=1`, then checks that the Next.js server manifests were emitted.

## Release verification

After the connected Vercel project builds the intended commit, verify `/`, a
canonical `/article/[slug]`, `/search?q=aviation`, `/rss.xml`, `/sitemap.xml`,
`/robots.txt`, and `/api/revision`. The revision endpoint must report the exact
40-character deployed Git SHA, not merely an HTTP 200 response.

A successful Git commit or CI build does not establish that production has been
redeployed. Check the provider's deployment and the served revision separately.

Cloudflare D1/R2 bindings and Sites workspace-auth headers are not supplied by
Vercel. Do not enable features that require those services without a reviewed
provider-specific backend/authentication integration. The public archive remains
repository-backed; this change does not migrate data, change domains, or publish
editorial content.
