# Claims and evidence

| Claim | Evidence | What it does not establish |
|---|---|---|
| 50 distinct editorial subjects exist | `docs/EDITORIAL_INVENTORY_2026-09-27.md`; `scripts/content-index.mjs`; editorial release log | 50 approved or newly published articles |
| 42 drafts contain 17,372 words | `content/drafts/`; metadata/body validator | Human authorship, originality certification, accuracy or editorial approval |
| Drafts are not served by the reader site | Separate unimported draft directory; `lib/publication.ts`; publication tests; built draft 404/discovery checks | Confidentiality from someone with repository access |
| Reader routes and error states pass locally | `runtime-next-release.log`: 167 checks | Live deployment, worldwide availability or full security certification |
| UI workflows pass the tested browser | `browser-artifacts/receipt.json`: 50 checks across three viewport widths | Cross-browser or assistive-technology certification |
| Forms actually persist locally on Workers | `workers-intake.json`: fresh migrated local database, pending signup, private receipt, triage update | Production persistence or delivery to an editor |
| Spam limits share durable counters | `lib/intake-policy.ts`, SQLite tests and actual local 429 response | Sender identity verification or DDoS immunity |
| Newsletter capture does not imply sending | Explicit pending insert, user-facing copy, local database query | Email confirmation, unsubscribe or suppression integration |
| Source references were audited and repaired | `source-links-initial.json`, `source-link-repairs.json`, `source-links.json`: 58 reachable, 12 access-unverified, 0 remaining 404/410 | Claim-by-claim fact checking, source independence or reuse rights |
| Both host build paths compile | `build-workers-release.log`, `build-next-release.log` | Production host configuration or D1 support inside Node |
| Production dependency advisory cleared | Original `dependency-audit.json`, single-package lock change, `dependency-audit-final.json` | Absence of undisclosed vulnerabilities or dev dependency issues |
| Original work was preserved | `source-before.json`, `source-before.tar.gz`, final file delta | Git history, independent backup or immutable deployed release |

All receipt names above are under `verification/astra-2026-09-27/` unless another directory is stated. The final app-source digest is recorded in ASTRA_FINAL_REPORT.md and the runtime receipts. No readership, subscriber-growth, sponsorship, original interview, scientific or independent-reproduction result is asserted.
