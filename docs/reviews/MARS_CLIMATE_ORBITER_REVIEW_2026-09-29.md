# Source review — Mars Climate Orbiter / “The Unit Was Part of the Data”
**Date:** 29 September 2026  
**Status:** source review materially advanced; human editorial approval still required.

## Primary sources checked

1. NASA Science, **Mars Climate Orbiter**  
   https://science.nasa.gov/mission/mars-climate-orbiter/

2. NASA Mars Climate Orbiter Mishap Investigation Board, **Phase I Report**, 10 November 1999  
   https://discovery.larc.nasa.gov/pdf_files/MCO_report_2.pdf

## Findings that can be stated directly from the Phase I report

- The board defined the root cause as failure to use metric units in the ground “Small Forces” software file used in trajectory models.
- The software interface specification required Newton-seconds; the delivered data was in pound-force seconds.
- Downstream navigation processing therefore underestimated the effect of the thruster firings by a factor of 4.45.
- The mismatch was in the ground software path; the report states the spacecraft-side computation used metric units.
- The board reported that the trajectory at Mars insertion was approximately 170 km lower than planned; an after-the-fact reconstruction gave an initial periapsis of about 57 km.
- The board listed eight contributing causes, including communication, staffing, training, systems transition and verification/validation shortcomings.
- The report says the Software Interface Specification was not properly used in development/testing and that end-to-end testing of the small-forces ground software against the specification did not appear to have been accomplished.
- The report describes earlier file-format/content problems and says anomalous data indicating underestimated trajectory perturbations became apparent after the files began being used.

## Editorial consequence

The original draft was directionally correct but too compressed. It risked making the unit mismatch sound like the complete explanation. The revised draft distinguishes:

- **root cause as defined by the board**;
- **documented contributing causes**;
- **Obscured Records analysis** about interface contracts and engineering safeguards.

This distinction should remain visible in the final article.

## Wording caution

NASA's current mission page says an investigation found that the spacecraft “burned up in Mars' atmosphere.” The contemporaneous Phase I report was more cautious, stating that the spacecraft either was destroyed in the atmosphere or re-entered heliocentric space after leaving the atmosphere. A human editor should choose one formulation and make the source/time distinction explicit if necessary.

## Remaining review

- [ ] Human editor performs line-by-line claim check against the primary report.
- [ ] Human editor confirms the exact loss wording.
- [ ] Any NASA/JPL visual receives explicit rights/credit review.
- [ ] Final title/dek checked for overstatement.
- [ ] Final copy checked for language that turns general engineering analysis into a NASA finding.
- [ ] Author/reviewer identity assigned before approval.
