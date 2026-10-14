# Member persistence implementation receipt — 14 October 2026

## Verdict

The member-persistence repair is merged, independently rebuilt by hosted CI and deployed to the existing owner-private Site. It closes bounded engineering defects in annotation identity, mutation receipts and request-body handling. It does not certify public launch, editorial claims, database recovery or newsletter delivery.

## GitHub source and verification

- Pull request: [#43](https://github.com/build-the-future-11/Obscured-Records/pull/43)
- Merge commit on `main`: `15fe1168779e923ff74a2ff235ea27eadfd24799`
- Exact-head CI: [run 38547520209](https://github.com/build-the-future-11/Obscured-Records/actions/runs/38547520209), succeeded
- Local focused member suite: 34/34 passed
- Local bounded Node suite: 245/245 passed
- Hosted checks: locked dependency install, deployment routing, article/editorial integrity, lint, typecheck, Workers build, Vercel build, local Workers/D1 persistence, Next.js runtime smoke and browser interaction/responsive coverage

The local machine remained below the repository's 512 MiB free-plus-speculative-memory floor, so no heavy local dependency install or production build was forced. Hosted CI supplied the exact-head build and runtime receipts.

## Implemented behavior

1. Annotation updates are scoped by both member and article slug. Reusing an existing annotation ID across articles now returns `409` instead of overwriting another article's note.
2. Annotation and saved-story mutations use database `RETURNING` rows. API success receipts therefore carry the persisted identifiers and timestamps rather than values guessed before the write.
3. Member JSON bodies are streamed through one bounded reader with a 12 KiB ceiling, abort propagation, a five-second deadline and explicit malformed/incomplete-stream failures.
4. Regression coverage exercises collisions, persisted rows, oversized bodies, aborted reads, incomplete streams and deadline expiry.

No D1 schema migration, editorial-state mutation or live member-data write was required for this deployment.

## Exact private deployment

- Site project: `appgprj_6aa79b45dd308191b3b887c293729f00`
- Production URL: `https://obscured-records.ryangomez-hs.chatgpt.site`
- Saved version: 21 / `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_224964cfff788191a1478165ea98afac`
- Site-source commit: `a23a31952ef04db9db10ec6aa59a8530a9aebb1a`
- Initial version deployment: `appgdep_6acf560a4b088191bf03d6dff7ce9c56`, succeeded
- Exact-environment redeployment: `appgdep_6acf56802a9c8191b73ec81c4ae08ba9`, succeeded
- Environment revision: 9; `COMMIT_SHA` equals the Site-source commit above
- Audience: custom owner-only; one owner, no groups and zero external visitors

The GitHub and Site-source SHAs are expected to differ because they are distinct repositories. The files named in the pull request were copied exactly into the Site source, committed and pushed through the Sites workflow, then saved and deployed as version 21.

## Remaining boundaries

- The 145 private manuscripts remain unapproved AI-assisted drafts. No claim-level review, authorship, rights clearance or human editorial approval was inferred.
- The production dependency advisories recorded in the 11 October ledger remain open; the resource floor still blocks a safe local install/build mutation.
- No public audience change, newsletter send, analytics collection, audio release, backup/restore rehearsal or live member-data mutation was performed.
