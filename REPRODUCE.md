# Reproduce the current website checks — 16 October 2026

This is a Git checkout. Read `PROJECT_STATE.json`, `STATUS.md` and `docs/WEBSITE_COMPLETION_2026-10-16.md` first; the dated export notes below are retained historical evidence, not current repository or release identity. The local and private Sites repositories have separate commit histories, bound by byte-for-byte source comparisons and the deployment receipts. `/api/revision` must match the recorded private source commit.

The current bounded suite runs on Node v26.8.2, macOS arm64, with existing installed dependencies. Use sequential tests and an inherited heap limit:

```sh
rtk proxy env NODE_OPTIONS=--max-old-space-size=128 node --experimental-strip-types --test --test-concurrency=1 scripts/*.test.mjs
rtk proxy env NODE_OPTIONS=--max-old-space-size=128 npm run check:editorial
rtk proxy env NODE_OPTIONS=--max-old-space-size=128 npm run check:state
rtk proxy npm audit --omit=dev --audit-level=low --json
rtk proxy git diff --check
```

Do not start installs, full typechecks/builds or browser processes below the 512 MiB free-plus-speculative-memory admission floor or during unsafe pageout pressure. Bounded tests do not replace the full release build. Both build prehooks generate the editorial shards and exact-byte image module, then explicitly run `tsc --noEmit --incremental false`. The current private Sites provider runs the full Workers build. The completion receipt records the exact candidate; it does not claim a new Vercel, owner-authenticated browser, physical-device or screen-reader certification.

`scripts/private-release-smoke.mjs` is the explicitly hosted, read-only exception to the local-only scripts below. It targets the fixed existing private Site, takes its existing access credential through hidden terminal input, checks the exact source revision, reader routes, draft isolation, access restrictions and image bytes/headers, and writes a fresh non-overwriting receipt. Never put credentials in command arguments, files or documentation. The script cannot substitute for an owner-authenticated visual review or database write/restore exercise. Preserve failed receipts before repairing and rerunning affected checks.

# Historical export-era reproduction notes — September 2026

The following notes preserve their original environment and outcomes. Claims about absent `.git`, null runtime revision and unverified CI apply to that earlier export only.

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
