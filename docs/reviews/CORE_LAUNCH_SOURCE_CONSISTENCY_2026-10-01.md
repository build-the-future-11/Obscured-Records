# Core-launch source consistency receipt — 1 October 2026

## Scope and source identity

- Canonical repository: `build-the-future-11/Obscured-Records`
- Source branch: `main`
- Source SHA: `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`
- Work branch: `editorial/core-source-ledger-consistency-20261001`
- Related merged work: PR #21, head `97332295e3375dde90c4e451523a55134e677ff8`, merge commit `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`
- PR #21 exact-head CI: run `36892452400`, completed successfully

This is an editorial-integrity repair. It is not human editorial approval, publication authorization, a rights clearance, a deployment receipt or closure of issue #4.

## Reproduced defect

PR #21 changed Minamata's companion article and source pass from a broad WHO mercury source to the subject-specific National Institute for Minamata Disease cause investigation. The dated launch queue still said `WHO source basis`. The queue also represented every other core source only as free text, so the repository had no executable check tying a launch-row source to its article frontmatter and source-pass section.

The new regression includes the stale Minamata form as a synthetic fixture and proves that the consistency check rejects it.

## Repair

1. Replaced the ten core queue source labels with exact links matching each core article's current `sourceUrl`, while preserving existing media holds, legal-attribution boundaries and human-approval requirements.
2. Added `scripts/core-launch-source-consistency.test.mjs`.
3. The test requires the core queue and dated source pass to carry the same record-ID roster.
4. For every core record, it requires an MDX article, requires the queue source cell to link the article's exact primary `sourceUrl`, and requires the record's source-pass section to contain that same URL.

## Changed files

- `docs/EDITORIAL_LAUNCH_QUEUE_2026-10-01.md`
- `scripts/core-launch-source-consistency.test.mjs`
- `docs/reviews/CORE_LAUNCH_SOURCE_CONSISTENCY_2026-10-01.md`

No open-PR file was modified. The changed-file sets of open PRs #14 and #17–#19 were inspected before work began.

## Executed verification

From the repository root on Node `v24.19.0`:

```text
node --test scripts/core-launch-source-consistency.test.mjs
2 tests passed; 0 failed; 0 skipped

npm test
204 tests passed; 0 failed; 0 skipped

npm run check:editorial
PASS: 28 article records; 42 unpublished drafts; 50 distinct subjects

git diff --check
PASS
```

The suite's `Newsletter persistence unavailable.` line is an expected fail-closed test-path diagnostic; the suite completed with zero failures.

## Source links bound by the regression

- 0421 FedEx Flight 705: https://law.justia.com/cases/federal/appellate-courts/F3/116/1129/610984/
- 0415 Wirecard: https://www.bundestag.de/dokumente/textarchiv/2021/kw25-de-3ua-bericht-847030
- 0414 Satyam: https://www.sec.gov/newsroom/press-releases/2011-81-sec-charges-satyam-computer-services-financial-fraud
- 0410 1MDB: https://www.justice.gov/archives/opa/pr/united-states-files-civil-forfeiture-complaints-more-1-billion-assets-associated
- 0409 Goiânia: https://www-pub.iaea.org/mtcd/publications/pdf/pub815_web.pdf
- 0407 Minamata: https://nimd.env.go.jp/archives/english/minamata_disease_in_depth/cause_investigation/
- 0406 Times Beach: https://www.epa.gov/mo/town-flood-and-superfund-looking-back-times-beach-disaster-nearly-40-years-later
- 0404 Therac-25: https://web.mit.edu/6.033/2004/wwwdocs/papers/Therac_1.html
- 0395 United Flight 629: https://www.fbi.gov/history/cases-and-criminals/jack-gilbert-graham
- 0394 Centralia: https://www.pa.gov/agencies/dep/programs-and-services/mining/abandoned-mine-reclamation/aml-program-information/centralia-mine-fire-resources/chronology

## Gates intentionally left open

- Named human claim-level editorial approval for every core story
- Consenting author attribution where required
- Held or unresolved image/source-rights review
- Production newsletter, analytics and submission-intake verification
- Immutable release-candidate deployment and issue #4 public-launch certification

## Next exact action

Review this isolated branch and its hosted CI result. If accepted, merge only after confirming the source URLs still match the final branch head. Do not infer editorial approval or release authorization from a green consistency test.
