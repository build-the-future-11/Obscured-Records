# ASTRA final report — Obscured Records

27 September 2026. Scope: the user-supplied ASTRA Megaprompt 10 for Obscured Records, not the other 21 projects.

**The repository is ready for local editorial and implementation review, but not certified for production release.** The engineering verification loop passes. Draft approval, image/source review and live operational gates remain open.

## Starting state

The exported directory contained 194 source files, a React 19 / Next.js 16 / Vinext publication, 28 repository-backed public records, eight expanded features, section/search/author/feed surfaces, newsletter capture, an email-only submission path, existing relaunch plans and checks. It had no `.git`, so history/remotes/dirty status were unavailable. The original source was archived and hashed before modification.

## Delivered changes

- A 50-subject editorial collection: 42 substantial draft files (17,372 words), comprising 22 new subjects and expansions of 20 existing briefs, alongside eight existing expanded features. Drafts vary in subject and analytical framing and contain no generated interview or invented quotation. They are explicitly labelled AI-assisted archival analysis with an unassigned author, source status and case-specific review tasks. They are not represented as fact-checked or approved journalism.
- Explicit public-state/date filtering shared by reader routes and discovery, safe homepage selections, draft approval checks and a local transition tool. Draft copy never replaces an existing public brief merely because the slug matches.
- A contributor form and private D1 submission store, additive migrations, consent/HTTPS/body validation, same-origin checks, honeypot and shared durable rate limits. Editor triage can list/read/transition local private records through an operator-only CLI.
- Newsletter captures now remain pending confirmation, with the same durable abuse controls. The UI describes persistence accurately and sends no email. Node/Vercel fails closed when Workers storage is missing.
- A visible correction for the unsupported duration in the FedEx headline; source URL/publisher repairs; copy-based reading estimates; removal of decorative quotation treatment that could imply sourced quotations; deduplicated source presentation; a responsive homepage title that passed the previously failing 375px layout.
- Repaired Next.js webpack build handling for the Workers-only import, expanded tests/CI, route and draft-isolation checks, local D1 integration, browser interaction checks and source-digest receipts for this Git-less export.
- One targeted dependency fix: `baseline-browser-mapping` 2.10.30 -> 2.11.26, clearing the moderate process-termination advisory [GHSA-w5vr-8v7q-w6rv](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv). No other package version changed.

## Verification actually performed

Final evidence directory: `verification/astra-2026-09-27/`.

| Check | Observed result | Receipt |
|---|---|---|
| Automated unit/regression/SQLite tests | 132 passed; zero failed/skipped | `tests-release.log` |
| Editorial structure | 28 public records, 42 unpublished drafts, 50 subjects | `editorial-release.log` |
| Lint and TypeScript | Passed | `lint-release.log`, `typecheck-release.log` |
| Workers/Vinext production build | Passed | `build-workers-release.log` |
| Next.js webpack production build | Passed | `build-next-release.log` |
| Built reader routes/assets/errors | 167 checks passed, including all public records and new-draft 404s | `runtime-next-release.log` |
| Browser layout/interactions | 50 checks passed at 375/768/1440px; no uncaught runtime/hydration errors | `browser-release.log`, `browser-artifacts/receipt.json` |
| Actual local Workers/D1 intake | Seven grouped checks passed: persisted pending signup, rate limit, one private submission, triage update, no public read endpoint | `workers-intake-release.log`, `workers-intake.json` |
| Source URL reachability | Ten stale references repaired; final 58 reachable, 12 access-unverified, zero 404/410 among 70 URLs | `source-links-initial.json`, `source-link-repairs.json`, `source-links.json` |
| Production dependency audit | One moderate finding repaired; final zero known findings | `dependency-audit.json`, `dependency-audit-final.json` |
| Source/preservation review | No original file deleted; common-secret/TODO scan retained; source delta generated | `source-scan.json`, `source-after.json`, `source-changes.diff` |

Browser success-response tests are explicitly mocked; they establish UI behavior only. The separate Workers checks use real local D1 writes. The browser's expected console errors are two real missing-storage 503s and one deliberately injected 502; they are retained, not presented as a completely silent console. Local performance samples are diagnostic and not field Core Web Vitals. The initial mobile homepage sample transferred about 3.43 MB from the same origin, largely existing media; media optimization remains an improvement.

Final application/source digest: `176e25e2c28288987067b6f8dc527945a6d20355752b62ca46af629113d96b46`. Git revision: **null**. The digest includes the script-defined app/content/build inputs, not every document or receipt. No immutable deployed SHA is available.

## Negative findings retained

Initial dependency installation needed network access. Loopback-restricted runtime checks failed until run with authorized local socket access. Next.js Turbopack failed during worker/port setup; a webpack attempt then exposed the Cloudflare URI import issue, which was repaired. The browser archive extraction stalled; verification used installed Chrome with isolated Playwright 1.56.0. The first browser pass exposed 13px homepage overflow at 375px; the title/layout was fixed and rerun. An early Workers smoke lost its connection after synchronous database inspection; moving the HTTP check before database inspection resolved the harness ordering issue.

Original failed logs remain beside the successful receipts. Remaining build notices concern the dependency's Node 26 `module.register` deprecation, Vinext ignoring the Node-only webpack option, and its limited static route classification. No hosted CI execution or Node 22 reproduction was claimed.

## Artifacts and preservation

[Editorial inventory](docs/EDITORIAL_INVENTORY_2026-09-27.md), [workflow](docs/EDITORIAL_WORKFLOW.md), [product audit](docs/PRODUCT_AUDIT_2026-09-27.md), [release checklist](docs/RELEASE_CHECKLIST.md), [claims](CLAIMS.md), [limitations](LIMITATIONS.md), [status](STATUS.md), [cleanup manifest](CLEANUP_MANIFEST.md) and [reproduction guide](REPRODUCE.md) describe the final state. Draft copy lives in `content/drafts/`; generated migrations live in `drizzle/`; browser screenshots/receipt live in `browser-artifacts/`.

No unique source or article was deleted. Existing operating plans were preserved; current triage/newsletter docs were updated where implementation advanced. Initial source archive and hashes permit direct comparison despite missing Git. Generated caches/test databases remain local and ignored. No commit, push, PR, deployment, production mutation or email send occurred.

## Remaining release gates

1. Real editorial approval, claim-by-claim source review, precise attribution and image licensing. Automated URL success does not establish truth; 12 sources remain inaccessible to the automated client, including DNS/TLS and access-denied cases.
2. Recover the authoritative repository and choose a production host/backend. Workers persistence passed locally; Vercel/Node has no D1 binding and returns 503 for intake.
3. Controlled production migration, backup/rollback and private submission triage evidence with a monitored operator.
4. If sending newsletters: confirmation, authenticated sender, unsubscribe/suppression and internal delivery receipt. Current capture remains pending only.
5. Exact-revision public smoke plus accessibility/device/media/performance review on the real host.

Audio, analytics and sponsorship remain optional, unlaunched plans. Research experiments/manuscripts are not applicable to this publication task. Local engineering is verified; editorial publication and public production release remain **HOLD/BLOCKED** for the reasons above.

## Reproduce

The complete installation, migration, browser and source-check commands are in [REPRODUCE.md](REPRODUCE.md). Core sequence:

```sh
npm run install:ci
npm test
npm run check:editorial
npm run lint
npm run typecheck
npm audit --omit=dev
npm run build
node scripts/workers-intake-smoke.mjs
npm run build:vercel
node --experimental-strip-types scripts/next-runtime-smoke.mjs
BROWSER_TOOLS_DIR=.cache/browser BROWSER_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node scripts/browser-smoke.mjs
```
