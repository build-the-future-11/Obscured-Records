# Second expansion — 2,000 additional drafts — 15 October 2026

## Result

Added 2,000 distinct private article drafts, taking the desk from 1,245 to **3,245 unpublished manuscripts**, from 1,253 to **3,253 distinct subjects**, and from 1,081,501 to **2,955,788 draft words**. The existing 28 reader records and every prior manuscript are unchanged.

The new manuscripts contain 1,874,287 words, ranging from 893 to 1,091 words each. These are AI-assisted archival reconstruction plans, not fact-checked articles or original reporting. Authors remain unassigned, approvals remain null, and no draft enters reader routes, search, feeds, sitemaps or series.

## Discovery and reproduction

The collector scanned 219 root and directly related category indexes containing 6,575 distinct candidate pages. It selected 2,000 new subjects across 182 contributing indexes, excluding existing slugs, source URLs, resolved Wikipedia page identities and known Wikidata identities. All accepted subjects have exact Wikipedia and Wikidata revision IDs. Of these subjects, 120 had no English Wikidata description; the missing state is retained explicitly.

| Section | New drafts |
|---|---:|
| Business | 252 |
| Culture | 193 |
| Science | 559 |
| Technology | 343 |
| Underreported | 245 |
| World | 408 |

Source snapshot: `content/article-expansion-2026-10-15-second.json`. Discovery began at `2026-10-15T15:55:57.098Z`. The snapshot is preserved rather than overwritten by a later collector run.

```sh
node scripts/collect-thousand-article-manifest.mjs --target 2000 --output content/article-expansion-2026-10-15-second.json --include-subcategories
node scripts/generate-thousand-more-articles.mjs --manifest content/article-expansion-2026-10-15-second.json --count 2000
node scripts/generate-editorial-drafts.mjs
```

The collector command is the original creation command and deliberately refuses to replace an existing snapshot. A new collection must use a new output path. The draft generator permits identical regeneration but refuses to overwrite changed or reviewed manuscript content.

## Verification

- Sequential bounded Node suite: **252/252 passed**, no failures, cancellations or skipped tests.
- Editorial integrity: **28 reader records, 3,245 drafts, 2,955,788 draft words, 3,253 distinct subjects**.
- Combined expansion-source audit: **3,200 checked, 3,200 reachable**. Each Wikipedia title must resolve to a returned page; empty or incomplete API responses cannot count as success.
- SEO/discovery audit: **3,245 manuscripts, 28 reader records, 28 RSS items, 45 topics, three series**, and draft isolation.
- Every new manuscript retains both orientation links, its review checklist, AI-assistance disclosure, unassigned authorship and null approval.
- Git comparison confirms no changes to prior draft files or reader article files.
- The private-desk projection now writes one manuscript at a time through an atomic temporary file. Before adding the new batch, its output for the existing 1,245 records remained byte-for-byte identical: SHA-256 `e319d6e7c3caf2ae6b4d57dc1149cabf2b4b7fd585bbf7d84b2756e117c04d12`. The 3,245-record projection completed with a 96 MiB Node heap cap.

URL reachability and distinct metadata do not establish claim accuracy, fairness, authorship or editorial approval. Wikipedia category membership and Wikidata descriptions remain orientation evidence only.

## Deployment and publication boundary

The local host remained below the 512 MiB free-plus-speculative-memory build floor. No local install or production build was forced. The source workflow pushed the exact source; local packaging reported `Missing dist/server/index.js`, so the supported provider build fallback was used.

- Local content commit: `d177c1c`, branch `codex/two-thousand-more-articles-20261015`.
- Private Site source: `8e8cb6a4cb0ac1254353fe96ae5bd83f579fa107`.
- Saved version: **25**, `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_645efc2fbc48819192e4fea93f4e5a9f`.
- Initial failed deployment: `appgdep_6ad0f9e6466c819199e9b44a109c2e82`. Provider failure: `rm: cannot remove '/tmp/appgen-saved-version-build-be14655a5959/project/node_modules/es-abstract': Directory not empty`.
- Successful retry of the unchanged saved version: `appgdep_6ad0fa81ede88191abbf366f42e59a83`, completed `2026-10-15T16:14:34.074364Z`.
- Environment revision: **13**, with `COMMIT_SHA` equal to the private source SHA above.
- Production URL: https://obscured-records.ryangomez-hs.chatgpt.site.
- Provider archive: 34,826,240 bytes, 209 files, content hash `sha256:ff18a146e449a3915154ff5e3ac9961c7cc6b9efc4ef4e3ef7ebdfa878ed8d13`.
- Access confirmed after deployment: one owner, zero groups, zero external visitors.
- All 3,609 tracked local source files matched the private source checkout byte-for-byte before deployment. Local and Site commit IDs differ because they are separate repositories; post-deployment documentation receipts are recorded locally afterward.

Five fresh read-only runtime checks passed at `2026-10-15T16:15:29.258Z`: the revision endpoint returned the exact deployed SHA with HTTP 200; RSS contained 28 reader items; the newly added Estonia cyberattack draft returned 404 on its reader route; the editorial desk required owner sign-in even with the provider's identity-less API token; and anonymous homepage access returned 401. These checks do not establish an owner-authenticated visual review of all 3,245 manuscripts. The in-app browser reached the sign-in flow, so that visual check remains unverified. See the retained [runtime receipt](ARTICLE_EXPANSION_2026-10-15_SECOND_RUNTIME.json).

No database schema, audience, newsletter sending, analytics activation or public reader publication is part of this expansion. No public GitHub push is authorized by this request. The existing untracked `verification/` directory is preserved. Public launch remains **HOLD**, with individual claim review, named authorship, fairness/privacy review, media rights and named human approval still required.
