# Dependency-security closure — 14 October 2026

## Verdict

The production dependency blocker is closed for the recorded revision. The committed lockfile reports zero production findings, the full hosted verification matrix passed from the exact merge commit, and the patched source is deployed to the existing owner-private Site.

## Patch

- Next.js: 16.3.4 → 16.4.0
- `eslint-config-next`: 16.3.4 → 16.4.0
- Sharp override: 0.35.4 → 0.35.5
- source-map-js override: 1.2.1 → 1.2.2
- fast-uri override: 3.1.7 → 3.1.8
- CI now runs `npm audit --omit=dev --audit-level=low` after the locked install and dependency-input check.

The predecessor lock reported one critical, two high and one moderate production finding. The committed replacement reports zero findings from the same npm advisory service.

## GitHub source and verification

- Pull request: [#44](https://github.com/build-the-future-11/Obscured-Records/pull/44)
- Reviewed head: `4d6745389eea63a4ba96d862382bf3487631bab7`
- Merge commit on `main`: `a8ce7d32fda842c2ab2a284debba73a676fb44f8`
- Pull-request CI: [run 38559007735](https://github.com/build-the-future-11/Obscured-Records/actions/runs/38559007735), succeeded
- Merge-commit CI: [run 38559472421](https://github.com/build-the-future-11/Obscured-Records/actions/runs/38559472421), succeeded

Both final runs used the committed lockfile. The merge-commit run passed the locked install, production audit, 245 repository tests, editorial integrity, lint, typecheck, Workers build, local Workers/D1 persistence, Vercel build, Next.js runtime smoke and browser interaction and responsive checks.

The local host remained below the repository's 512 MiB dependency-install floor. Hosted CI generated the candidate lockfile, retained it as an artifact, and then verified the committed result without weakening the resource guard.

## Exact private deployment

- Site project: `appgprj_6aa79b45dd308191b3b887c293729f00`
- Production URL: `https://obscured-records.ryangomez-hs.chatgpt.site`
- Saved version: 22 / `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_436e9132dc308191ba96b31642b1db08`
- Site-source commit: `03291c1e105979496fa06eb82cdec50fa1c1e05f`
- Initial deployment: `appgdep_6acf6dd2f1548191981bdefc7d25fbcf`, succeeded
- Exact-environment redeployment: `appgdep_6acf6ed696ec819196f9c8780fd4d144`, succeeded
- Environment revision: 10; `COMMIT_SHA` equals the Site-source commit above
- Audience: custom owner-only; one owner, no groups and zero external visitors

The GitHub and Site-source SHAs differ because they are separate repositories. Version 22 contains the three files changed by PR #44, copied from the verified merge state before the Site source was committed and deployed.

## Remaining authority boundaries

This receipt closes the dependency-security engineering blocker. It does not supply claim-level review, authorship, media rights, editorial approval, operating ownership, newsletter-provider selection, analytics-provider selection or authorization to make the Site public.
