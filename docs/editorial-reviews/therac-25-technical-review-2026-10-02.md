# Therac 25 technical source review

Review date: 2 October 2026, Asia/Kolkata. Base: `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`.

**Disposition: corrections prepared; named editorial approval and release remain on hold.** This AI-assisted pass covers the current brief and feature. It does not authorize publication or clear the held cover image. The patch is a proposal stored outside the application source; no reader copy or publication metadata is changed by this review branch.

## Findings and exact source locations

| Current-copy location or claim | Review finding | Source location |
| --- | --- | --- |
| Timeline 1982 clinical-use claim | Correct to commercial availability | [Investigation I](https://web.mit.edu/6.033/2004/wwwdocs/papers/Therac_1.html), Genesis paragraph beginning “AECL produced”; Kennestone paragraph discusses operation since 1983 |
| Six known accidents during 1985–1987 | Supported | Investigation I, opening and Accident history |
| United States and Canada | Supported | Investigation I, Accident history installation counts |
| 1993 Leveson and Turner investigation | Supported | Investigation I, publication header |
| Greater software safety responsibility than predecessors | Supported | Investigation I, Genesis hardware-comparison paragraphs |
| Rapid editing leaves inconsistent state | Supported for the Tyler mechanism; retain scope caveat | [Investigation II](https://web.mit.edu/6.033/2004/wwwdocs/papers/Therac_2.html), The software problem; [III](https://web.mit.edu/6.033/2004/wwwdocs/papers/Therac_3.html), opening |
| Unclear operator feedback | Supported | [Operator interface](https://web.mit.edu/6.033/2004/wwwdocs/papers/Side_bar_Y.html), error-message discussion |
| Patient pain and fragmented incident knowledge | Supported, attributed historical account | Investigation I, Kennestone; II, Yakima and Tyler |
| Testing failed to reproduce the fault before return to service | Supported for the first Tyler event | Investigation II, User and manufacturer response after March 1986 |
| 1986 regulator and hospital coordination | Supported as a broad summary | Investigation III, Government and user response; [timeline](https://web.mit.edu/6.033/2004/wwwdocs/papers/Side_bar_2.html) |
| All safety-critical systems produce advance warning signals | Overgeneralized; narrow to these incidents | Investigation I–III support this history, not the universal wording |
| Reliability is only part of system safety | Interpretive synthesis; retain clear analysis framing | Investigation I, system-accident framing; II, The software problem |
| Closing sentence about one rare software state | Narrow to multiple faults | Investigation III, Yakima 1987 closing discussion |
| “Not inherently reckless” and “mattered more” | Editorial judgments, not measured findings; human editor must accept or revise | No quantitative ranking established by this pass |
| 2017 retrospective | Landing-page scope only; full article not inspected here | [IEEE landing page](https://publications.computer.org/computer-magazine/2017/11/17/therac-25-30-years-later/) |
| Cover photograph | Remains held | Existing media-provenance gate unchanged |

## Proposed correction

The patch makes three narrowly scoped copy edits: distinguish availability from clinical use, restrict the warning-signal sentence to the case, and remove the singular-fault framing. It preserves the historical uncertainty and avoids ranking software against organizational causes as a measured result.

## Checks and release boundary

Each replaced source string occurs exactly once. All other feature blocks are byte-identical. The candidate diff was inspected; no application build or browser run is claimed. This documentation-only proposal does not add an article or an approval.

After a named editor accepts final wording, apply the patch against the then-current source, review the two remaining editorial judgments, record the real approval and correction date, synchronize article metadata, add a material correction record, and run the repository's full editorial/build/render checks. Do not backdate approval or reuse this source review as deployment evidence.
