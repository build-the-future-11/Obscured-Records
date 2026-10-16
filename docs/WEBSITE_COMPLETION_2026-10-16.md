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
| Hosted WebP MIME is incorrect | Static provider serves application/octet-stream | Medium | Static header rule was ignored by the provider; allowlisted application route serves exact original bytes with explicit MIME and private caching | Baseline and v26 retain 13 MIME failures; v27 typed-route and rendered-markup checks required before closure |
| Current-state prose was scattered and stale | Accumulated dated status receipts | Medium | Canonical PROJECT_STATE.json and a content/evidence consistency check | Recount actual files; reject stale counts, invented approvals and open-gate public readiness |

## Verification and release

An intermediate bounded suite passed 291 tests. The expanded final suite then passed 311 of 312 checks; a batch fixture child process hit its existing 10-second startup deadline during host resource pressure. This failure is retained in [the first test receipt](WEBSITE_TESTS_FIRST_2026-10-16.json); the unchanged affected batch file passed all 8 checks on rerun (4.20 seconds), without changing its timeout or assertions. The full unchanged suite then passed **312/312 tests in 30.11 seconds**, retained in [the final test receipt](WEBSITE_TESTS_FINAL_2026-10-16.json). Focused lint and transpile checks pass, content integrity and canonical state pass, and all 3,245 projected bodies/review records match source. Owner-private version 26 deployed successfully on 16 October 2026 at 08:42 IST. Its full Workers build passed with the explicit TypeScript prebuild gate. The deployment archive contains 273 files, 36,771,840 bytes, SHA-256 `a399fa70ff57c956ef66ce460e58a01ce8d423f358d92e0aa1988fcefc85b696`. Live version-26 checks passed 61/74: exact revision, all reader routes, feeds, owner/member sign-in enforcement, draft/unknown 404s and anonymous rejection passed. All 13 raw WebP responses retained the incorrect MIME despite `_headers`; [the failed receipt is preserved](WEBSITE_RUNTIME_V26_2026-10-16.json). A narrowly allowlisted application image route now delivers the same bytes with explicit response headers; final hosted validation is pending. A fresh production npm audit returned zero advisories. Historical failures remain retained; [the baseline](WEBSITE_BASELINE_2026-10-16.json) passed 60/74 checks. One baseline failure was a harness error: the member route is `/member`, not `/account`; the other 13 were incorrect WebP MIME values. The check has been corrected without rewriting that receipt.

The local host is below the 512 MiB free-plus-speculative memory floor. Bounded Node tests use 96–128 MiB heaps; no full local install, production build or browser process is forced. The private provider built the exact candidate successfully. Workers prebuild now explicitly runs the full TypeScript check. Hosted build success is not a new full Vercel/browser/physical-device certification.

The static header rule follows [Cloudflare's asset header documentation](https://developers.cloudflare.com/workers/static-assets/headers/). The version-26 live check demonstrates that this Sites delivery layer does not apply that rule to these files. The raw asset URLs remain a provider limitation; reader delivery now uses a typed application route, preserving the original bytes.

## Work requiring external evidence or human judgment

- Named editor's launch selection and claim-by-claim approval, actual author/reviewer credits, and unresolved Therac-25, Wirecard and Lake Nyos rights provenance. Held images stay withheld from reader projections.
- Accepted incident, submission and retention/deletion operators; controlled acknowledgement, triage, escalation and closure. No message is sent or acceptance invented.
- Provider-supported backup/restore and rollback rehearsal in an isolated environment with the accepted operator. No live database is dropped or restored to manufacture this evidence.
- Owner acceptance of the existing capture-only newsletter scope. Email delivery, analytics, audio and sponsorship remain deferred; no consent or provider setup is invented.
- Owner-authenticated visual review of the updated desk/library, physical device and assistive-technology review, representative slow-network observations and later field performance evidence.
- Confirmed recurring monitoring and explicit public-launch authorization after the editorial and operational gates close. Existing Site access stays owner-only.

The task reaches an honest bounded engineering result. These unresolved gates prevent a claim that the entire publication is approved for public launch.

## Version 26 release identity (retained)

- Site: [Obscured Records](https://obscured-records.ryangomez-hs.chatgpt.site), owner-private, one allowed owner, no groups or external visitors.
- Local candidate: `e2fda459278b0a8b13f723de19c928c99cd3eb8c`, branch `codex/website-completion-20261016`.
- Private Site source: `e4afc8cb15dd3cbfa2e7d371cb797b3c7f235629`; all 3,693 source files matched the local candidate byte for byte.
- Saved version 26: `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_5adbaac75758819189b90536dc550f71`.
- Deployment: `appgdep_6ad194b46b608191baa13ee7dcc57349`; succeeded `2026-10-16T03:12:38.537799+00:00`; environment revision 14, COMMIT_SHA matching the private source.
- [Provider deployment receipt](WEBSITE_DEPLOYMENT_2026-10-16.json) and [validation summary](WEBSITE_VALIDATION_2026-10-16.json).

The local packaging attempt returned `Missing dist/server/index.js` because local build admission was blocked. Source synchronization succeeded and the supported native remote-build fallback produced the deployed archive. No public GitHub push or audience change occurred. Post-deployment receipt edits are local documentation changes; they do not alter the deployed application. The pre-existing untracked `verification/` directory is preserved.

## Typed image delivery successor

The version-26 failure led to an explicit server route at `/media/[filename]`, restricted to the 13 existing WebP assets. It returns the original 916,384 source bytes, encoded in a 1,224,158-byte server-only module, with `image/webp`, `nosniff`, private revalidation and SHA-256 ETags. Unknown/traversal/prototype names cannot select files; HEAD and conditional requests avoid response bodies. The reader, responsive variants and share metadata use the typed URLs. Held covers and the source inventory remain unchanged. Nineteen focused tests cover byte identity, delivery, variants and held projections. Original raw asset paths retain their provider MIME limitation and the failed receipts remain preserved.

The complete successor suite passes **331/331 tests in 22.33 seconds**, including the nineteen new image checks; [receipt](WEBSITE_TESTS_V27_2026-10-16.json). Canonical state and focused lint checks pass. The exact candidate is ready for the owner-private provider build and live 78-check verification.
