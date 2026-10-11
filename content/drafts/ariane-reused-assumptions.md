---
{
  "slug": "ariane-reused-assumptions",
  "title": "The Old Software Flew on a New Rocket",
  "dek": "Ariane 501 makes software reuse a question about the assumptions that travel with the code.",
  "author": "Unassigned — AI-assisted editorial draft",
  "createdAt": "2026-09-27",
  "status": "review",
  "section": "Technology",
  "tags": [
    "space",
    "software",
    "testing"
  ],
  "description": "Ariane 501 shows why successful software needs new evidence when its operating context changes.",
  "socialPreview": "Ariane 501 shows why successful software needs new evidence when its operating context changes.",
  "readingTime": "3 min",
  "genre": "Archival analysis — not original reporting",
  "sources": [
    {
      "title": "ESA, Ariane-5: Learning from Flight 501 and Preparing for 502",
      "url": "https://www.esa.int/esapub/bulletin/bullet89/dalma89.htm",
      "status": "scoped-source-pass-recorded",
      "checkedAt": "2026-10-02",
      "supports": "See reviewSourceNotes for the exact prior source-pass scope and remaining evidence limits. This import performs no new source verification or human approval."
    }
  ],
  "reviewChecklist": [
    "Confirm the conversion and redundancy sequence against the inquiry.",
    "Do not imply that all software reuse is unsafe.",
    "Assign the real author and obtain named human editorial approval.",
    "Approve final headline and search metadata, visuals and rights, and the reader-facing release."
  ],
  "completedChecks": [],
  "approvedBy": null,
  "approvedAt": null,
  "seoTitle": "Ariane 501 and Reused Software Assumptions",
  "updatedAt": "2026-10-02",
  "reviewSourceNotes": "[ESA, Ariane-5: Learning from Flight 501 and Preparing for 502](https://www.esa.int/esapub/bulletin/bullet89/dalma89.htm), especially “Plan of action leading to flight 502” and “Actions Prompted by the Inquiry Board's Findings.” Checked 2 October 2026. Supports the software finding, continued alignment, capacity limit, shutdown, qualification weaknesses and proposed remedies. This is a historical corrective-program account; future flight plans in it are not treated as accomplished outcomes. Removed the earlier specific data-conversion and prior-launcher assertions because this source pass did not inspect a complete readable inquiry report.\n\nThe general arguments about responsibility, evidence and system boundaries are editorial analysis. This package contains no original interviews or independently acquired datasets.",
  "reviewPage": "https://chatgpt.com/space/page_f3086b88e4c481919e0c94b084ef0324",
  "relatedDrafts": [
    "mars-climate-orbiter-interface",
    "dhahran-running-clock"
  ],
  "history": [
    {
      "from": "draft",
      "to": "review",
      "at": "2026-10-02T12:15:06.059Z",
      "reason": "Imported the saved Space review manuscript; human approval remains pending"
    }
  ]
}
---

Software carried over to Ariane Flight 501 operated under conditions it could not handle during the rocket's 1996 launch. ESA's account links the failure to design faults in the inertial reference system and describes an alignment function that continued into flight.

The software had worked in an earlier vehicle. That history did not establish that it could tolerate the new rocket's trajectory. ESA's proposed remedies addressed the changed conditions, including ending alignment after lift-off and testing actual trajectories on the inertial reference electronics.

## What exactly was reused?

Code is only the visible part of a reused system. Assumptions travel with it: expected ranges, sequences of operations, the conditions in which a function is needed and the errors considered impossible or acceptable. Some may be documented. Others may be embedded in choices that once seemed too obvious to explain.

Unchanged code can encounter a changed range or sequence of inputs. Qualification concerns that relationship, rather than the program text alone.

The same reasoning applies to redundancy. Two copies can protect against an isolated hardware failure. They do not necessarily protect against a shared assumption. Independence must be assessed with respect to the failure being considered, not inferred from the fact that two boxes exist.

Redundancy reduces some risks, but a shared assumption can leave both copies vulnerable to the same condition.

## The boundary between ground and flight

ESA's corrective account identifies an alignment function that continued after lift-off, a variable whose representation capacity was exceeded, and processor shutdown following the detected malfunction. It says the interface between ground and flight modes had not been identified adequately. These are connected events, rather than three independent imperfections.

An alignment routine can make sense while a launcher is preparing to leave the ground. Keeping that routine active during flight gives it a different environment in which to operate. The question is therefore not only whether an operation produces the right answer. It is whether that operation should still be running at that point in the mission.

The planned remedies addressed that relationship. ESA described switching off alignment after lift-off and simulating actual trajectories on the inertial reference electronics. Its account also called for embedded software to receive distinct configuration control and more systematic review. A change to one line would have left the larger question of qualification unresolved.

A reuse review needs to identify the conditions covered by previous evidence and the departures introduced by the receiving system. That gives engineers a specific set of assumptions to test.

## The test that belongs to the new vehicle

A reusable component arrives with evidence. The receiving project needs to decide what that evidence covers. Earlier tests may remain relevant, but a different operating range demands its own examination. A record of successful service is not a substitute for identifying the changed conditions.

An interface review, a range analysis or a test using the new trajectory can each answer part of that question. Their value depends on being connected to the actual system, not added as generic reassurance.

Ariane inherited software and the limits within which it had been expected to work. The new mission changed those limits. Previous success was evidence about the earlier vehicle, not a qualification of the new one.
