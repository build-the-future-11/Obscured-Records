# Obscured Records: website repair and launch closure

## Start with the actual code, not a new redesign

Repository: `build-the-future-11/Obscured-Records`.
Repair base: `a8eba914bbec9e601ceb7c233503a45c7baf1bd7` on `main`.
Repair branch: `fix/codex-website-hardening-20260926`.
This is a code-review candidate, not permission to merge or deploy.

Read this file, `docs/VERCEL.md`, the current diff, and issue #4 before working.
Preserve the publication identity, existing editorial layout, article URLs,
archive, sourcing, correction policy and approved content. Do not publish new
articles, invent audience metrics, or replace real functionality with a demo.

## Diagnosed failure and this repair

CI run `36217529097`, job `108336382091`, passed lint, TypeScript and the
Vinext/Cloudflare build, then failed collecting Next.js page data for
`/api/newsletter`. `lib/newsletter-store.ts` imported `cloudflare:workers` at
module evaluation time. That runtime does not exist in Node/Vercel.

The repair defers Workers binding discovery until a storage operation. It does
not create a Vercel newsletter database. Missing storage returns 503, never a
fake successful subscription. D1 writes must explicitly confirm success.

The signup handler now limits streamed bodies to 4096 bytes, rejects malformed
JSON and non-object payloads, checks media type and request origin, preserves
the honeypot, normalizes email, avoids PII in logs, and marks responses no-store.

Search handles repeated `q` parameters, limits query length to 200 characters,
and derives its archive count from the data. The client adds menu focus trapping
and restoration, bounded signup requests, duplicate-submit protection, unique
form IDs, accessible feedback and honest clipboard fallback handling.

## Verify without spending or touching production

Use one build/test process at a time. Do not terminate unrelated applications.
A Node heap limit is not a guarantee of total machine memory use.

```sh
export NODE_OPTIONS="--max-old-space-size=4096"
npm run install:ci
node --test scripts/run-framework.test.mjs
node --experimental-strip-types --test scripts/newsletter.test.mjs scripts/search-query.test.mjs
npm run lint
npx tsc --noEmit
npm run build
npm run build:vercel
node scripts/next-runtime-smoke.mjs
```

The two new regression suites passed 42 tests in the isolated authoring
environment. The runtime smoke script must run against a real Next.js build;
syntax checks and CLI doubles do not count as production evidence. CI retains
both builds and adds the real local-server smoke. Read exact-head results.

The smoke checks local pages, a real article, 404s, search with repeated
parameters, feed/sitemap/robots routes, JavaScript and CSS responses, runtime
revision, and newsletter 400/413/415/503 behavior. It starts and stops only its
own local process. It never calls a production newsletter endpoint.

## Finish the following in order

1. Obtain passing exact-head CI with both framework builds and runtime smoke.
   Diagnose actual failing steps. Never disable checks, suppress type errors,
   weaken assertions, or mark skipped jobs successful.
2. Reconcile draft PR #7 (`relaunch-current-main-restack-20260925`) with current
   main and this repair using a three-way diff. Its inspected head was
   `6b744f8be51d37a3bbf15171e342d3a2bb539158`; do not assume that is still current.
   Preserve its editorial checks, canonical-origin work, discovery/feed changes
   and intake controls. Do not overwrite this repair's CI or request validation
   with an older version. PR #3 is an older draft, not a second release to merge.
3. Test the rendered site at 375, 768 and 1440 pixels. Verify article reading,
   navigation, search/empty states, overflow, keyboard-only menu operation,
   focus return, Escape, clipboard denial, API failure, timeout and duplicate
   submissions. Capture screenshots and console/network errors. Repair defects,
   not the visual identity. This browser validation remains outstanding.
4. Verify the production project and approved origin. Historical public URL:
   `https://obscured-records-tawny.vercel.app/`. Do not replace it with an assumed
   domain. Check metadata, canonical links, OpenGraph, RSS, sitemap and robots
   against the approved origin, not merely a local success response.
5. Close backend release gates with real evidence: approved newsletter provider,
   durable storage, consent and unsubscribe behavior; authorized submission dry
   run; content/rights review; privacy-reviewed analytics; audio requirements
   where accepted. Do not send a newsletter or create production subscribers
   just to make a test green. Do not log private data or invent credentials.
6. Record one release SHA, deployment attribution, rollback target, exact tests,
   screenshots and remaining human gates under issue #4. A GitHub commit is not
   a deployed website. Only an explicitly authorized release may merge/deploy.

## Required finish report

Report implemented files and commit, exact-head checks with links, runtime
smoke result, browser checks actually run, remaining launch blockers, and the
single next owner action. No speculative claims of live traffic, delivery,
production deployment, or full end-to-end certification.
