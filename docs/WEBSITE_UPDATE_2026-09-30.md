# Website implementation — 30 September 2026

This change updates the reader and contributor application. It does **not** grant human editorial approval, enable a public audience, send email, import subscribers, activate analytics or certify a production deployment. The public-launch HOLD and all 42 unpublished drafts remain unchanged.

## Implemented

- Homepage curation is in `lib/homepage.ts`, with published-catalog-only resolution, unique slots and safe fallbacks. The latest list excludes stories already featured above it.
- Shared real-author profiles control initials, biographies, roles and optional contact details. An unrecognized contributor cannot inherit Ryan's founder credit or contact details.
- `/contribute` explains the editorial workflow and offers beginner-friendly introductions. Work samples are optional for introductions only. Corrections, pitches, rights and source submissions retain the existing HTTPS-source requirement. All intake remains private and requires consent.
- The Brief is explicitly a waitlist. Consent is unchecked and required both in the browser and server handler. New rows remain `pending_confirmation`; unsubscribe and suppression states are not overwritten. No mail service is implied. Unavailable storage preserves the text and offers ordinary email/RSS alternatives.
- Workers continues to use its native D1 binding. Node/Vercel may use the same database through an optional, server-only D1 REST adapter. Queries remain parameterized and share the existing durable rate limits. No in-memory success path, auto-created database or hard-coded credentials exist.
- Canonical URLs prefer explicit operator configuration; Vercel can use its platform-provided **production** origin. Request Host headers and preview URLs never become canonical by inference.
- All pages have a branded 1200×630 PNG sharing fallback. Article cover metadata uses only currently displayed media. Known image dimensions are used rather than a universal placeholder ratio.
- Therac-25, Wirecard and Lake Nyos covers are withheld from reader projections and sharing previews pending the provenance decisions already identified in the release checklist. Original files and research records are retained for review; this is not a legal finding or a removal of those public assets from the repository.
- Cloudflare Web Analytics integration is present but disabled unless both approval and a valid token are configured. Do Not Track and Global Privacy Control prevent script loading. No custom editorial events, queries, emails, notes or form data are forwarded by this integration. Page/performance metrics are not newsletter-conversion measurement.

## Configuration

No secrets belong in source code, `NEXT_PUBLIC_*`, artifacts, screenshots, issues or a pull request. Set private credentials through the hosting provider's secret controls.

| Variable | Purpose / default |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` or `SITE_URL` | Explicit HTTPS canonical origin without path, credentials, query or fragment. Use the same value for build and runtime. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Vercel platform production hostname fallback when `VERCEL=1`; never substitute `VERCEL_URL` from a preview. |
| `CLOUDFLARE_ACCOUNT_ID` | Optional server-only D1 REST account ID. Native Workers DB binding takes precedence. |
| `CLOUDFLARE_D1_DATABASE_ID` | Optional server-only existing D1 database UUID. |
| `CLOUDFLARE_D1_API_TOKEN` | Optional server-only API token authorized for the intended D1 account/database operations. Grant least privilege supported by the provider. |
| `NEXT_PUBLIC_ANALYTICS_APPROVED` | Defaults off; only literal `true` permits the reviewed analytics integration. Requires a rebuild. |
| `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` | Public 32-hex site beacon token, not a private Cloudflare API token. Does nothing without the approval flag. |

Without a native DB binding or all three valid private D1 variables, intake continues to return a visible 503. Merely setting credentials does not establish that production migrations, backup, permissions or storage have been tested. Do not put the private D1 token into the public analytics variable.

The REST adapter uses a fixed Cloudflare endpoint, rejects redirects, bounds each request and its overall intake budget, checks positive provider acknowledgments, and sanitizes errors. Network/platform timing may still cause uncertain outcomes; a timeout is not proof that a remote write did not happen. Retry only deliberately, using the returned receipt when available.

## Verification

`npm test` runs existing tests and new homepage, attribution, origin, privacy, consent, media and D1-adapter regressions. The D1 protocol tests execute actual SQL against isolated in-memory SQLite; they do not contact a real Cloudflare account or certify provider connectivity.

`npm run check:editorial` retains 28 public records, 42 unpublished drafts and the established metadata checks. It is not factual review.

CI checks both Workers and Next/Vercel production builds, local Workers storage, all article routes, interaction/error handling, responsive layouts at 320/375/768/1440px, and automated axe accessibility checks at 375/1440px plus intake error states. Exact-source and browser artifacts are tied to the CI source SHA. A completed run, not this description, supplies the pass/fail evidence. No app dependency or lockfile changes are needed; browser tools are isolated in runner temporary storage.

## Still required for a live public release

Verify a provider deployment of the exact source; test the chosen canonical origin and asset MIME types; perform a controlled production receipt/backup/restore exercise; confirm editorial intake ownership; review launch copy and media provenance; and explicitly authorize the audience change. Confirmation-email delivery, unsubscribe/suppression mail integration and broadcast tests remain separate work. Do not mark issue #4 closed just because the build passes.

## Technical references

- Cloudflare D1 query API: https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/
- Cloudflare Web Analytics setup: https://developers.cloudflare.com/web-analytics/get-started/
- Next.js metadata files: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
