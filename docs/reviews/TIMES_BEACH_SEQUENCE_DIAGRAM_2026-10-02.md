# Times Beach sequence-diagram review receipt

**Record:** 0406 (`times-beach-dioxin`)

**Canonical source SHA:** `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`

**Branch:** `editorial/times-beach-sequence-diagram-20261002`

**Disposition:** finished review artifact; held outside reader site

## Editorial task closed

The existing draft checklist asks for verification of the sequence connecting contaminated road oil, the December 1982 flood and permanent relocation. This packet converts that open sequence into a source-located, reproducible diagram without changing the public article or asserting approval.

## Source

[U.S. EPA Region 7, “A Town, a Flood, and Superfund: Looking Back at the Times Beach Disaster Nearly 40 Years Later”](https://www.epa.gov/mo/town-flood-and-superfund-looking-back-times-beach-disaster-nearly-40-years-later), inspected 2 October 2026. The page reports its latest update as 11 December 2025.

The artifact selects eight stages from the EPA chronology. Each event in `timeline.json` includes the exact page-line range used during review.

## Changed files

- `content/research/times-beach-sequence/timeline.json`
- `content/research/times-beach-sequence/generate.mjs`
- `content/research/times-beach-sequence/timeline.svg`
- `content/research/times-beach-sequence/README.md`
- `scripts/times-beach-sequence-diagram.test.mjs`
- `docs/reviews/TIMES_BEACH_SEQUENCE_DIAGRAM_2026-10-02.md`

## Caption boundary

The diagram states that equal spacing and card size do not encode elapsed time, contamination level, risk, cost, causal weight or policy effectiveness. It is not a complete community history or an independent health assessment. No copied photographs, maps or EPA graphics are included.

## Verification

Run from the repository root:

```sh
node content/research/times-beach-sequence/generate.mjs
node --test scripts/times-beach-sequence-diagram.test.mjs
npm test
npm run check:editorial
git diff --check
```

Results on `editorial/times-beach-sequence-diagram-20261002`:

- `node content/research/times-beach-sequence/generate.mjs` — PASS; committed SVG regenerated deterministically.
- `node --test scripts/times-beach-sequence-diagram.test.mjs` — PASS, 3 tests.
- `npm test` — PASS, 205 tests.
- `npm run check:editorial` — PASS, 28 public records and 42 unpublished drafts checked; no fact-check approval implied.
- `git diff --check` — PASS.
- Inkscape render at 1200 px — visually inspected; no overlap or clipping, all eight event cards and caption legible.

## Open gates and next action

Human editorial approval, consenting author attribution, source/rights review and issue #4 public-launch certification remain open. This packet does not change article status, public assets, application imports, audience permissions, analytics, email or deployment.

**Next action:** a human editor should compare all eight event labels and the caption with the EPA page, then either approve the artifact for later article integration or return specific wording changes. Public integration must wait for that decision and the issue #4 release gate.
