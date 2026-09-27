# Launch execution — 27 September 2026

**Owner-only deployment verified; public launch remains HOLD.**

Site: https://obscured-records.ryangomez-hs.chatgpt.site  
Deployed source: `bfd7158f7d19aa5094c90dba3d7c2c9e72f24379`  
Private saved version: `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_54dedfecd954819193076a0bc61de909`  
Provider deployment: `appgdep_6ab8c1ed0100819194238d3771c61311` (succeeded, environment revision 3).

## Completed work

Recovered Git history and reconciled all 194 original export files with merged authoritative main. Preserved existing changes, original verification receipts and original image assets. The release branch is `codex/launch-closure-20260927`; the private Sites source repository contains the deployed source. No public GitHub push or new pull request succeeded.

Repaired two citations that landed on generic pages, hardened the source checker against misleading redirects/challenges, corrected image attribution and supplied reader-visible source/licence links. The five served WebP derivatives total 597,420 bytes versus 3,238,479 original bytes (81.6% smaller).

Fixed newsletter updates that could reset suppressed or unsubscribed statuses. Applied the additive submission/rate-limit migration through Sites and confirmed actual live storage with one controlled signup and one controlled submission. Repeated signup capture remained one row, its status stayed pending, the fourth attempt was rate-limited, and the submission stayed private. No email was sent.

The first deployed candidate exposed a production-only failure: initialization-time publication-date filtering emptied the archive on Workers. Replaced the module-level filtered collection with request-time lookup and added an epoch-zero initialization regression. All sections and 28 existing public article routes subsequently passed on the real host. All 42 review drafts remain unpublished.

## Verification and limits

| Evidence | Result | Boundary |
| --- | --- | --- |
| Unit/regression suite | 137 passed | Automated behavior, not editorial approval |
| Editorial, lint, types, Workers and Next.js builds | Passed | Local/build-workflow checks; hosted GitHub CI not run |
| Local Workers/D1 | 41 grouped checks passed | Includes routes, real local persistence/rate limits and local triage |
| Built Next.js runtime | 167 checks passed after the request-time fix | Confirms Node reader behavior; D1 remains Workers-only |
| Earlier responsive browser suite | 50 passed | Retained local automated viewport evidence |
| Actual private deployment | 58 checks passed | Every public record/section, page/API status, real form requests, exact revision and anonymous 401 |
| Live database connector reads | Confirmed one pending signup and one received test submission | Complete/untruncated bounded reads; no operator acknowledgement or restore rehearsal |
| Supplemental live metadata | Canonical origin, author route, news sitemap, RSS/sitemap inclusion and draft exclusion passed | Checked before the media MIME assertion failed |
| Actual live Chrome rendering | All five WebP assets decoded; desktop (1440px), mobile (390px), article heading and no runtime exceptions passed | Automated Chrome only; retained screenshots and `live-browser.json`; does not clear the MIME defect or replace physical-device/assistive review |
| Supplemental live media | Host returned `application/octet-stream` for a WebP asset | Strict MIME check failed and remains preserved; do not mark correct MIME verified |

All receipts, including failed initial deployment checks, are retained in `verification/launch-2026-09-27/`. Key files are `deployment-request-time.json`, `live-private-request-time.json`, `database-after.json`, `source-links-current.json`, `live-content.json`, and the request-time test/build logs. Evidence files contain no access token or real submitted personal information. Two clearly labelled example.invalid test rows remain in private storage.

## Open items and blockers

1. Human editorial selection, claim-level fact checking, actual reviewer attribution and final media-rights clearance. Therac-25 provenance is contradictory; Wirecard/Lake Nyos derivatives still need final provenance review.
2. Accepted operator, incident and retention ownership; controlled human acknowledgement/triage/closure; provider-backed restoration and rollback rehearsal.
3. Capture-only newsletter scope acceptance. Confirmation, delivery and unsubscribe-provider integration remain deferred unless sending is selected.
4. Physical-device/assistive-technology review, representative live slow-network measurement, and recurring-monitor confirmation. A monitor creation call returned no completion receipt; check existing automations before retrying.
5. Correct and verify the hosted WebP Content-Type. The Sites packaging/workflow helper used successfully earlier disappeared from its installed plugin path during final verification. Searches of the installed plugin cache found no replacement; restore that packaging capability before another release. The currently verified private deployment remains intact. Installed Chrome confirmed that all five images still render despite the MIME defect; this observation does not change the failed strict header result.
6. Public GitHub publication and hosted CI. Automatic approval review rejected the push because the public repository would expose 42 unpublished drafts and internal review documents. Explicit permission for that disclosure is still required. Site audience remains owner-only.

See [the updated checklist](RELEASE_CHECKLIST.md) for individual completed and remaining items. These execution documents are a later local evidence update; the runtime revision above remains the exact deployed code, not a claim that later documentation commits were deployed.
