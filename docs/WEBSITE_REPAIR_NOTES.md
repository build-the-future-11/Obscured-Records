# Website repair: 26 September 2026

## Hosting boundary

The Vercel/Next.js build and the Workers/Vinext preview remain separate.
The Next.js route can now be imported without initializing Workers bindings.
The Workers newsletter still uses its existing D1 binding and table.

**This repair does not provision newsletter storage for Vercel.** A genuine
signup in that unconfigured runtime returns HTTP 503 and the form displays the
failure. No in-memory fallback, fake success, database migration, newsletter
send, or production-data mutation is introduced. Storage and unsubscribe
certification remain release gates in issue #4.

## Regression commands

- `node --experimental-strip-types --test scripts/newsletter.test.mjs scripts/search-query.test.mjs`
- `npm run build:vercel && node scripts/next-runtime-smoke.mjs`

The first command is dependency-free and verifies the real handler/query
helpers plus an injected D1 interface. The second starts the real built Next.js
server, checks pages/assets/error responses/revision, and stops its own process.
Neither command is evidence that the public Vercel site has been deployed.

CI keeps installation-input verification, lint, typechecking, the existing
routing tests, the Cloudflare build, and the Next.js build. It adds the new
regressions and local runtime smoke without weakening existing checks.

See `docs/CODEX_WEBSITE_HANDOFF.md` for the remaining relaunch integration,
browser inspection, provider and deployment evidence requirements.
