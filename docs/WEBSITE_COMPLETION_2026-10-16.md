# Website completion pass — 16 October 2026

This is an engineering completion and release audit of Obscured Records, an owner-private publication. It is not a scientific model, experiment, novelty claim or research paper. The supplied research pipeline is applied to reproducibility, state tracking, adversarial review and honest evidence boundaries. Scientific-model stages are not applicable.

The reader catalogue remains 28 records. All 3,245 private drafts are preserved: 3,000 explicitly labelled reporting plans and 245 archival-analysis manuscripts, with no recorded approval. Word count, distinct titles and reachable orientation links do not establish finished journalism. Drafts require reporting, source-to-claim review, authorship, rights and human approval.

## Flaw, cause, repair and evidence

| Flaw | Cause | Severity | Repair | Required / observed evidence |
|---|---|---|---|---|
| Every editorial request eagerly imported 29,805,082 bytes of full-text data | Monolithic generated TypeScript array | High | 1,838,464-byte summary index; 64 lazy server manuscript shards after owner authorization | Every draft body and review record compared with source; hosted build and access checks required. Imported shards remain cached, so lifetime Worker memory is not guaranteed |
| Desk rendered 3,245 cards in one pass | Unbounded queue rendering and link prefetch | High | 36-card pagination, global filtering, no detail-link prefetch, keyboard page navigation | Complete 3,245-item coverage without missing/duplicate records; owner visual review remains open |
| Reporting plans looked like finished manuscripts | Batch counts and undifferentiated queue copy | High editorial | Explicit type labels, reporting-plan/manuscript and section filters | 3,000 genre-labelled plans; all approval and publication states preserved |
| Withdrawn or staged approval looked active | Review UI counted reviewer name independently of state | High editorial | Only approved state counts; hold visible; transition clears active approval and preserves prior reviewer/date in history | Transition, review-stage and held-priority regressions |
| Invalid dates and completion history could be accepted | Weak metadata validation | Medium | Calendar-date, history, checklist membership and filename validation; atomic draft write | Existing corpus passes plus malformed and revocation fixtures |
| Late batch failures left partial new manuscripts | Validation mixed with sequential writes | High data integrity | Full preflight; non-overwriting atomic file installation; rollback only unchanged created files | Late collision, invalid input, filesystem failure and concurrent-edit regressions; all 3,000 prior expansion outputs identical |
| Failed projection installation could mix old index and new shards | Multi-file installation could stop partway | High data integrity | Exclusive generation lock and rollback of installed projection files | Injected late rename failure must preserve prior complete projection |
| Member operations could hang or misreport successful writes | Unbounded fetches; refresh/cache failures conflated with persistence | Medium | Deadlines and cancellation; separate confirmed writes, partial import and refresh/cache results | Stalled response/body, import and cache-failure regressions |
| Retried highlights could duplicate | A fresh note ID was created after ambiguous failure | Medium | Stable pending ID and duplicate-submit guard | Retry and confirmed receipt coverage |
| Advertised account reading states could not be changed | Missing selector in member dashboard | Medium | Existing authenticated library API drives four-state selector; prior value retained on failure | Contract and real-handler SQLite persistence checks |
| Deleted account records could reappear from device cache | Server deletion left matching local copies behind | Medium | Remove only the matching cache entry after confirmed deletion; report cache failures separately | Account-delete failure, successful cleanup and cache-failure fixtures |
| Keyboard search could hang or skip last result on ArrowUp | No deadline; negative-index arithmetic | Medium | Bounded cancellable search and corrected initial keyboard selection | Search timeout/cancellation and wrap-around fixtures |
| Hosted WebP MIME is incorrect | Static provider serves application/octet-stream | Medium | Explicit static header rule per Cloudflare guidance | Baseline confirms 13 failures; post-deploy check required before closure |
| Current-state prose was scattered and stale | Accumulated dated status receipts | Medium | Canonical PROJECT_STATE.json and a content/evidence consistency check | Recount actual files; reject stale counts, invented approvals and open-gate public readiness |

## Verification in progress

An intermediate bounded suite passed 291 tests. The expanded final suite then passed 311 of 312 checks; a batch fixture child process hit its existing 10-second startup deadline during host resource pressure. This failure is retained in [the first test receipt](WEBSITE_TESTS_FIRST_2026-10-16.json); the unchanged affected batch file passed all 8 checks on rerun (4.20 seconds), without changing its timeout or assertions. The full unchanged suite then passed **312/312 tests in 30.11 seconds**, retained in [the final test receipt](WEBSITE_TESTS_FINAL_2026-10-16.json). Focused lint and transpile checks pass, content integrity and canonical state pass, and all 3,245 projected bodies/review records match source. Deployment verification follows. A fresh production npm audit returned zero advisories. Historical failures remain retained; [the baseline](WEBSITE_BASELINE_2026-10-16.json) passed 60/74 checks. One baseline failure was a harness error: the member route is `/member`, not `/account`; the other 13 were incorrect WebP MIME values. The check has been corrected without rewriting that receipt.

The local host is below the 512 MiB free-plus-speculative memory floor. Bounded Node tests use 96–128 MiB heaps; no full local install, production build or browser process is forced. The private provider will build the candidate. Workers prebuild now explicitly runs the full TypeScript check. Hosted build success is not a new full Vercel/browser/physical-device certification.

The static header rule follows [Cloudflare's asset header documentation](https://developers.cloudflare.com/workers/static-assets/headers/). Whether the Sites asset delivery layer honors it must be measured on the deployed version.

## Work requiring external evidence or human judgment

- Named editor's launch selection and claim-by-claim approval, actual author/reviewer credits, and unresolved Therac-25, Wirecard and Lake Nyos rights provenance. Held images stay withheld from reader projections.
- Accepted incident, submission and retention/deletion operators; controlled acknowledgement, triage, escalation and closure. No message is sent or acceptance invented.
- Provider-supported backup/restore and rollback rehearsal in an isolated environment with the accepted operator. No live database is dropped or restored to manufacture this evidence.
- Owner acceptance of the existing capture-only newsletter scope. Email delivery, analytics, audio and sponsorship remain deferred; no consent or provider setup is invented.
- Owner-authenticated visual review of the updated desk/library, physical device and assistive-technology review, representative slow-network observations and later field performance evidence.
- Confirmed recurring monitoring and explicit public-launch authorization after the editorial and operational gates close. Existing Site access stays owner-only.

The task reaches an honest bounded engineering result. These unresolved gates prevent a claim that the entire publication is approved for public launch.
