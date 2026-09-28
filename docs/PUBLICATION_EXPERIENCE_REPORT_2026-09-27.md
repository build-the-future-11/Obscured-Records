# Obscured Records — publication experience implementation

**28 September follow-up:** the implementation described below is now merged into GitHub `main` and deployed to the existing owner-only site. CI and 30 additional automated accessibility states passed. See [the completion receipt](SITE_COMPLETION_2026-09-28.md). The dated local-only statements below describe the original implementation snapshot.

This is a local implementation on top of `cef35d1`, not a deployment or editorial approval. The 28 published records, eight expanded features, 42 unpublished drafts, source disclosures and corrections remain intact. The earlier release reports describe earlier revisions.

## What changed

| Area | Findings and implemented behavior |
| --- | --- |
| Design system | Retained ink, burgundy and warm paper. Replaced oversized display treatments on reading/discovery routes with a coherent serif/sans scale, quieter metadata, restrained rules and visible focus. Native controls avoid dashboard dependencies. |
| Homepage | One dominant lead with real author/date and responsive archival image; two smaller secondary stories; an expanded feature beside a chronological latest feed; thematic reading paths; topic connections; complete archive access. No popularity metrics or invented reporting. |
| Story variants | Shared semantic story component supports lead, feature, standard, compact, text, horizontal and latest treatments. Audio/breaking variants remain absent because no supported media or breaking workflow exists. |
| Navigation | Latest, real section dropdown, Topics, Series, Archive, About, Search, Saved and newsletter. Mobile menu retains focus trapping, inert background, Escape and focus restoration. |
| Reading | Shorter headers/covers; 690px core reading column; 20px standard body text, larger options, generous paragraph rhythm, constrained media, list/table/code styles; light/dark/system reading preferences. Article-scoped progress ends at the article, not the newsletter/footer. |
| Contents | Collapsible contents with current-section indication, stable heading anchors and paragraph anchors. Desktop rail and mobile expandable navigation. |
| Sources and transparency | Existing source links remain visible. Source previews expose the real title, publisher, type and domain; open/copy/return controls; native dialog focus behavior and mobile bottom-sheet presentation. Existing corrections distinguish publication from updates. No invented claim-to-source citations. |
| Saves and annotations | Browser-local Unread, Reading, Finished and Archived states. Paragraph selections retain quote, optional private note, story, timestamp and paragraph link. Supported browsers paint saved passages with the CSS Highlight API. Notes remain available in Saved on browsers without painting support. Deletion controls are provided. |
| Discovery | 45 topic pages derived from actual tags, related subjects and author links; three explicitly labeled reading series through 12 existing records; ordered continuation within articles; section lead/latest/topic/series modules; author directory and refreshed author work lists. |
| Archive | Dedicated archive with search, publication year/month, topic, author, section, format and series filters, shareable query URLs, chronological results, matching-term highlights, compact mode, clear/reset and honest empty states. All current records share one publication date; no artificial date depth was introduced. |
| Search | Cmd/Ctrl+K or `/` opens a native modal. Results group real stories, authors, topics and series; arrows/Enter/Escape work; useful navigation commands and removable device-local recent searches. Public search index loads on demand. Search and archive remain server-rendered with GET forms. |
| Newsletter and audio | Existing guarded D1 capture and all error/success states retained. Copy continues to state that email delivery is not enabled. No audio player is shown because no article audio assets exist. |
| Editorial workflow | Existing private repository workflow preserved. `editorial inbox` groups actual states and exposes headline, author, section, source-review counts, outstanding checks, reviewer and transition time. `editorial inspect <slug>` shows metadata and history. No public admin route, new permissions, fabricated reviewer, or automatic approval. |
| Mobile and accessibility | Tested responsive layouts including 320px. Newsletter heading overflow repaired. Contrast fixes, semantic controls, source-dialog focus return, skip navigation, reduced motion and storage/error feedback. Automated checks are bounded evidence, not complete WCAG certification. |
| SEO | Retained article canonical/OG/Twitter/RSS metadata and sitemap behavior. Added author Person and article BreadcrumbList data; added archive, authors, topics and series to sitemap. Saved/search pages are noindex. Loading boundaries are scoped to avoid soft 404s for nonexistent articles. |
| Performance | Local WebP derivatives at 480px and, where justified, 960px; responsive srcset/sizes; priority lead media and lazy supporting images; reserved image geometry; system fonts; no animated ticker or article parallax. Public index contains summary metadata, not full feature bodies or draft material. |
| Analytics | Typed `or:editorial` browser event hooks for impressions, opens, depth/completion proxy, archive use, successful palette search, save, share, newsletter capture, topic exploration and series continuation. No collector, cookies, remote requests or query/note/email payloads are added. Hooks are not collected analytics or popularity evidence. |

## Schema and API changes

- New read-only `GET /api/search`: published summary catalog, topics, series and authors. Same publication gates as public pages; no draft material or private intake.
- Derived catalog and thematic reading-series registry. Original article/source/correction authority is preserved.
- Local browser keys: `or-library-v1`, `or-notes-v1`, `or-recent-searches`, `or-reader-theme`, `or-reader-size`. Storage failures receive honest feedback. Privacy page documents scope and removal.
- No SQL migration, account table, authentication change, new write endpoint or external email integration.

## Verification

Final outcomes and receipt paths are recorded after the acceptance run below. Failed intermediate checks are retained under `verification/publication-experience-2026-09-27/` and are not silently relabeled as passes.

## Genuine remaining gates

1. Email sending, confirmation and token-based unsubscribe/preferences need an actual provider integration and operational ownership. Existing signup only captures requests; removal by contacting the editor remains the existing path.
2. No licensed article audio is available. No player or fabricated audio metadata was added.
3. Highlights/saves are local to the browser, not account-synced. Anyone using that browser profile can see notes. Clearing site data removes them.
4. Source metadata does not map sentences to individual citations. Source previews are functional; claim-level footnotes require actual editorial mappings. Human claim review and unresolved media provenance remain open.
5. Analytics hooks have no collection sink. No traffic, trending, conversion or engagement result is claimed.
6. Browser/automated accessibility checks do not replace real-device, screen-reader or sustained reader evaluation. Local performance observations are not field Core Web Vitals.
7. This work has not been deployed. The existing public-launch, release/operator and editorial gates still apply. No draft has been approved or published by this change.

## Reproduction

Run `npm test`, `npm run check:editorial`, `npm run lint`, `npm run typecheck`, `npm run build:vercel`, then `node scripts/next-runtime-smoke.mjs` and the expanded `scripts/browser-smoke.mjs` with the isolated Playwright setup in `REPRODUCE.md`. Browser artifacts can be redirected with `BROWSER_ARTIFACTS_DIR`.

`scripts/publication-a11y.mjs` uses the local preview at `TEST_BASE_URL` (default `http://127.0.0.1:3107`), Playwright from `BROWSER_TOOLS_DIR` and `axe-core` from `AXE_SCRIPT`. It writes a structured receipt, tests phone/desktop pages plus dark-reader/source/search/error states, and exits nonzero on violations. `npm run build` verifies the Workers/Vinext target separately.
