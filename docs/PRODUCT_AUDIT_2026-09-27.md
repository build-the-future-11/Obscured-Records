# Product audit — 27 September 2026

| Surface | Observed implementation / action | Boundary |
|---|---|---|
| Routing | Homepage, all 28 records, six sections, author, search, policy pages and feeds checked in built Next.js | Live host not checked against this export |
| Content model | Explicit published/date guard; 42 separate draft files; validated metadata and 50-subject inventory | Human review and claim-level verification remain open |
| Reader discovery | Section taxonomy, tag-aware related record, search and repeated-query normalization | Small in-memory corpus search, not a CMS search service |
| Editorial control | Draft/review/held/approved transition tool; approval fields/checklist/source gate; deliberate registry publication | Local repository access, no public role/admin interface |
| Submissions | Private D1 write, validation/consent, bounded body, honeypot, durable throttle, receipt only after save | Production operator and backend not verified; no email acknowledgement |
| Newsletter | Durable D1 capture and abuse controls; pending confirmation; honest unavailable/timeout feedback | No confirmation delivery or unsubscribe/suppression provider |
| SEO | Canonicals, Open Graph, article metadata, source links, RSS, robots, sitemaps | No ranking or indexing guarantee; news sitemap can correctly be empty for old records |
| Corrections | FedEx duration correction dated and visible; reading estimates derive from copy; source repairs logged | Other inherited historical claims not independently recertified |
| Accessibility | Keyboard mobile menu, skip target, heading/label checks, readable failure state, no-JS safety; no horizontal overflow at 375/768/1440px | Not a complete WCAG/screen-reader audit |
| Performance | Two production builds; local document/resource samples retained; roughly 3.43 MB same-origin first mobile home transfer before the dependency-only final rebuild | Existing large archival assets remain; no field LCP/INP/CLS claim |
| Media/audio | Existing images/credits preserved; audio operating packet reviewed | Rights not proved; no playable audio release claimed |
| Analytics | Existing event contract only; no fabricated popularity ranking | No instrumentation or audience result claimed |
| Error states | Unknown/draft routes 404; malformed requests 400/413/415; throttle 429; absent storage 503; GET private submissions 405 | No broad outage/load simulation |
| Deployment | Workers build + actual local D1 integration; Node/Next webpack build + reader/browser checks | Vercel has no D1 binding; production credentials/migrations/revision absent |
| Dependencies | One targeted transitive advisory repaired; final production npm audit reports zero known vulnerabilities | Advisory scan is not a security certification; dev dependencies not in this audit scope |

The optional auth development plugin has mock identity support for local preview. No intake read or publishing route trusts that identity. The all-zero D1 identifier in the local build configuration is a local binding placeholder, not a production database credential. These scaffolding hooks were preserved and must not be used as proof of production authorization.

TODO/FIXME, mock/demo/placeholder, machine paths and common credential shapes were scanned in source/docs (values suppressed). Matches were form placeholders, styling, test fixtures, local preview scaffolding and explanatory docs; no fake runtime success path was used. No TODO/FIXME or common secret-key signature was found. This bounded scan cannot prove absence of every secret or vulnerability.
