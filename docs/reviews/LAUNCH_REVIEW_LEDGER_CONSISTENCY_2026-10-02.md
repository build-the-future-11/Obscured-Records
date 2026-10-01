# Launch review ledger consistency — 2 October 2026

## Receipt

- **Artifact ID:** `launch-review-ledger-consistency-r1-2026-10-02`
- **Branch:** `editorial/launch-review-ledger-consistency-20261002`
- **Source main SHA:** `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`
- **Issue #4:** open; public launch remains **HOLD**
- **Active-PR collision check:** no changed path in this packet appears in open PRs #14, #17, #18, #19, #22, #23, #24 or #25

## Reproduced defect

The dated launch editorial review ledger is the human-approval checklist for all 28 reader records. After main changed the canonical FedEx and Minamata sources, that ledger retained the superseded starting points:

| Record | Stale ledger source | Canonical source on main |
| --- | --- | --- |
| 0421 — FedEx Flight 705 | FBI Vault catalogue | [Sixth Circuit appellate opinion](https://law.justia.com/cases/federal/appellate-courts/F3/116/1129/610984/) |
| 0407 — Minamata | Broad WHO mercury history | [National Institute for Minamata Disease cause investigation](https://nimd.env.go.jp/archives/english/minamata_disease_in_depth/cause_investigation/) |

A pre-change comparison found exactly those two mismatches; the other 26 ledger sections matched their canonical article source URLs.

## Repair

- Updated the two stale human-review starting points without changing any decision or reviewer state.
- Added a reusable validator that binds every ledger section to its article `recordId`, slug and exact `sourceUrl`.
- Integrated that validator into `scripts/editorial-integrity.mjs`.
- Added mutations that must reject both reproduced stale URLs, a missing section, a duplicate section and a noncanonical slug.

## Changed files

- `docs/LAUNCH_EDITORIAL_REVIEW_2026-09-27.md`
- `scripts/launch-review-ledger-consistency.mjs`
- `scripts/launch-review-ledger-consistency.test.mjs`
- `scripts/editorial-integrity.mjs`
- `docs/reviews/LAUNCH_REVIEW_LEDGER_CONSISTENCY_2026-10-02.md`

## Checks run

| Command | Result |
| --- | --- |
| `node --test scripts/launch-review-ledger-consistency.test.mjs` | PASS — 3/3 tests |
| `node scripts/editorial-integrity.mjs` | PASS — 28 article records and all 28 launch-review sections consistent; 42 drafts remain unpublished |
| `node --experimental-strip-types --test scripts/*.test.mjs` | PASS — 205/205 tests |
| `git diff --check` | PASS |

## Gates intentionally left open

- All ledger decisions remain `PENDING` with reviewers unassigned.
- This consistency check is not named human editorial approval or claim-level fact-check completion.
- Consenting author attribution and media/source-rights review remain required where applicable.
- No release-candidate SHA is frozen, no deployment is certified and issue #4 remains open.
- No merge, deploy, publication, newsletter/email action, analytics enablement or audience-permission change is authorized by this repair.

## Next exact action

After review of this draft change, merge it only through the normal protected process. Then a named human editor should work the corrected FedEx and Minamata checklist rows against the cited records and record approve/revise decisions; ledger consistency alone must not advance either story to approved or published.
