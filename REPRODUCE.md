# Reproduce the local checks

Run from the repository root. Install requires network access; runtime/browser checks require loopback sockets. Do not point local smoke scripts at production. All requests use reserved `.invalid` email addresses; no email is sent.

```sh
npm run install:ci
npm test
npm run check:editorial
node --experimental-strip-types scripts/content-index.mjs
npm run lint
npm run typecheck
npm audit --omit=dev
npm run build
node scripts/workers-intake-smoke.mjs
npm run build:vercel
node --experimental-strip-types scripts/next-runtime-smoke.mjs
```

`workers-intake-smoke` applies every SQL migration to a fresh `.wrangler/intake-smoke-<timestamp>` database, starts an owned local Workers process, checks pending newsletter persistence, throttling, private submission persistence and triage, then stops its process. Test data remains local for inspection. Its receipt is written under `verification/astra-2026-09-27/`.

For a persistent manual local preview:

```sh
node --import ./scripts/sites-env.mjs node_modules/wrangler/bin/wrangler.js d1 execute DB --config dist/server/wrangler.json --local --persist-to .wrangler/state --file drizzle/0000_quick_stephen_strange.sql
```

Apply the second migration with the same command and `--file drizzle/0001_bent_roland_deschain.sql`, then run `npm start`. Never add `--remote` to these test commands. Do not blindly reapply migrations to an existing database; back up and inspect migration state first.

## Browser verification

The browser tools are isolated from the product dependency lockfile:

```sh
mkdir -p .cache/browser
npm install --prefix .cache/browser --no-save --no-package-lock --ignore-scripts --no-audit --no-fund playwright@1.56.0
node .cache/browser/node_modules/playwright/cli.js install chromium
BROWSER_TOOLS_DIR=.cache/browser node scripts/browser-smoke.mjs
```

On the tested Mac, the browser archive extraction did not finish. The retained run used installed Chrome instead:

```sh
BROWSER_TOOLS_DIR=.cache/browser BROWSER_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node scripts/browser-smoke.mjs
```

The script owns and stops its Next.js server, checks 375/768/1440px layouts and interactions, records screenshots and `browser-artifacts/receipt.json`, and blocks external writes. Browser form-success cases explicitly mock receipts; actual database persistence is checked separately in the Workers smoke. Local navigation/resource samples are diagnostic observations, not field Core Web Vitals.

## Editorial sources and identity

```sh
node --experimental-strip-types scripts/source-links.mjs
node --input-type=module -e 'import { sourceIdentity } from "./scripts/source-identity.mjs"; console.log(JSON.stringify(sourceIdentity(), null, 2))'
```

The link check performs bounded GETs to the cited public URLs and records status without saving full source bodies. HTTP 403, DNS and TLS failures remain unverified; do not bypass certificate checks. A 200 response is not claim verification or a rights licence.

This checkout is an exported directory without `.git`. Source SHA-256 binds app, components, lib, content, db, migrations, public assets, scripts and key dependency/build configs; it is not a Git SHA. `/api/revision` correctly returns 503 with null revision here. Do not invent a deployment revision to satisfy a release gate.

The earlier Turbopack build failed during worker/port setup; webpack is the retained successful Next.js path. Vinext's notice that it ignores the Node-only `webpack` config and cannot statically classify every route is expected; local Workers HTTP/persistence checks exercise the result. Node 26 reports `module.register` deprecation in dependency tooling. Hosted CI and Node 22 execution remain unverified in this session.
