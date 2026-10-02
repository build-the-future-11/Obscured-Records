# Week 1 Ownership, Deadlines, and Launch Blockers

**Window:** 29 September–5 October 2026  
**Applies to:** Month 1 issue #10 and relaunch gate #4  
**Status:** Operating assignment for the current owner-only relaunch candidate. This document does not lift the public-launch hold.

## Interim authority model

Until additional named operators are explicitly assigned, the publication has one accountable interim operator:

- **Release / incident owner:** Founder (interim)
- **Editorial launch coordinator:** Founder (interim)
- **Public audience/access authority:** Founder only
- **Rollback authority:** Founder only
- **Submission-intake operator:** Founder (interim)
- **Retention/deletion decision owner:** Founder (interim)

These are operational assignments, not evidence that the corresponding launch checks are complete.

No article is considered editorially approved merely because the founder is the launch coordinator. Each launch-selected story still requires a human claim/source/rights review and an explicit review outcome.

## Week 1 control table

| Work item | Accountable owner | Required evidence | Deadline | Current blocker / next action |
|---|---|---|---|---|
| Freeze exact release-candidate SHA | Founder / release owner | SHA + source receipt | **2 Oct** | Wait until current operating/doc PR is merged or explicitly excluded from candidate |
| Clean hosted CI on frozen SHA | Founder / release owner | Workflow run linked to exact SHA | **2 Oct** | Candidate SHA not frozen |
| Public homepage/article/feed/sitemap/robots verification | Founder / release owner | Live smoke receipt against frozen SHA | **3 Oct** | Exact candidate + deployment identity required |
| Submission intake dry-run | Founder / intake operator | Test acknowledgement → triage → closure log with no sensitive source material | **2 Oct** | Need controlled synthetic submission |
| Newsletter storage + unsubscribe verification | Founder / release owner | Signup/storage/unsubscribe receipt; no broadcast | **3 Oct** | Production binding/migration must be verified |
| Backup/restore rehearsal | Founder / incident owner | Provider-supported rehearsal record | **3 Oct** | Operator action required |
| Rollback rehearsal | Founder / incident owner | Exact rollback steps + successful rehearsal evidence | **3 Oct** | Operator action required |
| Uptime/error monitoring check | Founder / incident owner | Named monitor + test alert/health receipt | **2 Oct** | Monitoring ownership not yet evidenced |
| WebP Content-Type recheck | Founder / release owner | Header receipt from hosted asset | **2 Oct** | Must be tested on hosted candidate |
| Physical-device review | Founder / editorial launch coordinator | Device/browser checklist | **4 Oct** | Representative devices must be available |
| Screen-reader review | Founder / editorial launch coordinator | Screen-reader checklist + defects | **4 Oct** | Human accessibility pass required |
| First four flagship review packages | Founder coordinates; human reviewer required | Claim/source/rights checklist + revise/hold/approve outcome | **5 Oct** | Reviewer identity/availability still unassigned |
| Final launch receipt | Founder / release owner | SHA, deploy identity, smoke results, known limits, rollback path, editorial + operational sign-off | **5 Oct earliest** | All P0 evidence above must exist first |

## Editorial review queue

The first four packages already have source-led draft revisions and review memos:

1. Mars Climate Orbiter
2. Challenger
3. Columbia
4. Hyatt Regency

For each package, the assigned human reviewer must record exactly one state:

- **APPROVE** — claims, sources, rights, and framing are acceptable for launch;
- **REVISE** — specific changes are required before approval;
- **HOLD** — evidence, rights, or specialist review is unresolved.

### Mandatory reviewer fields

- reviewer identity;
- review date;
- claims checked;
- primary/official sources checked;
- quotation/date/name verification;
- image/media rights result;
- technical-specialist review needed? yes/no;
- final state: APPROVE / REVISE / HOLD;
- unresolved notes.

If no qualified reviewer is available by 5 October, the affected story remains held. Schedule pressure is not an approval criterion.

## Launch blocker rules

The public-launch hold remains in force if any of the following is true:

- no exact release SHA is frozen;
- live verification is not bound to that SHA;
- intake has not completed a controlled end-to-end dry run;
- newsletter storage/unsubscribe behavior is unverified;
- backup/restore or rollback has not been rehearsed;
- monitoring ownership is undefined;
- severe accessibility defects remain;
- selected stories lack explicit editorial review outcomes;
- media provenance remains unresolved;
- final launch receipt is incomplete.

## Decision boundary

A green CI run, reachable URL, complete editorial calendar, or finished distribution package is **not** enough to expand public access.

The founder may change public audience/access only after the launch receipt contains both:
1. operational/release evidence for the immutable candidate; and
2. editorial sign-off for the stories actually included in the launch set.

## Next action order

1. Merge or explicitly close PR #14.
2. Assign human reviewer(s) for the first four story packages.
3. Run the controlled intake dry-run.
4. Freeze the candidate SHA.
5. Run CI + hosted smoke + header checks against that SHA.
6. Rehearse restore and rollback.
7. Complete physical-device and screen-reader review.
8. Write the launch receipt.
9. Decide GO / HOLD for public expansion.
