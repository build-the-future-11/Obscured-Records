# Site completion — 28 September 2026

The content and publication UI from [PR #9](https://github.com/build-the-future-11/Obscured-Records/pull/9) are now deployed to the existing [Obscured Records site](https://obscured-records.ryangomez-hs.chatgpt.site). The site's owner-only audience is unchanged.

## Release evidence

- Application source: `052ee569f0b75bcc1baafbb52e7a1f2afe270092`, including the portable SQLite intake fix. Its tree matches the GitHub squash merge `882789d8b2e48c716067f788282f75050573c75e`.
- [GitHub CI](https://github.com/build-the-future-11/Obscured-Records/actions/runs/36332084874) passed tests, editorial integrity, lint, typecheck, both production builds, Workers persistence, Next runtime checks and browser interaction/responsive checks.
- A fresh Workers build and the Sites archive workflow completed successfully on 28 September; the workflow pushed and verified the exact source before packaging.
- Deployment: `appgdep_6aba0673ff9c81918510d5bcfc0d37a9`.
- Saved version: `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_958924121504819199ea09aaaa650c67`.
- Provider result: `succeeded`, `2026-09-28T06:17:54.689478+00:00`, environment revision `4`; runtime `COMMIT_SHA` configured to the application source above.
- Automated accessibility: 30 local production-preview states passed with zero axe violations. Coverage includes 13 pages at 375px and 1440px, newsletter error, dark reading theme, source dialog and search dialog. This checks the existing production UI build, unchanged by the subsequent intake-only fix. It is not a physical-device or screen-reader certification.
- Local retained artifacts: `.cache/site-finish-20260928/site.tar.gz` and `.cache/site-finish-20260928/a11y/accessibility.json`. These machine-local artifacts are intentionally excluded from Git.

Provider deployment success is the current hosting evidence. The earlier 58 authenticated live checks apply to the previous deployment and have not been relabeled as new checks.

## Delivered scope

The hosted version includes revised content and corrections; responsive publication layouts; archive filters; keyboard search; topic, author and series directories; source previews; reading preferences; and browser-local saves, highlights and notes. All 42 review drafts remain excluded from reader pages and feeds.

## Remaining editorial and operational decisions

Newsletter signup captures pending requests; email sending is not configured. Public audience expansion, named human editorial review, media provenance clearance, intake ownership, backup/rollback rehearsal and monitoring remain open as described in the release checklist. The earlier hosted WebP MIME observation has not been reverified. These are not new UI implementation tasks and are not marked complete by deployment success.

This document and the accompanying status corrections are release documentation; they do not change the deployed application source.
