# Obscured Records

An editorial archive of overlooked historical events, institutional failures and the records that explain them. This is a React/Next.js publication with a Cloudflare Workers/Vinext build and a separate Next.js/Vercel build.

**27 September 2026: local implementation complete; public release remains HOLD.** There are 28 existing public records (eight expanded features and 20 briefs), plus 42 review drafts. Twenty drafts expand existing briefs; 22 introduce new subjects. That is **50 distinct subjects**, not 70 articles or 50 approved publications. New drafts are AI-assisted archival analysis, have no assigned human author, and are not served by the application.

Start with [STATUS](STATUS.md), [the final report](ASTRA_FINAL_REPORT.md), [reproduction commands](REPRODUCE.md), and [the editorial inventory](docs/EDITORIAL_INVENTORY_2026-09-27.md).

## Reader, contributor and editor workflows

Readers can browse six sections, search the archive, follow related records, inspect source links and corrections, use canonical sharing, and subscribe through RSS. Public discovery and article routes use explicitly published records with valid, nonfuture dates. Held/draft/review records are excluded; changing repository content requires a rebuild.

Contributors can send corrections, source leads, rights notes and pitches through `/submit`. The form validates input, requires consent and an HTTPS reference, bounds request size, and retains text if saving fails. A receipt means a private D1 write succeeded. It does not mean acceptance, publication or acknowledgement by an editor. Ordinary form/email intake is not a confidential-source channel.

Editors review local private intake through `scripts/intake-admin.mjs`, and review repository drafts through `npm run editorial`. [Editorial workflow](docs/EDITORIAL_WORKFLOW.md) describes review, approval and deliberate publication. There is no public editor dashboard and no browser-supplied role grants editorial authority.

Newsletter signup stores `pending_confirmation` and consent metadata in D1. The application sends no email. Both intake channels use durable, shared counters, a honeypot, same-origin checks and bounded bodies. Missing storage produces a visible 503 failure; no in-memory success substitute is used.

## Run locally

Node >=22.13.0 and npm are required; Node 26.8.2 was used for retained local checks. CI is configured for Node 22.19.0; that hosted job was not run here.

```sh
npm run install:ci
npm run dev
npm test
npm run check:editorial
npm run lint
npm run typecheck
npm run build
```

The default build creates `dist/` for Workers. See [REPRODUCE](REPRODUCE.md) to migrate an isolated local D1 database and verify actual persistence. `npm run build:vercel` builds with Next.js webpack. The Vercel/Node reader site works, but intake deliberately returns 503 because a Workers D1 binding is not available there. A production host/backend choice is required before enabling intake publicly.

## Content and operations

- `lib/articles.ts`: authoritative public registry; `lib/features.ts`: expanded feature copy.
- `content/articles/`: synchronized companion MDX metadata and brief text; not the source of the feature renderer.
- `content/drafts/`: Markdown/JSON-frontmatter review material, never application imports. A public repository would expose these files; they are private only to the reader site.
- `lib/corrections.ts`: dated material correction log, displayed on the record and corrections page.
- `db/`, `drizzle/`: schema and additive local-tested migrations.
- `docs/`: editorial procedures, inventory and prior operating plans.
- `verification/astra-2026-09-27/`: preserved original source, failures, link audit and final checks.

No deployment, production migration, email send, analytics event or audio release was performed. Existing image credits are not proof of reuse permission. Source reachability is not fact checking. Read [LIMITATIONS](LIMITATIONS.md) before interpreting local checks as release evidence.
