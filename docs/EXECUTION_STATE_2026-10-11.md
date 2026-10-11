# Obscured Records execution state — 11 October 2026

This is the current evidence ledger for the owner-private publication. It supersedes older current-state claims while preserving dated historical receipts. It does not grant editorial approval, authorize a public audience or manufacture operational ownership.

## Direct verdict

The private product is deployed and usable. Public launch is **HOLD**. Engineering work is not yet release-complete because the production lockfile has open security advisories and the machine is below the resource floor required for a safe dependency install and complete build matrix. Editorial, operational and external-authority gates also remain open.

## Exact private release

- Site: `appgprj_6aa79b45dd308191b3b887c293729f00`
- Audience: custom owner-only; one owner, no groups and no external visitors
- Production URL: `https://obscured-records.ryangomez-hs.chatgpt.site`
- Saved version: 20 / `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_4cef2a6eb38081918b8a0f9f4ad684bc`
- Source: `10b8052f97d3df72c2ffa114d410c96a0fa221d8`
- Initial content deployment: `appgdep_6acb8d9cd6f08191a8c82bfc6e076065`, succeeded
- Exact-revision redeployment: `appgdep_6acb8e66f9008191b9cecbf2ff06c505`, succeeded
- Environment revision: 8; `COMMIT_SHA` equals the source above
- Canonical environment: `SITE_URL` and `NEXT_PUBLIC_SITE_URL` both equal the production URL

Live browser inspection of version 20 shows 145 total manuscripts, 125 new records, 20 archival counterparts and zero sources marked verified. It also displays expansion entries including Apollo 1, AT&T 1990, Benxihu and BP Texas City. The public homepage remains at 28 documented records.

## Current inventory and bounded checks

- 28 reader records.
- 145 unpublished review drafts.
- 87,097 draft words.
- 153 distinct subjects.
- Editorial integrity passed for slugs, record IDs, dates, source URLs and draft exclusion.
- All 100 expansion manuscripts have unique slugs, titles and bodies, pass the draft validator, contain at least 350 words and remain unapproved.
- The expansion's 100 orientation URLs are reachable; this is a transport check, not claim verification.
- The generated private desk contains all 145 drafts while the reader registry remains at 28 records.
- The bounded Node suite passes 213/213; the SEO audit reports 28 RSS records, 145 review manuscripts, 45 public topics, three series and draft isolation.
- Live D1 binding `DB` exposes `editorial_submissions`, `intake_limits`, `member_annotations`, `member_library`, `member_preferences`, `member_profiles` and `newsletter_subscribers`.

These checks establish structure and private deployment state. They do not establish claim-level truth, image rights, human editorial approval, backup recovery or newsletter delivery.

The complete expansion receipt, generator and permanent corpus checks are in [ARTICLE_EXPANSION_2026-10-11.md](ARTICLE_EXPANSION_2026-10-11.md), `scripts/generate-hundred-articles.mjs` and `scripts/article-expansion.test.mjs`.

## Immediate engineering work

### P0 — dependency security

`npm audit --omit=dev` reports:

- critical: Next.js `next/og` ImageResponse remote-code-execution advisory;
- high: Next.js image-optimization SSRF advisory;
- high: `sharp` / `librsvg` advisory;
- moderate: `fast-uri` hostname-normalization advisory;
- additional low/moderate Next.js cache and disclosure advisories grouped under the direct Next.js finding.

The available patched set is Next.js and `eslint-config-next` 16.4.0, `sharp` 0.35.5, `source-map-js` 1.2.2 and `fast-uri` 3.1.8. The package and lockfile must be regenerated together, followed by production audit, full tests, editorial integrity, lint, typecheck, Workers build, Next/Webpack build, runtime checks and deployment of the exact passing source.

Resource admission blocked that heavy mutation during this pass: free plus speculative memory remained well below 512 MiB while compressor use, pageouts and swap activity were high. The guard was preserved rather than forcing an unsafe install or build.

### P0 — source delivery

The local checkout contains the 100-article expansion in commit `c1ea6bc`, contains `origin/main` through merge commit `4773e97`, and preserves the pre-existing untracked `verification/` directory. It also incorporates the deployed Site's two retained October writing passes, review manifests, transfer checks, private-indexing guard and corrected article metadata. It is not behind the remote. Its local commits remain unpushed because both configured GitHub credentials are invalid; neither Site history nor local history may be rewritten merely to make the graphs look aligned.

## Human and external gates

The following cannot be self-certified by code or an AI source pass:

1. A named editor must perform claim-level review and approve each launch story.
2. Image provenance and reuse rights must close, especially Therac-25 and the held derivatives.
3. A release/incident owner and an intake-retention owner must accept their duties.
4. A provider-supported database backup/restore and application rollback rehearsal must be completed with that owner.
5. A controlled submission must be acknowledged, triaged, escalated and closed without exposing private material.
6. Newsletter scope must be explicitly accepted as capture-only or separately equipped with confirmation, authenticated sending, unsubscribe/suppression and a controlled delivery receipt.
7. Representative physical-device and screen-reader review, WebP MIME re-verification and recurring uptime/error monitoring remain open.
8. Public audience change requires explicit user authorization after the release candidate is approved and certified.

Analytics, audio and sponsorship remain optional plans. They do not block a reader launch unless deliberately selected, and no usage, audience, episode or sponsor claim may be invented.
