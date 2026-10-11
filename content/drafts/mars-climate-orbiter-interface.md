---
{
  "slug": "mars-climate-orbiter-interface",
  "title": "The Unit Was Part of the Data",
  "dek": "Mars Climate Orbiter was lost after an interface delivered pound-force seconds where navigation software expected Newton-seconds. The deeper failure was that the mismatch survived the systems built to catch it.",
  "author": "Unassigned — AI-assisted editorial draft",
  "createdAt": "2026-09-27",
  "status": "review",
  "section": "Technology",
  "tags": [
    "space",
    "software",
    "measurement"
  ],
  "description": "A source-led reconstruction of the Mars Climate Orbiter unit mismatch and the verification, communication and interface failures documented by NASA's mishap board.",
  "socialPreview": "A source-led reconstruction of the Mars Climate Orbiter unit mismatch and the verification, communication and interface failures documented by NASA's mishap board.",
  "readingTime": "4 min",
  "genre": "Archival analysis — not original reporting",
  "sources": [
    {
      "title": "NASA MCO Mishap Investigation Board Phase I report",
      "url": "https://discovery.larc.nasa.gov/pdf_files/MCO_report_2.pdf",
      "status": "source-pass-complete",
      "checkedAt": "2026-10-02",
      "supports": "Scoped agency findings identified in the linked review Page; human line-by-line approval remains open"
    }
  ],
  "reviewChecklist": [
    "Compare interface details with the Phase I mishap report.",
    "Keep this analysis distinct from a complete causal investigation.",
    "Human editor performs line-by-line claim check against the primary report.",
    "Assign the real author and obtain named human editorial approval.",
    "Approve final headline and search metadata, visuals and rights, and the reader-facing release."
  ],
  "completedChecks": [],
  "approvedBy": null,
  "approvedAt": null,
  "updatedAt": "2026-10-02",
  "reviewPage": "https://chatgpt.com/space/page_31b5acb2fc688191b59eacb73b2dd772",
  "relatedDrafts": [
    "challenger-warning-and-decision",
    "columbia-evidence-not-requested"
  ],
  "visual": {
    "path": "content/review-assets/mars-climate-orbiter-interface.svg",
    "alt": "The interface required Newton-seconds. Ground software supplied pound-force seconds, which navigation processing treated as Newton-seconds.",
    "caption": "Original Obscured Records schematic. NASA Phase I mishap report, pp. 16–21. Not a trajectory simulation.",
    "credit": "Obscured Records original schematic",
    "sourceUrl": "https://discovery.larc.nasa.gov/pdf_files/MCO_report_2.pdf",
    "rights": "Original diagram; no third-party photograph or logo reproduced"
  },
  "history": [
    {
      "from": "draft",
      "to": "review",
      "at": "2026-10-02T09:27:20.449Z",
      "reason": "Transferred source-reviewed manuscript and original diagram from the Space; human approval remains pending"
    }
  ],
  "seoTitle": "Mars Climate Orbiter and the Unit Mismatch",
  "reviewSourceNotes": "# Source review — Mars Climate Orbiter / “The Unit Was Part of the Data”\n\n**Date:** 29 September 2026  \n**Status:** source review materially advanced; human editorial approval still required.\n\n## Primary sources checked\n\n1. NASA Science, **Mars Climate Orbiter**  \n   https://science.nasa.gov/mission/mars-climate-orbiter/\n\n2. NASA Mars Climate Orbiter Mishap Investigation Board, **Phase I Report**, 10 November 1999  \n   https://discovery.larc.nasa.gov/pdf_files/MCO_report_2.pdf\n\n## Findings that can be stated directly from the Phase I report\n\n- The board defined the root cause as failure to use metric units in the ground “Small Forces” software file used in trajectory models.\n\n- The software interface specification required Newton-seconds; the delivered data was in pound-force seconds.\n\n- Downstream navigation processing therefore underestimated the effect of the thruster firings by a factor of 4.45.\n\n- The mismatch was in the ground software path; the report states the spacecraft-side computation used metric units.\n\n- The board reported that the trajectory at Mars insertion was approximately 170 km lower than planned; an after-the-fact reconstruction gave an initial periapsis of about 57 km.\n\n- The board listed eight contributing causes, including communication, staffing, training, systems transition and verification/validation shortcomings.\n\n- The report says the Software Interface Specification was not properly used in development/testing and that end-to-end testing of the small-forces ground software against the specification did not appear to have been accomplished.\n\n- The report describes earlier file-format/content problems and says anomalous data indicating underestimated trajectory perturbations became apparent after the files began being used.\n\n## Editorial consequence\n\nThe original draft was directionally correct but too compressed. It risked making the unit mismatch sound like the complete explanation. The revised draft distinguishes:\n\n- **root cause as defined by the board**;\n\n- **documented contributing causes**;\n\n- **Obscured Records analysis** about interface contracts and engineering safeguards.\n\nThis distinction should remain visible in the final article.\n\n## Wording caution\n\nNASA's current mission page says an investigation found that the spacecraft “burned up in Mars' atmosphere.” The contemporaneous Phase I report was more cautious, stating that the spacecraft either was destroyed in the atmosphere or re-entered heliocentric space after leaving the atmosphere. A human editor should choose one formulation and make the source/time distinction explicit if necessary.\n\n## Remaining review\n\n- [ ] Human editor performs line-by-line claim check against the primary report.\n\n- [ ] Human editor confirms the exact loss wording.\n\n- [ ] Any NASA/JPL visual receives explicit rights/credit review.\n\n- [ ] Final title/dek checked for overstatement.\n\n- [ ] Final copy checked for language that turns general engineering analysis into a NASA finding.\n\n- [ ] Author/reviewer identity assigned before approval.\n\n## 2 October verification\n\nPrimary source reopened today; core premise checked against the original agency record. The previously recorded source review is retained above. Full chronology, every secondary detail, named reviewer and visual credit are still approval gates. No fabricated interview or original-reporting claim.\n\n**Visual specification:** 1200×675 SVG, cream background, dark labels, two parallel paths. Top: “Required: N·s” → “Navigation model”. Bottom: “Delivered: lbf·s” → “Read as N·s”. An annotation marks “Conversion factor ≈4.45”, never “4.45× more damage”. Accessible text: “Ground software supplied pound-force seconds where navigation software expected Newton-seconds.” Credit NASA Phase I pp. 15–18; diagram is Obscured Records’ schematic, not a spacecraft image."
}
---

NASA lost contact with Mars Climate Orbiter on 23 September 1999. Ground software had supplied thruster data in pound-force seconds to navigation software expecting Newton-seconds. The mismatch understated the modeled effect of the firings by a factor of 4.45.

NASA's [Phase I mishap report](https://discovery.larc.nasa.gov/pdf_files/MCO_report_2.pdf) traced the loss to the unit mismatch and to the failures in testing, communication and operations that let it persist. Investigators could not settle the spacecraft's final fate. It may have burned up in the atmosphere or entered heliocentric space; contact was never recovered.

## What the interface was supposed to mean

During the cruise to Mars, the spacecraft periodically fired thrusters to unload angular momentum from its reaction wheels. Ground software called SM_FORCES processed information about those events and wrote the results into an Angular Momentum Desaturation, or AMD, file used by the navigation team.

The interface specification required the impulse values in that file to be expressed in Newton-seconds.

They were delivered in pound-force seconds.

The navigation software then treated those values as if they already satisfied the metric specification. NASA's mishap board reported that the effect of the thruster firings was therefore underestimated by a factor of 4.45. The board identified this failure to use metric units in the ground software file as the mission's root cause.

The interface specification was explicit. The implementation produced different units, and the receiving software accepted them. The conversion error became a mission failure because the checks between those steps did not expose it.

## The mismatch survived for months

The small-forces files had earlier format and spacecraft-attitude problems. For the first four months of cruise, the navigation team did not use them in orbit determination. When correctly formatted files began to be used, the report says anomalous data indicating underestimated trajectory perturbations became apparent within about a week.

The anomaly still did not lead to the unit mismatch being identified before Mars arrival.

By the time the loss was reconstructed, the board estimated that the trajectory at insertion was roughly 170 kilometers lower than planned. A later navigation reconstruction produced a periapsis of about 57 kilometers, a level judged too low for the spacecraft to survive.

Navigation staff had observed anomalous behavior before arrival. The organization failed to turn those observations into a diagnosis and correction in time.

## NASA's report was about more than units

The mishap board listed eight contributing causes in addition to the root cause. They included undetected mismodeling of spacecraft velocity changes, an operations navigation team that was not sufficiently familiar with the spacecraft, a trajectory-correction maneuver that was not performed, weaknesses in the transition from development to operations, inadequate communication, insufficient navigation staffing, inadequate training, and verification-and-validation shortcomings in the ground software.

The verification section is especially direct. The board wrote that the Software Interface Specification existed but was not properly used in development and testing. It also found that end-to-end testing of the small-forces ground software against the specification did not appear to have been completed, and that interface-control verification was incomplete or insufficiently rigorous.

The conversion factor explains the numerical error. The board's account of development, testing and navigation explains why that error survived.

## An interface is an engineering object

A software interface can look administrative: a field name, a file format, a unit written in a specification. But for a system whose components are built and operated by different teams, that document carries physical meaning.

A value labelled as impulse is not complete simply because it contains a number. The receiving side needs to know what physical quantity the number represents and in what units. If that meaning is implicit, a syntactically valid file can still carry semantically wrong data.

Several engineering practices can make such disagreements harder to hide. Units can be represented in types rather than comments. Tests can inject known values and compare outputs with independent calculations. Interface checks can trace one measurement from its source through every transformation to its final consumer. Independent validation can ask whether the integrated system behaves according to the contract rather than whether each component appears internally consistent.

Those are general engineering lessons, not claims that one particular safeguard would certainly have saved Mars Climate Orbiter. Retrospective fixes are easy to propose once the failure is known. The stronger question is whether a safeguard would have exposed the actual discrepancy under the conditions that existed before the loss.

## Why the story still matters

The report leaves a practical test for any organization working across technical boundaries: identify the assumptions exchanged between teams, assign responsibility for checking them and specify how an observed discrepancy reaches someone able to act.

The file arrived in a usable format. The numbers carried the wrong meaning. Between those two facts lay the failure of a mission.
