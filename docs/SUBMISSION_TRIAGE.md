# Submission triage — relaunch minimum viable workflow

Status: internal operating procedure. This document does not authorize publication or expose private submission material in the public repository.

## Intake boundary

The public submission form stores corrections, source leads, rights notes and pitches in private D1 records when its Workers binding is configured. The page also provides the existing editor email alternative. An operator must verify inbox monitoring; it is not established by this implementation. See [Editorial workflow](EDITORIAL_WORKFLOW.md) for local triage commands. Ordinary email is not a secure channel for confidential source material; the public page must continue to say so.

Accepted subject prefixes:

- `Correction:`
- `Source:`
- `Rights:`
- `Pitch:`

## Minimum states

`RECEIVED -> ACKNOWLEDGED -> TRIAGE -> ASSIGNED | CLOSED`

A submission may enter the public GitHub editorial queue only after the work item has been sanitized. Never copy sender email addresses, private contact details, unpublished allegations, confidential files, embargoed documents, or private source material into GitHub.

## Manual relaunch procedure

1. Confirm the form receipt matches a private D1 record, or that an email reached the intended inbox.
2. Classify it as Correction, Source, Rights, Pitch, or Out of Scope.
3. Send a short acknowledgement that receipt does not imply acceptance or publication.
4. For a correction or rights claim, record the relevant public article/record ID and prioritize review.
5. For a source lead or pitch, verify that at least one traceable source or source path is supplied before assigning editorial work.
6. If follow-up is required, keep the private conversation in email; create only a sanitized public-safe issue when useful.
7. Close spam, duplicative, or unverifiable submissions without creating public work items.

## Acknowledgement template

> Thanks — I received your Obscured Records submission. Receipt does not imply acceptance or publication. I’ll review the source links and scope first. Please do not send confidential material by ordinary email. If I need clarification or additional documentation, I’ll reply in this thread.

For corrections or rights notes, add:

> I’ll treat this as a correction/rights review and preserve the current public record while the claim is checked. Any material correction will be logged according to the publication’s corrections policy.

## Dry-run gate before public relaunch

Run one internal test message through the full path:

- delivery to the intended inbox;
- correct subject classification;
- acknowledgement draft;
- sanitized public-safe work item when appropriate;
- closure without exposing sender PII.

Local persistence and triage are exercised by the Workers integration smoke. The public Submit route still requires a controlled production dry run and monitored operator. Automated acknowledgement or assignment is not implemented.
