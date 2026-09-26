# Obscured Records website: integrated handoff

## Start here

Repository: `build-the-future-11/Obscured-Records`.
Working PR: #8, `fix/codex-website-hardening-20260926`.
Read the latest PR #8 verification receipt and issue #4 before continuing.
Fetch the actual branch head; do not reset it to an older SHA from this document.

This branch combines the Vercel build repair at
`07b09336cafb0b79ad92e378cb42b33023c70efb` and the reconciled relaunch work from
PR #7 at `6b744f8be51d37a3bbf15171e342d3a2bb539158`.
Do not merge the older PR #7 over this integration or regenerate a new design.
The previous 07b0933 head passed both framework builds and 32 runtime checks.
That receipt does not certify any newer head: use its own CI results.

## Implemented integration

- Preserves lazy Workers binding discovery and the stricter streamed signup handler.
- Preserves exact-source, locked-install, lint, typecheck, both builds and runtime gates.
- Adds editorial integrity, discovery/date/serialization regressions and Chromium tests.
- Corrects contact-address typos, page-specific canonicals and article dates.
- Adds safe JSON-LD/XML serialization, feed discovery and current-window news sitemap.
- Adds email sharing using canonical article URLs without tracking parameters.
- Adds skip navigation, inert modal background, responsive modal cleanup and reduced motion.
- Prevents no-JavaScript signup forms from submitting email in the URL; offers RSS.
- Preserves PR #7's editorial, intake, analytics, newsletter/audio and sponsor controls.

## Verification

```sh
npm run install:ci
node --test scripts/run-framework.test.mjs
node --experimental-strip-types --test scripts/newsletter.test.mjs scripts/search-query.test.mjs scripts/discovery.test.mjs
npm run check:editorial
npm run lint
npx tsc --noEmit
npm run build
npm run build:vercel
node scripts/next-runtime-smoke.mjs
```

For browser validation, install Playwright 1.56.0 in an isolated directory as CI
shows, set `BROWSER_TOOLS_DIR`, install Chromium, then run `npm run smoke:browser`.
This tests the local built application and records screenshots plus a JSON
receipt under `browser-artifacts/`. The successful-signup fixture is explicitly
mocked. No test creates a production subscriber or sends an email.
Run one heavy build at a time. Do not kill unrelated applications or weaken checks.

## Release boundary

A branch push is not a release. No main merge, deploy, provider/DNS changes,
newsletter send, production data mutation or new article publication is authorized
by this handoff. Article registry, article bodies, MDX archive and media assets
are preserved. The public repository must not contain confidential submissions.

Vercel newsletter persistence remains unconfigured in this code path and returns
503 honestly. Do not substitute memory storage, a fake success response or a
new paid provider. Real storage, consent, suppression/unsubscribe and delivery
need separately retained evidence.

The canonical fallback is the previously recorded Vercel candidate origin;
set NEXT_PUBLIC_SITE_URL/SITE_URL to the approved origin at build time. Do not
claim authoritative production attribution without a real deployment receipt.

## Remaining closure

Read exact-head CI including browser logs and screenshots. Fix failures rather
than bypassing tests. Confirm the chosen live origin and matching deployed SHA,
complete human editorial/rights and intake checks, and record provider and
rollback evidence in issue #4. Do not mark every launch gate closed because CI
passes. Report implemented commit, actual passing tests, browser artifact links,
and remaining external/human gates separately.
