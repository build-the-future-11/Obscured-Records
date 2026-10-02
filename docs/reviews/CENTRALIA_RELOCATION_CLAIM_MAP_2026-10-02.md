# Centralia relocation claim-map review

**Record:** 0394 (`centralia-underground-fire`)

**Canonical source SHA:** `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`

**Disposition:** held for human editorial approval

**Review date:** 2026-10-02

## Finding

The current headline says the fire “forced a town’s relocation.” Pennsylvania DEP’s chronology records two materially different stages: Congress funded **voluntary acquisition and relocation** in 1984, while condemnation procedures for remaining properties began in 1992. The current opening also states that the fire entered abandoned workings and spread through a network of seams and passages, a mechanism not documented by the cited chronology.

The held correction removes the unsupported mechanism, distinguishes voluntary acquisition from later condemnation, and replaces vague response language with exact dated quantities from the official chronology.

## Source-to-claim map

| Claim | DEP chronology entry | Disposition |
|---|---|---|
| Fire dates to May 1962 | May 1962 | Retain with agency attribution |
| Control attempts cost $3.3 million with limited results | 1962–1978 | Add exact period and amount |
| OSM acquired 34 properties; state began air monitoring | 1979–1982 | Add |
| Route 61 suffered severe fire-related subsidence damage | 1983 | Add as sequence marker |
| Congress appropriated $42 million for voluntary acquisition and relocation | 1984 | Preserve “voluntary” |
| 545 residences and businesses acquired; residents moved | 1985–1991 | Add exact count and category |
| Condemnation procedures began for remaining properties | January 1992 and 1992–1993 | Distinguish from voluntary program |
| Fire entered workings and spread through seams/passages | Not stated | Remove unless a separate technical source is added |

## Source inspected

- [Pennsylvania DEP — Centralia mine fire chronology](https://www.pa.gov/agencies/dep/programs-and-services/mining/abandoned-mine-reclamation/aml-program-information/centralia-mine-fire-resources/chronology): official state chronology supporting the dates, costs, monitoring, subsidence, acquisitions, relocation and condemnation sequence used in the held copy.

The structured evidence map is in `docs/reviews/centralia-relocation-claim-map.json`.

## Held correction artifact

`docs/reviews/centralia-relocation-corrections.patch` proposes synchronized corrections to:

- `content/articles/centralia-underground-fire.mdx`
- `content/drafts/centralia-underground-fire.md`
- `lib/articles.ts`

The patch is deliberately not applied. `lib/articles.ts` is active in another open pull request, and this record still requires human editorial approval.

## Verification

Run from the repository root:

```sh
node --test scripts/centralia-relocation-review-packet.test.mjs
git apply --check --unidiff-zero --whitespace=error-all docs/reviews/centralia-relocation-corrections.patch
```

Results on the isolated branch `editorial/centralia-relocation-claim-map-20261002`:

- `node --test scripts/centralia-relocation-review-packet.test.mjs` — PASS, 3 tests.
- `git apply --check --unidiff-zero --whitespace=error-all docs/reviews/centralia-relocation-corrections.patch` — PASS.
- `git diff --check` — PASS.
- `npm test` — PASS, 205 tests.
- `npm run check:editorial` — PASS, 28 public article records and 42 unpublished drafts checked; no fact-check approval implied.

## Open gates and exact next action

AI source review is not approval. Human editorial approval, consenting author attribution, image/source rights review, and issue #4 public-launch certification remain open. No reader-site content, draft state, publication state, audience permission, email, analytics or deployment is changed by this packet.

**Next action:** a human editor should compare the dated sequence and quantities with the DEP chronology, record approval or requested edits, then coordinate application of the held patch after resolving the `lib/articles.ts` overlap.
