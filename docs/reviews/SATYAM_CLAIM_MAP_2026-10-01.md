# Satyam core-article claim map — 1 October 2026

## Review status

**AI-assisted source review only. Human editorial approval remains open.** This packet maps the revised companion article to official records. It does not establish every person’s liability, approve publication, clear media rights or close issue #4.

- Canonical repository: `build-the-future-11/Obscured-Records`
- Source branch: `main`
- Source SHA: `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`
- Work branch: `editorial/satyam-claim-map-20261001`
- Record: `0414`
- Article: `content/articles/satyam-confession.mdx`

## Source set and evidentiary roles

1. [B. Ramalinga Raju resignation letter — Satyam Form 6-K Exhibit 99.2](https://www.sec.gov/Archives/edgar/data/1106056/000114554909000025/u00107exv99w2.htm) — primary record of Raju’s statements and numerical admissions. It is not an independent audit or judgment.
2. [SEBI adjudication order recording the Maytas/confession sequence](https://www.sebi.gov.in/web/?file=%2Fsebi_data%2Fattachdocs%2F1404444629445.pdf) — official later procedural record; paragraph 1 records the 16 December announcement, 17 December cancellation and 7 January letter. The order concerns a separate noticee and is used only for that chronology.
3. [Company Law Board order — Satyam Form 6-K Exhibit 99.4](https://www.sec.gov/Archives/edgar/containers/fix061/1106056/000114554909000039/u00110exv99w4.htm) — official order suspending the existing board and authorizing the central government to constitute a replacement board.
4. [SEC charges and settlement announcement](https://www.sec.gov/newsroom/press-releases/2011-81-sec-charges-satyam-computer-services-financial-fraud) — later enforcement allegations, response actions and settlement terms. The announcement states that Satyam settled without admitting or denying the allegations.

No copyrighted report is copied into the repository; this packet provides links, bounded location notes and paraphrases.

## Claim-to-source map

| Article claim | Source location | Support and boundary |
|---|---|---|
| Satyam filed Raju’s 7 January 2009 resignation letter with the SEC. | Form 6-K Exhibits 99.1–99.2; letter heading and company announcement | Supported. The article names the filing context and date without implying SEC endorsement of the letter’s contents. |
| The letter described ₹5,040 crore non-existent cash/bank balances, ₹376 crore non-existent accrued interest, ₹1,230 crore understated liability and ₹490 crore overstated debtors as of 30 September 2008. | Exhibit 99.2, item 1(a)–(d) | Supported as Raju’s admissions. The copy explicitly says these are not an independent audit. |
| Raju contrasted reported September-quarter revenue/margin of ₹2,700/₹649 crore with what he called actual revenue/margin of ₹2,112/₹61 crore. | Exhibit 99.2, item 2 | Supported as the letter’s figures, with attribution retained. |
| Raju said the gap grew over years and characterized the aborted Maytas deal as an attempt to replace fictitious assets with real ones. | Exhibit 99.2, item 2 and the following Maytas paragraph | Supported as Raju’s explanation, not an independent causal finding. |
| The acquisition was announced 16 December, cancelled 17 December and followed by the 7 January letter. | SEBI adjudication order, paragraph 1 | Supported for chronology only. The previous unsourced phrase `investor backlash` was removed. |
| On 9 January, the Company Law Board suspended the existing board and authorized a new board. | Company Law Board order, paragraph 4(i)–(ii) | Supported. The revised wording replaces the broader phrase `India dissolved the board`. |
| The SEC later alleged false invoices and forged bank statements were used to overstate revenue, income and cash by more than $1 billion over five years. | SEC release, first three paragraphs and scheme description | Supported as an allegation; the revised copy says `alleged`. |
| Satyam settled without admitting or denying the SEC allegations. | SEC release, settlement paragraph | Supported. Settlement is not described as an adjudication of all alleged conduct. |

## Repairs made

- Replaced an impressionistic opening with the dated filing and attributed numerical admissions.
- Removed `investor backlash`, which was not supported by the prior single source.
- Replaced `India dissolved the board` with the specific Company Law Board action.
- Separated Raju’s admissions, SEBI chronology, the Company Law Board intervention and later SEC allegations/settlement.
- Changed the primary article source from the 2011 SEC enforcement release to the contemporaneous resignation letter and retained three official additional sources.
- Updated the article and runtime registry date to 1 October 2026.

## Verification and open gates

The four linked official records were inspected on 1 October 2026. The three SEC/EDGAR HTML records were directly readable. The SEBI endpoint resolved to the official PDF viewer; its indexed official text exposed the dated announcement/cancellation/confession sequence used here. No source was treated as human approval or as universal support for claims outside the mapped passages.

Executed from the repository root on Node `v24.19.0`:

```text
node --test scripts/satyam-claim-map.test.mjs
2 tests passed; 0 failed; 0 skipped

npm test
204 tests passed; 0 failed; 0 skipped

npm run check:editorial
PASS: 28 article records; 42 unpublished drafts; 50 distinct subjects

git diff --check
PASS
```

The regression proves that all four official URLs remain present in the article, runtime registry and this claim map, and that the admission/allegation/settlement boundaries remain in the copy. The suite's `Newsletter persistence unavailable.` line is an expected fail-closed test-path diagnostic; the suite completed with zero failures.

Changed files:

- `content/articles/satyam-confession.mdx`
- `lib/articles.ts`
- `scripts/satyam-claim-map.test.mjs`
- `docs/reviews/SATYAM_CLAIM_MAP_2026-10-01.md`

Still open:

- named-human claim-level editorial approval;
- author consent/attribution confirmation;
- rendered-copy review;
- any media-rights decision (this packet adds no media);
- release-candidate freeze, deployment attribution and issue #4 public-launch certification.

## Next exact action

A named human editor should read the final rendered article beside the four linked records, confirm or revise each row above, and record an approval decision. Green tests or this AI-assisted map cannot substitute for that decision.
