# Website launch checklist — private release verified; public launch HOLD

Updated 27 September 2026. Runtime revision: `bfd7158f7d19aa5094c90dba3d7c2c9e72f24379`. [Execution report](LAUNCH_EXECUTION_2026-09-27.md) · [Operations](LAUNCH_OPERATIONS_2026-09-27.md).

The user's instruction to execute this checklist authorized implementation and the existing owner-only deployment. It did not supply human editorial approval or explicit permission to disclose unpublished drafts in a public repository.

## 1. Repository and hosting

- [x] Recover authoritative Git history and reconcile all 194 original exported files without overwriting local work.
- [x] Create a release branch and immutable source commits.
- [x] Select the existing owner-only Sites/Workers deployment and intended D1 database; preserve its audience.
- [x] Configure the actual site origin and release revision through the provider.
- [x] Build and push the exact candidate to the private Sites source repository.
- [x] Deploy that candidate and retain the provider's successful deployment receipt.
- [ ] Obtain explicit permission before a public GitHub push exposes 42 drafts and internal review documents. Automatic approval review rejected this disclosure.
- [ ] Run hosted GitHub CI once an approved source-publication path is available. Local and Sites build-workflow checks passed; these are not a hosted CI receipt.
- [ ] Name and obtain acceptance from the human release/incident owner.

## 2. Editorial and media

- [x] Preserve the 28 existing public records and keep all 42 review drafts unpublished.
- [x] Repair the NASA Aral Sea and CDC Tuskegee links that redirected to generic pages.
- [x] Strengthen source auditing so generic redirects and HTTP 202 challenges cannot count as verified access; retain failed receipts.
- [x] Audit 70 cited URLs: 54 direct reachable and 16 direct access-unverified, with separate browser-access evidence for eight of those 16.
- [x] Record image-source/licence links, correct Wirecard attribution and disclose transformations.
- [x] Reduce the five served images from 3,238,479 to 597,420 bytes (81.6%) while preserving original files and dimensions.
- [x] Prepare record-by-record editorial approval and media-rights review queues.
- [ ] Obtain a named human editor's launch selection and claim-level approval for the existing records.
- [ ] Close remaining source-to-claim gaps. URL reachability is not fact-check approval.
- [ ] Verify actual authorship/reviewer credits and retain AI-assistance disclosures.
- [ ] Resolve Therac-25's contradictory image provenance and final Wirecard/Lake Nyos derivative provenance before public launch.
- [ ] Review and approve any draft individually before publishing it; publishing all 42 is not required for launch.

See [source review](SOURCE_REVIEW_2026-09-27.md), [media review](MEDIA_REVIEW_2026-09-27.md), and [editorial queue](LAUNCH_EDITORIAL_REVIEW_2026-09-27.md).

## 3. Production storage and operations

- [x] Inspect the intended live database before deployment and retain its complete empty-newsletter-table snapshot.
- [x] Apply the additive release migration through Sites; verify the new submission and rate-limit tables exist.
- [x] Verify controlled live signup and submission writes using clearly labelled example.invalid test records.
- [x] Confirm private database reads: one `pending_confirmation` signup and one `received` submission; duplicate signups did not create more rows.
- [x] Verify live validation, repeated-signup throttling, unavailable public submission reads, and owner-only access.
- [x] Exercise storage failures, retry behavior, suppressed-status preservation and local triage in automated tests; retain local evidence separately from live evidence.
- [x] Document additive migration handling and the exact prior saved version for application rollback.
- [ ] Complete a provider-supported backup/restore rehearsal; the empty pre-deployment snapshot is not restore certification.
- [ ] Obtain a monitored human operator's acceptance and perform acknowledgement, triage, escalation and closure of a controlled submission.
- [ ] Assign retention/deletion responsibility and confirm the published handling policy against real operations.

The two live test records are retained and clearly labelled; no email or external acknowledgement was sent.

## 4. Newsletter scope

- [x] Keep the implementation in pending capture-only mode with no email-sending promise.
- [x] Verify durable live capture, pending status, duplicate behavior and rate limiting.
- [x] Repair repeated-signup storage so unsubscribe, suppression, bounce and complaint statuses are preserved.
- [ ] Obtain the owner's explicit acceptance of capture-only scope. This is the current working assumption, not an invented decision.
- [ ] Deferred unless sending is selected: confirmation tokens and verified opt-in, authenticated sender/provider, unsubscribe/suppression delivery integration, and controlled end-to-end delivery checks.

## 5. Exact live release verification

- [x] Fix the production-only empty archive/section 404 issue by evaluating publication dates during requests rather than Worker initialization; add an epoch-zero regression.
- [x] Pass 137 automated tests, editorial integrity, lint, typecheck and both Workers/Next.js production builds.
- [x] Pass 41 local Workers/D1 integration checks and 167 built Next.js runtime checks after the fix.
- [x] Retain the earlier 50 responsive browser checks; the request-time fix was subsequently verified through hosted route/content checks.
- [x] Pass 58 authenticated live checks covering every section and public article, search, policy pages, feeds, draft/unknown 404s, validation and real persistence.
- [x] Match the live revision endpoint to the deployed source SHA and confirm anonymous access is rejected with HTTP 401.
- [x] Verify live canonical origin, author page, news sitemap, RSS/sitemap coverage and draft exclusion.
- [x] Verify actual live Chrome rendering: five decoded images, desktop/mobile layouts, article heading and no runtime errors; retain screenshots.
- [ ] Correct and reverify the hosted WebP Content-Type (`application/octet-stream` observed). Restore the missing Sites packaging helper before another release; keep the strict failed check.
- [ ] Complete representative physical-device and screen-reader review; automated viewport checks do not substitute for these.
- [ ] Measure representative live slow-network behavior and obtain field performance evidence when enough real traffic exists.
- [ ] Confirm recurring uptime/error monitoring. The creation attempt returned no completion receipt; check for an existing automation before retrying.
- [ ] Rehearse application rollback/restore with the accepted incident owner.
- [ ] Obtain final editorial and operational sign-off before changing the site's audience or declaring public launch readiness.

## Optional after core launch

- [ ] Real analytics with verified collection and appropriate privacy handling.
- [ ] Reviewed, playable audio episodes.
- [ ] Verified sponsorship arrangements and disclosures.

These optional features remain unlaunched and do not block a reader-site launch unless explicitly selected. No unresolved human or external gate is marked complete by a passing local test or private deployment.
