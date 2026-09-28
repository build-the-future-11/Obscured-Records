# Current release — 28 September 2026

**The latest content and UI are deployed successfully to the existing owner-only site.** Application source `052ee569f0b75bcc1baafbb52e7a1f2afe270092` matches the tree merged into GitHub `main` through PR #9. Hosted CI passed; 30 additional local accessibility states passed. See [the completion receipt](docs/SITE_COMPLETION_2026-09-28.md) for deployment identity and remaining editorial/operational decisions. Email sending and public audience expansion remain unenabled.

Everything below is a dated historical snapshot; statements that the UI was local-only, the deployment helper was unavailable or GitHub CI had not run are superseded by the receipt above.

# Local publication-experience implementation — 27 September 2026

Reader/discovery improvements are implemented in this working tree. They are not a new hosted deployment. See [the dated report](docs/PUBLICATION_EXPERIENCE_REPORT_2026-09-27.md) and [audit](docs/PUBLICATION_EXPERIENCE_AUDIT_2026-09-27.md) for scope, verification and remaining gates. The source content, review-draft exclusion and capture-only newsletter boundary are preserved. Historical deployment evidence follows.

# Content revision and GitHub publication — 27 September 2026

The user authorized publication of the full project, including draft files and internal review documents. The [content pass](docs/CONTENT_IMPROVEMENTS_2026-09-27.md) revises all 28 reader records, eight features and 20 overlapping drafts; the website still excludes all 42 drafts. The public-source approval blocker below is historical and has been resolved by this authorization. GitHub branch/CI receipts will identify the published revision. These changes do not by themselves redeploy the website or grant human editorial approval.

The following private deployment evidence applies to the earlier runtime revision explicitly named below.

# Status — 27 September 2026

**Private hosted release: verified. Public launch: HOLD. Editorial approval: pending.**

The existing owner-only [Obscured Records site](https://obscured-records.ryangomez-hs.chatgpt.site) now runs revision `bfd7158f7d19aa5094c90dba3d7c2c9e72f24379`. All 28 existing public records are accessible to the owner; all 42 review drafts remain unpublished. No new article received invented editorial approval.

Completed: Git recovery, private source push and deployment, production D1 migration and controlled persistence checks, the production-only empty-archive/404 repair, source-link fixes, newsletter suppression preservation, and an 81.6% reduction in served image bytes. The final source passes 137 tests, lint/typecheck/editorial checks, both builds, 41 local Workers checks and 167 Next.js checks. The actual deployment passed 58 authenticated route/form checks; anonymous access remains rejected.

A supplemental media check found that the host serves WebP files as `application/octet-stream`; correct MIME delivery remains unverified. Actual Chrome checks confirm that all five images render, desktop/mobile layouts fit, and the article has no runtime errors. The Sites packaging helper disappeared from the installed plugin cache during final verification and must be restored before another deployment.

Remaining gates: human editorial and claim review; unresolved media provenance; accepted release/operator/retention ownership; real-device/assistive review; monitoring confirmation; rollback/restore rehearsal; and explicit approval for any public disclosure of drafts/internal documents. The public GitHub push was rejected by automatic approval review, so hosted GitHub CI was not run. Newsletter sending remains deferred; capture-only is the working scope.

See the [completed/open checklist](docs/RELEASE_CHECKLIST.md), [execution report](docs/LAUNCH_EXECUTION_2026-09-27.md), [operations runbook](docs/LAUNCH_OPERATIONS_2026-09-27.md), [media review](docs/MEDIA_REVIEW_2026-09-27.md), and [source review](docs/SOURCE_REVIEW_2026-09-27.md). Detailed dated receipts are retained locally under `verification/launch-2026-09-27/`.

The [ASTRA report](ASTRA_FINAL_REPORT.md) and its original verification directory remain preserved as the earlier local-only snapshot. Its missing-Git/deployment statements and older source-access count are historical, superseded by this status.
