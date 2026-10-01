# Goiânia count claim-map review

**Record:** 0409 (`goiania-blue-powder`)

**Canonical source SHA:** `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`

**Disposition:** held for human editorial approval

**Review date:** 2026-10-02

## Finding

The current article and registry say that four people died, “hundreds were contaminated or exposed,” buildings were demolished, and thousands of cubic metres of waste were generated. The cited IAEA report gives separate counts for people monitored, found contaminated, hospitalized, and killed. Collapsing those cohorts into “contaminated or exposed” obscures the difference between screening and a contamination finding. The same report also gives exact cleanup figures.

The held replacement is:

> Fragments travelled through families and neighbourhoods before the source was recognized. The IAEA reports that about 112,000 people were monitored, 249 were found internally or externally contaminated, 20 required hospital treatment and four died. Cleanup included the demolition of seven houses, and the response ultimately stored 3,500 cubic metres of radioactive waste.

## Source-to-claim map

| Claim | IAEA report location | Disposition |
|---|---|---|
| About 112,000 people were monitored | Page 13 | State as monitored, not contaminated |
| 249 were internally or externally contaminated | Page 13 | State as the contamination finding |
| 20 required hospital treatment | Page 13 | State as a distinct treatment cohort |
| Four died | Page 13 | Retain |
| Seven houses were demolished | Pages 15–16 | Replace vague “buildings” wording |
| Final stored waste volume was 3,500 m³ | Page 16 | Replace vague “thousands” wording |

## Source inspected

- [International Atomic Energy Agency — The Radiological Accident in Goiânia](https://www-pub.iaea.org/mtcd/publications/pdf/pub815_web.pdf): the official 1988 technical report. Page 13 records the four population and outcome counts; pages 15–16 record the seven demolished houses; page 16 records the final stored waste volume.
- [IAEA publication record](https://www.iaea.org/publications/3684/the-radiological-accident-in-goiania): publisher catalogue entry for the report.

The structured evidence map is in `docs/reviews/goiania-count-claim-map.json`.

## Held correction artifact

`docs/reviews/goiania-count-corrections.patch` proposes synchronized corrections to:

- `content/articles/goiania-blue-powder.mdx`
- `lib/articles.ts`

The patch is deliberately not applied. `lib/articles.ts` is active in another open pull request, and this record still requires human editorial approval.

## Verification

Run from the repository root:

```sh
node --test scripts/goiania-count-review-packet.test.mjs
git apply --check --unidiff-zero --whitespace=error-all docs/reviews/goiania-count-corrections.patch
```

Results on the isolated branch `editorial/goiania-count-claim-map-20261002`:

- `node --test scripts/goiania-count-review-packet.test.mjs` — PASS, 3 tests.
- `git apply --check --unidiff-zero --whitespace=error-all docs/reviews/goiania-count-corrections.patch` — PASS.
- `git diff --check` — PASS.
- `npm test` — PASS, 205 tests.
- `npm run check:editorial` — PASS, 28 public article records and 42 unpublished drafts checked; no fact-check approval implied.

## Open gates and exact next action

AI source review is not approval. Human editorial approval, consenting author attribution, image/source rights review, and issue #4 public-launch certification remain open. No reader-site content, publication state, audience permission, email, analytics, or deployment is changed by this packet.

**Next action:** a human editor should compare the six mapped quantities with the IAEA report, record approval or requested edits, then coordinate application of the held patch after resolving the `lib/articles.ts` overlap.
