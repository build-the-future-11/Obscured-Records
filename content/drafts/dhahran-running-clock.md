---
{
  "slug": "dhahran-running-clock",
  "title": "How Long Had the System Been Running?",
  "dek": "The Dhahran Patriot failure puts elapsed operating time inside the safety case.",
  "author": "Unassigned — AI-assisted editorial draft",
  "createdAt": "2026-09-27",
  "status": "review",
  "section": "Technology",
  "tags": [
    "software",
    "time",
    "defense"
  ],
  "description": "The Dhahran Patriot failure shows why elapsed runtime, numerical precision and the arrival of a software fix belong in the same record.",
  "socialPreview": "The Dhahran Patriot failure shows why elapsed runtime, numerical precision and the arrival of a software fix belong in the same record.",
  "readingTime": "3 min",
  "genre": "Archival analysis — not original reporting",
  "sources": [
    {
      "title": "GAO IMTEC 92 26",
      "url": "https://www.gao.gov/assets/imtec-92-26.pdf",
      "status": "scoped-source-pass-recorded",
      "checkedAt": "2026-10-02",
      "supports": "See reviewSourceNotes for the exact prior source-pass scope and remaining evidence limits. This import performs no new source verification or human approval."
    }
  ],
  "reviewChecklist": [
    "Read technical appendix before including numerical drift calculations.",
    "Do not generalize this failure into an unsupported overall effectiveness estimate.",
    "Assign the real author and obtain named human editorial approval.",
    "Approve final headline and search metadata, visuals and rights, and the reader-facing release."
  ],
  "completedChecks": [],
  "approvedBy": null,
  "approvedAt": null,
  "seoTitle": "Dhahran Patriot Failure and Elapsed Runtime",
  "updatedAt": "2026-10-02",
  "reviewSourceNotes": "[GAO IMTEC 92 26](https://www.gao.gov/assets/imtec-92-26.pdf) was examined on 2 October 2026. Locator and limits: Printed pages 1, 5–6 and the deployment chronology. The essay concerns the Dhahran incident, not overall Patriot effectiveness. No exact error distance is introduced.\n\nThe historical claims above are attributed to the linked record. The institutional and explanatory conclusions are Obscured Records analysis. The record supports the bounded historical account; it does not establish private motives or every proposed counterfactual. No interviews, original field reporting, human approval or visual licence clearance are claimed.\n\n**Completed:** factual dates and numerical claims checked within the stated scope; interpretation distinguished; no invented quotation; no unsupported current-status assertion; copy pass; source links; metadata; visual specification.\n\n**Final human review:** accept or revise the argument and attribution; assign the real author/editor; clear any externally sourced image before use; approve the website release. The current state remains editing until that review occurs.",
  "reviewPage": "https://chatgpt.com/space/page_0129c35c97b081919bf794903c9a833b",
  "relatedDrafts": [
    "mars-climate-orbiter-interface",
    "ariane-reused-assumptions"
  ],
  "history": [
    {
      "from": "draft",
      "to": "review",
      "at": "2026-10-02T12:15:06.058Z",
      "reason": "Imported the saved Space review manuscript; human approval remains pending"
    }
  ]
}
---

The Patriot battery at Dhahran had been running continuously for more than 100 hours when it failed to track an incoming Scud on 25 February 1991. According to the General Accounting Office investigation, the battery did not engage the missile, which struck a barracks and killed 28 American soldiers. GAO linked that failure to an inaccurate timing calculation whose effect grew with continuous operation. [GAO report, printed pages 1 and 9](https://www.gao.gov/assets/imtec-92-26.pdf).

A corrected version of the software reached Dhahran after the attack. The failure had developed inside a calculation, but preventing it also depended on getting a working correction into the battery. A release of new code and its installation on a deployed system were separate events.

## Where the clock met the target

GAO's report describes a clock recorded in tenths of seconds. Converting its integer count into a real-number time value lost precision in the system's limited registers. The effect on the tracking calculation increased with operating duration and target velocity. At Dhahran the battery had run continuously for more than 100 hours. Its predicted search region no longer aligned adequately with the incoming missile. [GAO report, printed pages 1 and 5–6](https://www.gao.gov/assets/imtec-92-26.pdf).

The important distinction is between the stored count and the conversion used to interpret it. A larger count need not be corrupted to produce a worse physical prediction. An approximation applied to that count can become consequential as the operating interval grows. Describing the problem simply as a clock that drifted hides the calculation in which time acquired its error.

A test establishes behavior over the interval examined. Running the same executable for much longer changes an input to its calculations, even when no code has changed.

### Duration is an input

We tend to picture software inputs as things entered through a keyboard or delivered by a sensor. Time in service belongs on that list too. The effect of a small conversion error can become significant when it is applied to a larger elapsed-time count. Testing a short operation and observing success does not establish that the same implementation behaves acceptably after a much longer interval.

Limited numerical representation, rather than a corrupted clock count, was the issue. The conversion's precision had to be adequate across the intended duration of operation.

Engineers and operators can work with different assumptions about duration. Deployment under a longer operating interval requires evidence that the original calculations remain adequate.

### The day a fix arrives

GAO records a software release on 16 February, a message to users on 21 February and the corrected software's arrival in Dhahran on 26 February, the day after the attack. The warning mentioned very long running times without specifying a duration. Those dates distinguish a correction's availability from its arrival at the affected battery; they do not establish that operators received an actionable operating limit. [GAO report, printed page 9](https://www.gao.gov/assets/imtec-92-26.pdf).

A patch has at least two histories. One concerns its design and verification. The other concerns distribution, installation and confirmed use. A release date closes only part of that chain. An organization may possess the corrected code while a particular deployed system still runs the earlier version.

The Dhahran record is therefore useful without converting it into a universal instruction to restart equipment or install updates immediately. Those actions have their own operational risks. The responsible lesson is narrower: maintenance advice, operating limits and software changes must reach the people making time-sensitive decisions in a form they can act on.

At Dhahran, the calculation accumulated error while the battery kept running. The correction existed, but arrived after the attack. Its release date could not tell operators whether their system was protected.
