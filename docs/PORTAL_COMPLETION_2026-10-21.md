# Portal completion — 21 October 2026

The membership portal is deployed as **owner-private version 28** at https://obscured-records.ryangomez-hs.chatgpt.site. Public launch remains HOLD. The provider completed the full build and deployment; real multi-account browser acceptance remains open.

## Repairs and completion

- Repeat applications, enrollments, project joins and mentor requests preserve existing review decisions. Project creation pairs the project and lead membership in one database batch.
- Event registration atomically allocates capacity, stores a waitlist, promotes the earliest waiting member on cancellation and supports registration after cancellation. Past events and expired enrollment windows reject new participation.
- Team milestones, evidence and messages exclude unrelated accounts. Mentor feedback is author-only; session notes remain visible to matched participants. Attendee-only materials and program tasks require participation.
- Missing controls now cover directory invitations, milestone updates, cohort schedules/materials/tasks, event resources, lifecycle changes, restoration/moderation reasons, attendance verification and role revocation.
- Members can export their own participation records, opt into inbox event reminders, confirm their own contribution credits and complete ordered learning pathways. Scoped moderator and facilitator capabilities are checked server-side.
- Membership navigation uses real URLs; loading failures expose retry; expired invitation/application controls reflect the server snapshot time. Full keyboard focus styling and narrow-screen layout constraints are retained.
- Privacy copy describes actual visibility and retention behavior. No email delivery, real cohort, factual approval, certificate or public release is invented.

## Reproduction

- `node --experimental-strip-types --test --test-concurrency=1 scripts/*.test.mjs`
- `node --experimental-strip-types --test scripts/portal-persistence.test.mjs`
- `npm run check:state`, `npm run check:editorial`, `npm run typecheck`, `npm run lint`
- Production build uses the existing prebuild TypeScript check, then the Sites Workers build. Hosted migrations are applied by Sites from the append-only Drizzle journal.

Local resource-bounded runs, including failures, are retained under `.cache/portal-completion/`. An initial full typecheck at 256 MiB and lint at 128 MiB exhausted their heaps. A focused typecheck including the Cloudflare environment declarations and focused lint at 256 MiB passed. An initial persistence test exposed an invalid raw operation inside a Drizzle batch; the repaired path passes. No production/browser certification is inferred from those checks.

## Remaining external acceptance

Owner-private access is preserved. Named editorial approval, media rights, operational/retention ownership, provider restore rehearsal, physical-device/screen-reader review, field performance and public audience authorization remain OPEN in PROJECT_STATE.json. Real multi-account ChatGPT/browser verification requires actual permitted accounts. In-app reminders are visit-time only; scheduled delivery and email are deferred. Program/event invitations are outside the implemented project-invitation scope. A real cohort still needs an approved curriculum and facilitator.


## Final local checks

- 382/382 tests passed, including 16 new database workflow scenarios.
- Focused TypeScript and ESLint checks passed for the portal API, export, schema and interface files. The full local typecheck/build remains resource-limited; a provider build must close that gate.
- Canonical project-state check, editorial integrity and whitespace checks passed. Reader count is 31 and private draft count is 3,248, with zero recorded human approvals.
- Private source `58ecb8416a55bfeceb6c78d2566b06ae5f5e7069` contains 3,782 byte-matching local files and three retained remote-only review images. The bounded credential/private-key pattern scan found no matches. Local evidence caches and verification directories were excluded.
- The source helper confirmed the private push before local packaging failed for missing `dist/server/index.js`; the supported hosted build fallback was requested. Environment revision 16 sets COMMIT_SHA to the exact private source.

See [machine-readable verification](PORTAL_VALIDATION_2026-10-21.json). Later verification receipts are local documentation; they do not change the deployed application source.


## Private deployment

- Version **28**: `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_d92bd7c5ac4081918091a893a5c70699`.
- Deployment `appgdep_6ad8643951288191ac43777819b6b9c8` succeeded on 21 October 2026 at **12:38:48 IST** (07:08:48 UTC).
- Source `58ecb8416a55bfeceb6c78d2566b06ae5f5e7069`; environment revision **16**, COMMIT_SHA matches.
- The provider completed the full build, including the prebuild TypeScript gate and pending additive migrations. This supersedes the local full-build limitation for the Cloudflare production target; it is not a Vercel or browser certification.
- Access refreshed after deployment: one permitted owner, no groups, zero external visitors. The app's browser handoff was queued successfully.
- [Provider receipt](PORTAL_DEPLOYMENT_2026-10-21.json). No public GitHub push or audience change was performed.


## Live verification

**104/104 read-only production checks passed** against the exact source revision. Coverage includes reader routes, feed/catalogue boundaries, original media bytes and MIME, anonymous denial, all member pages requiring sign-in, and unauthenticated portal/directory/export APIs returning 401 with private/no-store caching. [Runtime receipt](PORTAL_RUNTIME_2026-10-21.json).

The private access token grants Site access but does not impersonate a signed-in member. These checks therefore do not establish successful hosted member writes or two-account UI behavior. Local database tests cover those authorization and persistence rules through the real handlers; real identity-provider and browser acceptance remains open. No synthetic member data was written to production.
