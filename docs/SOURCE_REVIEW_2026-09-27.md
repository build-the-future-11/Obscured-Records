# Source review — 27 September 2026

The new direct HTTP audit covers 70 distinct cited URLs: 54 returned an unchanged-document HTTP 200 and 16 remain access-unverified. Unlike the older audit, HTTP 202 challenge responses are not counted as verified access. No direct 404/410 was observed. This is not claim-level fact-check completion.

Two false-positive citation destinations were repaired throughout the relevant source/draft files:

- The old NASA Earth Observatory Aral Sea address redirected to the general Earth Observatory landing page. It now points to [World of Change: Shrinking Aral Sea](https://science.nasa.gov/earth/earth-observatory/world-of-change/aral-sea/), whose subject-specific content was read.
- The CDC Tuskegee timeline redirected to CDC's homepage in the direct audit. The draft now links to [CDC's study overview](https://www.cdc.gov/tuskegee/about/), whose subject-specific content was read. A reviewer must still map each draft claim to the relevant passage rather than treating this overview as universal support.

## Additional access evidence

The browsing tool could read these records despite direct-client access denial or challenge responses. Keep both observations; do not erase the failed direct checks.

| Source | What was established | Remaining boundary |
| --- | --- | --- |
| [FBI Flight 629 case](https://www.fbi.gov/history/cases-and-criminals/jack-gilbert-graham) | The case page describes the 1 November 1955 flight and 44 deaths. | Verify all motive, prosecution and narrative claims against exact passages. |
| [FBI Richard McCoy case](https://www.fbi.gov/history/cases-and-criminals/richard-floyd-mccoy-jr) | Subject-specific official case page is available through browsing. | Full claim mapping remains open. |
| [Calloway appellate opinion](https://law.justia.com/cases/federal/appellate-courts/F3/116/1129/610984/) | The cited 1997 opinion is accessible through browsing. | Court findings and narrative interpretation must remain distinguished. |
| [FBI Flight 705 archive](https://vault.fbi.gov/fedex-flight-705-incident-on-april-7-1994) | The official catalogue lists two document parts. | Catalogue access is not review of the full files. |
| [Chatham House case studies](https://www.chathamhouse.org/2022/03/uncertainty-and-complexity-nuclear-decision-making/05-nuclear-decision-making-case-studies) | The cited study chapter is accessible through browsing. | Review the Petrov case and distinguish interpretation from primary records. |
| [IAEA Goiânia report](https://www.iaea.org/publications/3684/the-radiological-accident-in-goiania) | The publisher identifies STI/PUB/815, publication year 1988, and links the full report. | Verify individual counts/claims in the report. |
| [ICAO aviation security history](https://www.icao.int/sites/default/files/postalhistory/legal_instruments_related_to_aviation_security.htm) | Official historical page includes the 1970 hijackings and related conventions. | It does not independently substantiate every hostage narrative. |
| [USGS Lake Nyos image](https://www.usgs.gov/media/images/exploding-lakes-cameroon) | Subject-specific image description and public-domain designation are readable. | Photograph description is not a substitute for the scientific reports. |

## Still unresolved

Direct access remains unverified for the Aviation Safety Network record, National Archives catalogue, Britannica Banqiao article, Encyclopedia of Chicago Eastland article, Navy Akron page, UNEP Aral article and two USGS scientific-publication pages. The Navy endpoint had a TLS verification failure; no certificate checks were disabled. Search indexed the Eastland entry, but the direct hostname failed resolution. Locate stable primary documents or retain these as unresolved.

Each launch record still needs a named editor's claim-level approval. Keep all 42 drafts unpublished; do not publish a draft merely because its source URL responds. Original and updated machine receipts remain under `verification/` locally.
