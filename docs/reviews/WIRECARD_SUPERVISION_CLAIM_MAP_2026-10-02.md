# Wirecard supervision claim-map review

**Record:** 0415 (`wirecard-missing-billions`)

**Canonical source SHA:** `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`

**Disposition:** held for human editorial approval

**Review date:** 2026-10-02

## Finding

The current oversight paragraph combines years of reporting, whistleblowers, journalists, traders and a claim that regulators treated Wirecard as a technology company rather than a financial institution. That compression does not distinguish the German Bundestag page’s parliamentary positions from the narrower findings in ESMA’s financial-reporting peer review.

The held correction replaces the broad narrative with four source-located propositions: Wirecard’s 22 June statement about €1.9 billion in reported balances; its 25 June insolvency filing; ESMA’s finding that media signals were not used to select Wirecard for examination in 2016–2018; and ESMA’s finding that the 2018 examination should have been broadened earlier after serious 2019 media allegations.

## Source-to-claim map

| Claim | Source location | Disposition |
|---|---|---|
| Wirecard said the €1.9 billion likely did not exist on 22 June 2020 | ESMA p. 40 | State date and attribute to Wirecard |
| Wirecard filed for insolvency on 25 June 2020 | ESMA p. 41 | Replace “within days” with exact date |
| FREP missed international-media signals in 2016–2018 selection | ESMA p. 7 | Attribute to ESMA |
| FREP and BaFin should have expanded the 2018 examination earlier | ESMA p. 8 | Attribute and retain the report’s limited scope |
| ESMA found coordination and information-flow deficiencies | ESMA p. 8 | Specify the types of deficiency |
| Regulators treated Wirecard as technology rather than finance | Not established as a unified finding by the cited sources | Remove from the brief |

## Sources inspected

- [ESMA — Fast Track Peer Review Report: Wirecard](https://www.esma.europa.eu/document/fast-track-peer-review-report-wirecard): official publisher page and full report supporting the dated events and supervisory findings used in the held copy.
- [German Bundestag — Wirecard inquiry report summary](https://www.bundestag.de/dokumente/textarchiv/2021/kw25-de-3ua-bericht-847030): official parliamentary summary distinguishing committee-majority findings and the parties’ separate positions.

The structured evidence map is in `docs/reviews/wirecard-supervision-claim-map.json`.

## Held correction artifact

`docs/reviews/wirecard-supervision-corrections.patch` proposes synchronized corrections to:

- `content/articles/wirecard-missing-billions.mdx`
- `lib/articles.ts`

The patch is deliberately not applied. `lib/articles.ts` and the source ledgers are active in other open pull requests, and this record still requires human editorial approval. Applying the source-metadata change later must include a fresh ledger-consistency update.

## Verification

Run from the repository root:

```sh
node --test scripts/wirecard-supervision-review-packet.test.mjs
git apply --check --unidiff-zero --whitespace=error-all docs/reviews/wirecard-supervision-corrections.patch
```

Results on the isolated branch `editorial/wirecard-supervision-claim-map-20261002`:

- `node --test scripts/wirecard-supervision-review-packet.test.mjs` — PASS, 3 tests.
- `git apply --check --unidiff-zero --whitespace=error-all docs/reviews/wirecard-supervision-corrections.patch` — PASS.
- `git diff --check` — PASS.
- `npm test` — PASS, 205 tests.
- `npm run check:editorial` — PASS, 28 public article records and 42 unpublished drafts checked; no fact-check approval implied.

## Open gates and exact next action

AI source review is not approval. Human editorial approval, consenting author attribution, image/source rights review, and issue #4 public-launch certification remain open. No reader-site content, publication state, audience permission, email, analytics or deployment is changed by this packet.

**Next action:** a human editor should compare the five retained propositions with the ESMA report, verify the Bundestag context, and record approval or requested edits. After the active `lib/articles.ts` and ledger work is reconciled, apply the held patch together with a fresh source-ledger consistency update.
