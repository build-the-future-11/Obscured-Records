# Publication experience audit — 27 September 2026

Baseline: clean Git checkout `cef35d1`. Scope: the existing Next.js 16 / React 19 reader application, also built through Vinext for Workers. No deployment is implied by this work.

## What exists

- Repository-backed CMS: 28 published records in `lib/articles.ts`, eight expanded bodies in `lib/features.ts`; 42 drafts are excluded by explicit publication gates. Six existing sections and per-record tags are the real taxonomy.
- One credited author, source links, method disclosures, dated corrections, computed reading labels, related-story scoring, canonical metadata, article JSON-LD, sitemap, news sitemap and RSS.
- D1 stores newsletter requests and editorial submissions. Newsletter is capture-only, with honest errors when storage is unavailable. There is no reader account system, audio asset model, analytics collector, or browser editor.
- Local editorial CLI enforces review/approval boundaries. Preserve this workflow; never expose draft material through public discovery.
- Dual Workers and Next builds; existing unit, integrity, browser, route and intake checks.

## Findings and implementation checklist

- [x] Reduce oversized article headlines/covers and tighten readable paragraph rhythm; replace CSS hero backgrounds with semantic reserved-size media.
- [x] Keep varied homepage hierarchy, add byline/date, chronological latest feed, topics and genuine reading collections. Remove animated archive ticker and decorative fake media treatments from reading/discovery pages.
- [x] Make Archive, Topics, Series and Saved discoverable; add keyboard search with real grouped results and recent searches.
- [x] Build URL-addressable archive/search filters for publication year/month, author, section, topic, format and series. All records currently share one publication date; never invent archive depth.
- [x] Add topic descriptions, author discovery, ordered thematic reading series and within-article continuation. Label these as curated reading paths through existing records, not new investigations or publication chronology.
- [x] Add article-scoped progress, deep-linked contents with active section, saved states, minimal text/theme preferences, native sharing and source previews.
- [x] Keep sources and corrections honest. There are no claim-level citation anchors in the source model; source previews must not invent which source supports which sentence.
- [x] Add browser-local saved reading and private notes/highlights with text/context links and removal controls. Clearly disclose lack of account sync and device privacy.
- [x] Improve the existing local editorial inbox, showing review work and source-review status without changing approval authority.
- [x] Extend SEO discovery, error/loading states, mobile and keyboard verification; retain source and release gates.

## Reference study

The [Verge](https://www.theverge.com/) informs unequal lead/secondary weights and section rhythm. [Medium publication documentation](https://help.medium.com/hc/en-us/articles/115004681607-Getting-started-with-a-Medium-publication) informs author/topic discovery. [Substack navigation documentation](https://support.substack.com/hc/en-us/articles/20512194655892-How-do-I-organize-the-navigation-bar-on-my-Substack-publication) informs straightforward archive/newsletter access. [Readwise](https://docs.readwise.io/reader/docs/faqs/highlights-tags-notes) informs focused saved material and contextual notes. [Ground News](https://ground.news/) informs visible supporting source context only; no ideological labels or unsupported scores are added. Their branding is not copied.

## Genuine constraints

Email sending, confirmations and token-based unsubscribe require an actual delivery integration. Audio remains absent until licensed audio exists. No analytics popularity is available. Human editorial/claim review, disputed media provenance, production performance, assistive-technology review and deployment remain separate gates. Local storage is not account infrastructure. No database migration is necessary for reader-only additions.

## Verification findings retained during implementation

The first browser sweep found newsletter heading overflow at 320px. Automated contrast checks found inherited accent colors below their required contrast. A global loading boundary temporarily changed unknown-article responses to soft 404s; it was removed and loading was scoped to archive/search. Browser interaction tests exposed whole-paragraph selection handling and ambiguous reader control labels. These were corrected, and failed receipts remain in the verification folder.

## Component audit

The `components/ui` directory contains a large starter inventory, including charts and dashboard primitives. Reader routes do not import that inventory; it is retained to avoid unrelated deletion. The new reader controls use native inputs, details and dialogs, and the story variants share a single semantic component. Existing intake and publication policy components are reused.
