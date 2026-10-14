# Obscured Records

**30 September website implementation:** configurable homepage, real-author attribution, contributor introductions, explicit newsletter-waitlist consent, optional Node/Vercel D1 connectivity, sharing images and regression coverage. See [implementation and configuration](docs/WEBSITE_UPDATE_2026-09-30.md). This source update does not itself prove deployment or remove the public-launch HOLD.

**Deployed reader-experience update, 28 September 2026:** redesigned publication hierarchy, article reader, filtered archive, topics, reading series, keyboard search, device-local saved stories and annotations. The content and UI are merged into GitHub `main` and deployed to the existing owner-only site. See [the completion receipt](docs/SITE_COMPLETION_2026-09-28.md) and [implementation report](docs/PUBLICATION_EXPERIENCE_REPORT_2026-09-27.md). Editorial and public-launch decisions remain open.

An editorial archive of overlooked historical events, institutional failures and the records that explain them. This is a React/Next.js publication with a Cloudflare Workers/Vinext build and a separate Next.js/Vercel build.

**11 October 2026: 100 different private article drafts are complete; public launch remains HOLD.** There are 28 reader records (eight expanded features and 20 briefs), plus 145 private review drafts. Twenty drafts expand existing briefs; 125 introduce new subjects. That is **153 distinct subjects**, not 173 approved publications. Drafts are AI-assisted archival analyses with no assigned human author and remain excluded from public reader routes, feeds and search. See the [100-article expansion receipt](docs/ARTICLE_EXPANSION_2026-10-11.md).

The latest content pass improves all reader records and carries targeted corrections into their expansion drafts. See [content changes and source evidence](docs/CONTENT_IMPROVEMENTS_2026-09-27.md). Publishing draft files in this repository does not approve them for the website.

Start with [STATUS](STATUS.md), [the final report](ASTRA_FINAL_REPORT.md), [reproduction commands](REPRODUCE.md), and [the editorial inventory](docs/EDITORIAL_INVENTORY_2026-09-27.md).

## Reader, contributor and editor workflows

Readers can browse six sections, search the archive, follow related records, inspect source links and corrections, use canonical sharing, and subscribe through RSS. Public discovery and article routes use explicitly published records with valid, nonfuture dates. Held/draft/review records are excluded; changing repository content requires a rebuild.

Contributors can send corrections, source leads, rights notes and pitches through `/submit`. The form validates input, requires consent and an HTTPS reference (optional for contributor introductions through `/contribute`), bounds request size, and retains text if saving fails. A receipt means a private D1 write succeeded. It does not mean acceptance, publication or acknowledgement by an editor. Ordinary form/email intake is not a confidential-source channel.

Editors review local private intake through `scripts/intake-admin.mjs`, and review repository drafts through `npm run editorial`. [Editorial workflow](docs/EDITORIAL_WORKFLOW.md) describes review, approval and deliberate publication. There is no public editor dashboard and no browser-supplied role grants editorial authority.

Newsletter signup stores `pending_confirmation` and consent metadata in D1. The application sends no email. Both intake channels use durable, shared counters, a honeypot, same-origin checks and bounded bodies. Missing storage produces a visible 503 failure; no in-memory success substitute is used.

## Run locally

Node >=22.13.0 and npm are required; Node 26.8.2 was used for retained local checks. CI is configured for Node 22.19.0. Check the pull request for the exact source revision and current hosted result.

```sh
npm run install:ci
npm run dev
npm test
npm run check:editorial
npm run lint
npm run typecheck
npm run build
```

The default build creates `dist/` for Workers. See [REPRODUCE](REPRODUCE.md) to migrate an isolated local D1 database and verify actual persistence. `npm run build:vercel` builds with Next.js webpack. The Vercel/Node reader site works. Intake uses a native Workers D1 binding or an explicitly configured server-only D1 REST connection; without either, it deliberately returns 503. See the 30 September configuration guide before enabling that connection. The existing owner-only Sites deployment uses Workers/D1. Enabling public intake still requires the operational gates in the release checklist.

## Content and operations

- `lib/articles.ts`: authoritative public registry; `lib/features.ts`: expanded feature copy.
- `content/articles/`: synchronized companion MDX metadata and brief text; not the source of the feature renderer.
- `content/drafts/`: Markdown/JSON-frontmatter review material, never application imports. A public repository would expose these files; they are private only to the reader site.
- `lib/corrections.ts`: dated material correction log, displayed on the record and corrections page.
- `db/`, `drizzle/`: schema and additive local-tested migrations.
- `docs/`: editorial procedures, inventory and prior operating plans.
- `verification/astra-2026-09-27/`: preserved original source, failures, link audit and final checks.

The owner-private Site now runs version 22 from source `03291c1e105979496fa06eb82cdec50fa1c1e05f`; production environment revision 10 reports that exact SHA. GitHub `main` contains the corresponding dependency-security closure through merge commit `a8ce7d32fda842c2ab2a284debba73a676fb44f8`. The committed production audit reports zero findings, and CI permanently enforces that result alongside the 245-test suite, editorial integrity, lint, typecheck, both production builds, Workers/D1 persistence, Next runtime smoke and browser checks. See the [dependency-security closure](docs/DEPENDENCY_SECURITY_CLOSURE_2026-10-14.md), [member implementation receipt](docs/MEMBER_IMPLEMENTATION_2026-10-14.md) and [11 October execution state](docs/EXECUTION_STATE_2026-10-11.md). No email send, collected analytics, audio release or public-audience change is claimed. Existing image credits are not proof of reuse permission. Source reachability is not fact checking. Read [LIMITATIONS](LIMITATIONS.md) before interpreting engineering checks as release evidence.
