# Obscured Records

Obscured Records is an independent editorial archive for deeply sourced stories, historical records, and underreported events. The current relaunch emphasizes evidence, source transparency, corrections, durable archives, and a publication workflow that can expand without blurring draft material into published reporting.

## Current product surface

The application currently includes:

- a front page built around evidence files, long-form dossiers, an archive atlas, and an editor's desk;
- article pages under `/article/[slug]`;
- section archives under `/[section]`;
- author pages under `/author/[slug]`;
- `/latest`, `/underreported`, `/about`, `/corrections`, `/privacy`, and `/newsletter` surfaces;
- RSS and crawler metadata;
- source-aware article records in `lib/articles.ts`;
- Cloudflare-compatible full-stack hosting through Vinext;
- optional D1/Drizzle persistence for workflows that need durable state.

The current article corpus is repository-backed. Editorial claims must remain traceable to the source fields retained with each article rather than being inferred from page design or generated copy.

## Editorial contract

Obscured Records should treat publication as an explicit state transition, not as "file exists = public".

Recommended operating states:

`SUBMITTED -> TRIAGE -> EDITING -> FACT_CHECK -> APPROVED -> SCHEDULED -> PUBLISHED -> CORRECTED/ARCHIVED`

For any future database-backed editorial workflow, public rendering must require an explicit published state. Draft, review, rejected, held, and scheduled material must fail closed from public routes, feeds, sitemaps, and search indexes until the publication condition is satisfied.

For every published record, retain at minimum:

- canonical slug and title;
- author identity;
- publication and update timestamps;
- section/tags;
- source title and source URL;
- cover-image credit when used;
- correction history when facts materially change.

Do not silently rewrite a published factual claim without retaining an update/correction trail.

## Repository layout

- `app/` — routes, metadata, article/archive pages, newsletter/corrections/privacy surfaces
- `components/` — shared editorial UI
- `content/` — content assets and editorial material
- `lib/articles.ts` — current repository-backed article records
- `db/` — D1/Drizzle database access
- `drizzle/` — generated/local migration files
- `.github/` — repository verification workflows
- `scripts/` — install/build/runtime helpers

## Local development

Requirements:

- Node.js `>=22.13.0`
- npm

Install dependencies with the repository's locked install path:

```bash
npm run install:ci
```

Start a local development server:

```bash
npm run dev
```

Run the primary repository checks before review:

```bash
npm run lint
npm run build
```

The build uses Vinext and produces the Cloudflare-compatible worker artifact used by the local built preview.

## Local D1 / Drizzle

When a feature genuinely requires persisted editorial state, update `db/schema.ts`, generate a migration, and review the SQL before applying it anywhere:

```bash
npm run db:generate
```

For local preview only, apply the reviewed migration against the local D1 binding after a build has generated `dist/server/wrangler.json`.

Do not treat a successful local migration as production migration evidence. Production data changes require their own reviewed deployment/apply path and rollback ownership.

## Authentication boundary

`app/chatgpt-auth.ts` exposes optional workspace-auth helpers for user-specific surfaces. Authentication proves identity only; it does not automatically prove editorial role, contributor approval, or workspace membership.

If admin/editor/contributor write surfaces are added, authorize them server-side with explicit role or membership checks. Do not use email, client state, route visibility, or a signed-in UI as the authorization boundary.

Public article/archive routes should remain readable without requiring account state unless product requirements deliberately change.

## Editorial QA before release

Before publishing a release that changes reporting or editorial behavior, verify:

1. every article route resolves its canonical record;
2. source links and image credits render correctly;
3. draft/held material cannot leak into public routes, RSS, sitemap, or search metadata;
4. corrections remain visible and attributable;
5. canonical URLs and metadata are stable;
6. RSS output contains only intended public records;
7. `robots` behavior matches the release intent;
8. newsletter capture does not imply subscription success before the backend confirms it;
9. mobile and keyboard navigation still work on the core archive/article surfaces;
10. `npm run lint` and `npm run build` pass on the exact review head.

## Research and historical-evaluation boundary

Engineering correctness is not evidence that a historical-corroboration system or editorial method is accurate. Any outcome-bearing historical evaluation must use a prospectively frozen corpus, labels, metrics, evaluator identity/code, and retention plan before outcomes are opened.

Do not convert a green build, alias fix, editorial redesign, or successful smoke test into a claim about historical accuracy, newsroom adoption, corroboration quality, or research validation.

## Deployment boundary

This repository should not infer that a production deployment is current merely because `main` is green. A release is attributable only when the hosting provider serves a known immutable source revision and the public site passes the intended smoke/transport checks on that same revision.

Do not publish, deploy, mutate production data, or change DNS/provider configuration from unattended repository maintenance.

## Relaunch priority order

For the current relaunch, prefer:

1. truth-preserving editorial workflow and publication boundaries;
2. article/source/correction integrity;
3. RSS, sitemap, metadata, and discoverability;
4. submission and contributor operations;
5. newsletter/audio workflows;
6. analytics that measure real reader behavior without inflating readership claims;
7. sponsor inventory only after editorial independence and labeling rules are explicit.

The site should remain publishable even when optional newsletter, analytics, sponsor, or database services are unavailable.
