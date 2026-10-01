# 1MDB allegation diagram review — 2 October 2026

## Receipt

- **Artifact ID:** `0410-1mdb-july-2016-allegation-schematic-v1`
- **Branch:** `editorial/1mdb-allegation-diagram-20261002`
- **Source main SHA:** `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`
- **Scope:** research-only, reproducible SVG diagram and its underlying data; no reader-site integration
- **Active-PR collision check:** no changed path in this packet appears in open PRs #14, #17, #18, #19, #22, #23 or #24

## Files

- `content/research/1mdb-global-trail/diagram-data.json`
- `content/research/1mdb-global-trail/diagram.svg`
- `content/research/1mdb-global-trail/generate-diagram.mjs`
- `content/research/1mdb-global-trail/README.md`
- `scripts/one-mdb-allegation-diagram.test.mjs`
- `docs/reviews/ONE_MDB_ALLEGATION_DIAGRAM_REVIEW_2026-10-02.md`

## Source-to-figure boundary

1. [DOJ announcement, 20 July 2016](https://www.justice.gov/archives/opa/pr/united-states-seeks-recover-more-1-billion-obtained-corruption-involving-malaysian-sovereign)
   - Supports the rounded summaries of the three schemes, the alleged routing through accounts/shell companies and financial institutions, and the five asset categories displayed.
2. [Civil forfeiture complaint, case 2:16-cv-05371, filed 20 July 2016](https://www.justice.gov/opa/file/877326/dl?inline=)
   - Supports the Good Star, Aabar-BVI and Tanore phase names, their dates, intended purposes and allegation status.

The figure is intentionally schematic. Arrow width and box area do not encode value. It does not claim to identify every transaction, party, asset, disposition, settlement or later proceeding. It excludes “superyacht” because that term is not supported by the bounded July 2016 announcement used for the displayed asset list.

## Checks run

| Command | Result |
| --- | --- |
| `node --test scripts/one-mdb-allegation-diagram.test.mjs` | PASS — 4/4 tests |
| `node --experimental-strip-types --test scripts/*.test.mjs` | PASS — 206/206 tests |
| `node scripts/editorial-integrity.mjs` | PASS — 28 article records; 42 unpublished drafts; no fact-check approval implied |
| `git diff --check` | PASS |
| `inkscape content/research/1mdb-global-trail/diagram.svg --export-type=png --export-filename=/tmp/1mdb-diagram.png` | PASS — visual inspection at 1600×1000; no overlap or clipping after correction |

## Open gates

- This AI-assisted source review is not named human editorial approval.
- Consenting author attribution remains unconfirmed for any public use.
- The original vector has no third-party image dependency, but a human must still confirm the final source/rights note before release.
- Issue #4 public-launch certification remains open.
- The current reader article and registry are unchanged; this branch does not publish, merge, deploy, email, enable analytics or change audience permissions.

## Next exact action

A named human editor should compare the rendered diagram and caption with the cited complaint and DOJ announcement, record an approval or revision decision, and only then decide whether to replace the stale article citation and integrate the figure in a separate non-overlapping change after PR #23 clears `lib/articles.ts`.
