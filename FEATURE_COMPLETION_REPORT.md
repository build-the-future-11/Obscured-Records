# Membership portal completion — 21 October 2026

The portal now connects the previously missing member and administration controls, adds the remaining bounded participation workflows, and repairs review-state, registration, privacy and transaction defects. See [the current receipt](docs/PORTAL_COMPLETION_2026-10-21.md) and [the updated checklist](MEMBERSHIP_FEATURE_MEGA_CHECKLIST.md#21-october-completion-pass-supersedes-implementation-statuses-above).

The database integration suite runs actual API handlers with isolated SQLite and the pinned D1 driver. Production identity, hosted persistence, real programs, human policies and public release are separate acceptance claims. Newsletter/email sending remains deferred.

The original report below is historical and its implementation/verification gaps are superseded only where the current receipt explicitly records closure.

---

# Membership portal completion report

## Outcome

The new portal is implemented on branch `codex/membership-portal-20261020`. It extends the existing private reading membership into a controlled research-participation workspace for Obscured Records without inventing a subscription, publishing route, opportunity, statistic, credential, or email delivery promise.

The end-to-end slices implemented in source are:

1. An administrator publishes a real opportunity, program, event, resource, or announcement.
2. A signed-in member discovers published work and applies, enrolls, registers, or tracks learning.
3. The member sees their own persisted application/enrollment status and reviewer note.
4. A member creates a research project, becomes its lead, receives join requests, accepts/declines them, and creates milestones.
5. An editorial administrator reviews opportunity and program applications.
6. Members may opt into a non-contact directory, offer mentorship, request an active mentor, make portfolio entries, and participate in discussion posts/comments.

## Delivered implementation

- `app/member/*`: protected, direct routes for all primary workspace areas plus an owner-only admin route.
- `components/member-portal.tsx`: member home, opportunities, projects, programs, mentorship, community, events, learning, directory, profile/privacy and command-center interfaces.
- `app/api/member/portal/route.ts`: authenticated, same-origin, validated server operations; role checks are server-side and the browser cannot self-grant admin or project-lead authority.
- `app/api/member/directory/route.ts`: consent-filtered directory projection that excludes email addresses.
- `db/schema.ts` and `drizzle/0003_brown_runaways.sql`: portal data model with owner-scoped member data and uniqueness constraints for applications, enrolments, registrations, progress, and project memberships.
- `MEMBERSHIP_FEATURE_MEGA_CHECKLIST.md`: 85 concrete member/admin workflow items with exact page/action, workflow, required layers, permissions, acceptance criteria, status, and priority.

### Completion expansion

The portal now additionally has a private inbox (review-decision notifications, read state and expiring invitation responses), project invitations for directory-opted-in members, project responsibility/outcome/evidence records, milestone state updates, member program withdrawal, event-registration cancellation and attendee-only event resources. It also supports mentor accept/decline, private session logs and participant feedback; program sessions/tasks; community reactions and member reports; administrator moderation, lifecycle changes, program scheduling, event-resource publication, role grants and evidence-backed achievement verification. These workflows are represented by the second additive migration `drizzle/0004_hot_silver_surfer.sql` and remain empty until a real authorized user supplies their content.

## Verification evidence

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test` | Passed; 366 tests including the new portal input-contract test |
| `git diff --check` | Passed |
| `npm run build:vercel` | Prebuild completed and regenerated existing private editorial projections; full local Next build output was not available in this constrained host session, so it is not claimed as verified. |
| Browser preview / authenticated E2E | BLOCKED: local preview listener was not available, and no D1 binding or ChatGPT-authenticated test identity is configured in this checkout. No screenshot or successful live application flow is claimed. |

## Security and integrity controls included

- Portal writes require an authenticated member, JSON payload, same-origin request, bounded request body and server validation.
- The only administrator is determined by the server’s existing editorial-owner rule; no API accepts a client-provided role.
- Project-lead actions check project ownership server-side.
- Member data uses current authenticated identity for writes; supplied author/applicant identity is never trusted.
- Directory search returns only opt-in profiles and never email addresses.
- Opportunities, programs, events, resources and announcements use a published-only member query; there are no seeded or placeholder listings.
- Learning completion is explicitly a personal progress record, not a certificate or verified achievement.

## Required before declaring a live release

1. Apply `drizzle/0003_brown_runaways.sql` and `drizzle/0004_hot_silver_surfer.sql` to the real D1 database through the established migration process.
2. Run authenticated two-account E2E verification: member application, admin review, project join/lead review, directory privacy toggle, and cross-account denial cases.
3. Configure a permitted local or preview D1 environment before producing screenshot evidence.
4. Decide and document moderation, messaging, notification, achievement, cohort-facilitation and data-retention policies before enabling the blocked checklist features.

The checklist distinguishes all of these remaining items as `NOT STARTED` or `BLOCKED`; they are not represented as delivered functionality.
