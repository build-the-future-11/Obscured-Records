# Website launch checklist — HOLD

Updated 27 September 2026. Local implementation is verified; editorial clearance and production release remain open. The old Vercel address serves an older SPA. The existing owner-only Sites deployment is the selected target; its current access restriction is preserved. See LAUNCH_OPERATIONS_2026-09-27.md for identity, migration and rollback details.

Work through the numbered stages in order. Editorial review can proceed alongside production setup. Assign an owner to each stage and record dated evidence before marking any item complete. Preparing this checklist does not authorize deployment, production database changes, publishing drafts or sending messages.

## Verified local baseline

- [x] Reader routes, sections, search, related records, feeds and corrections are implemented.
- [x] Public content is separated from unpublished drafts: 28 public records and 42 drafts cover 50 distinct subjects; drafts are not approved publications.
- [x] Tests, editorial checks, lint and typechecking passed again during the latest status review.
- [x] Current application source digest matches retained successful Workers/Next.js builds, browser checks and actual local D1 persistence evidence.

These checks establish local behavior only. Detailed evidence and scope: [final report](../ASTRA_FINAL_REPORT.md), [limitations](../LIMITATIONS.md), [product audit](PRODUCT_AUDIT_2026-09-27.md).

## 1. Establish the repository and production setup

- [x] Recover and confirm the authoritative Git repository; preserve this exported folder and reconcile its changes without overwriting existing work.
- [ ] Confirm the production domain/origin, hosting account and person responsible for releases.
- [x] Choose the production host and database arrangement. Existing intake uses Cloudflare D1; Vercel/Node needs a compatible backend before forms can work.
- [ ] If retaining Vercel/Node, implement and test that backend while preserving validation, consent, private storage and durable rate limits. If using Workers, configure the real production D1 binding.
- [ ] Configure production settings and secrets through the hosting provider; replace local placeholder bindings and verify canonical URLs.
- [ ] Create an immutable release revision and run the repository's checks in hosted CI on its configured Node version.

Completion evidence: repository/revision, confirmed origin, host/backend decision, configuration verification without secret values, and successful CI receipt.

## 2. Complete editorial and media clearance

- [ ] Assign a named human editor and define which records are included in the launch.
- [ ] Review factual claims and attribution in the existing public records; the local engineering checks did not recertify their content.
- [ ] Review each draft selected for publication against claim-level sources, accurate attribution and the editorial approval checklist. Keep unapproved drafts unpublished; launching does not require publishing all 42.
- [ ] Resolve remaining source-access and claim gaps; the stricter new audit has 16 access-unverified URLs, with separate browser-access evidence for eight and close source-to-claim gaps. A reachable URL alone is insufficient evidence.
- [ ] Verify actual authorship/reviewer credits and retain appropriate AI-assistance disclosure; do not assign a human author without their involvement.
- [ ] Record licences or other documented reuse permission for every launch image, with accurate credits and stable hosting.
- [ ] Optimize large images and verify dimensions, alternative text, loading behavior and usable failure states.

Completion evidence: dated editor approvals, claim/source review notes, resolved-source records and image-rights inventory for the launch content.

## 3. Verify production storage and submission operations

- [ ] Review production database state and additive migrations before applying them; establish a backup, restoration procedure and rollback owner.
- [ ] Apply the reviewed migrations to the intended production database and retain migration receipts.
- [ ] Verify controlled newsletter-capture and contributor-submission writes and private operator reads against the real backend.
- [ ] Verify production access controls and that submission data cannot be read through public routes or unauthorized clients.
- [ ] Verify validation, rate limits, storage failures and retry behavior; issue a success receipt only after saving succeeds.
- [ ] Assign a monitored submission operator and document acknowledgement, triage, escalation and closure procedures.
- [ ] Complete a controlled submission-to-closure dry run and retain evidence without exposing personal information.
- [ ] Assign retention/deletion responsibility and ensure the published privacy information matches actual storage and handling.

Completion evidence: migration/backup receipts, controlled persistence and access checks, named operator, and completed triage dry run.

## 4. Decide and verify the newsletter launch scope

- [ ] Explicitly choose pending signup capture only or a functioning email newsletter for this release.
- [ ] For capture only, verify durable production storage and clear pending-confirmation messaging; make no delivery promise and do not send to pending subscribers.
- [ ] If sending email, implement confirmation tokens and a verified opt-in lifecycle.
- [ ] If sending email, configure the delivery provider and authenticated sender.
- [ ] If sending email, implement unsubscribe and suppression, including delivery-failure handling, and review consent for existing rows before treating them as sendable.
- [ ] If sending email, verify confirmation, delivery, unsubscribe and suppression using controlled internal recipients before enabling general sends.

Completion evidence: recorded scope decision plus verified capture, or complete controlled delivery lifecycle receipts. If capture-only is selected, mark sending items deferred with the decision date rather than checked as complete.

## 5. Verify the exact live release

- [ ] Deploy the approved revision and retain the provider's deployment identity and matching source revision.
- [ ] Verify HTTPS, the intended domain, canonical URLs and the live revision endpoint.
- [ ] Check home, sections, every public article, search, related links, policy pages, RSS and sitemaps on the real host.
- [ ] Verify unknown and unpublished article routes remain unavailable and drafts stay out of search and feeds.
- [ ] Test the live forms against the production backend, including visible failure/retry states and private data handling.
- [ ] Review representative real mobile/desktop devices and browsers, keyboard navigation, focus behavior and screen-reader usability.
- [ ] Check media on slow connections and measure live loading/layout behavior; record field performance when enough real traffic exists and do not infer it from local timings.
- [ ] Set up uptime/error monitoring, name the incident owner and verify the release rollback procedure.
- [ ] Record final editorial and operational sign-off, linking the exact release to the evidence above and documenting any deferred optional features.

Completion evidence: exact-revision live check report, device/accessibility findings resolved or explicitly assessed, operational monitoring and rollback records, and dated launch sign-off.

## Optional work after core launch

- [ ] Analytics: implement and verify real event collection with appropriate privacy handling before reporting audience metrics.
- [ ] Audio: produce, review and verify actual playable episodes before advertising an audio release.
- [ ] Sponsorship: verify real arrangements and disclosures before displaying sponsor claims or inventory as sold.

These optional features do not block a reader-site launch unless explicitly included in its scope. No item is complete solely because code, a plan or a local test exists.

## Execution update — 27 September 2026

Completed locally: restored verified Git history; identified the existing Workers/D1 host; preserved an empty live newsletter-table snapshot; repaired two generic-landing-page source redirects; added source-check regressions and suppression-preservation regression; compressed the five reader images; added image source/licence links and corrected Wirecard attribution; prepared a record-by-record human review queue and operational runbook. Automated checks and deployment receipts are recorded separately under verification/launch-2026-09-27/.

Human editor/operator acceptance, full claim review, uncertain media provenance and public-release approval remain open. Newsletter delivery is deferred while capture-only is the working scope. Do not mark these complete from a successful deployment.
