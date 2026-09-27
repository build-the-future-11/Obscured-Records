# Launch operations — 27 September 2026

## Release identity and audience

The authoritative GitHub repository is `build-the-future-11/Obscured-Records`. All 194 original exported files matched merged main revision `3cc4867ce9bd7d41198be5f987981d7f72d56e7e` byte for byte before the local ASTRA changes. Git history was restored without overwriting working files. The closure branch is `codex/launch-closure-20260927`.

The existing Sites project is `appgprj_6aa79b45dd308191b3b887c293729f00`, at `https://obscured-records.ryangomez-hs.chatgpt.site`. It uses Workers/D1 and is owner-only. Preserve that audience while editorial approval remains open. The prior saved version is `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_d99348a9a5c48191bbbdda10c5525753`, source `ed608961e06bd7e6af1871ece0662ff35a359613`, deployment `appgdep_6aae6ed1b4688191902eebd3d978048e`.

The older Vercel address responds, but serves a different SPA and has no `/api/revision`. It is not the release target for this branch. No domain transfer or Vercel project deletion is part of this work.

## Database preparation and rollback

Before this release, the live Sites database exposed only `newsletter_subscribers`, with columns `id`, `email`, `status`, `consented_at`, `source`. A complete, untruncated read on 27 September found zero rows and no further page. The retained local receipt is `verification/launch-2026-09-27/database-before.json`. No existing subscriber data needed exporting. This observation is a pre-deployment empty-data snapshot, not a general backup/restore certification.

Migration `0001_bent_roland_deschain.sql` adds `editorial_submissions` and `intake_limits`. It does not drop, rename or rewrite the existing subscriber table. Sites receives the existing Drizzle migration journal with the build archive. The deployed database now exposes all three expected tables. Private reads confirmed one controlled pending newsletter signup and one controlled received submission; the evidence has no truncation or further page. The records use example.invalid addresses and remain retained as operational tests.

For application rollback, redeploy the prior saved version above through Sites and verify deployment status. Preserve new additive tables and any submitted records; do not drop tables as part of rollback. A database incident requires a provider-supported snapshot/export and owner-approved restoration, not replaying migration SQL blindly. A practical restore exercise and accepted incident owner remain open.

## Newsletter scope

Pending signup capture is the working release scope unless the owner chooses to add email delivery. No sending provider is configured. All new signups remain `pending_confirmation`; repeated requests preserve existing `active`, `unsubscribed`, `suppressed`, `bounced` and `complained` statuses. Capture is not verified email ownership or permission to send. Human-requested deletion remains through the contact shown on the privacy page.

## Submission operator dry run

An accountable human operator must accept this role before public intake launch. Do not infer acceptance from the website's author name or account ownership.

1. Submit a clearly labelled controlled source lead through the deployed form using an address controlled by the operator. Use no confidential material.
2. Confirm the reference appears in private storage as `received` and that public GET requests cannot retrieve submissions.
3. Acknowledge the controlled submission, record triage and disposition, and close it through an authorized private database interface. The repository CLI is local-only.
4. Record the reference, timestamps and states in private operational records. Keep the public receipt free of email addresses and submission text.
5. Review closed submissions for deletion after 90 days unless an active matter justifies retention. Record the closure date separately until the schema supports it; signup time is not closure time.

The automated persistence checks do not constitute human acknowledgement or inbox monitoring.

## Monitoring and incident response

Use the provider deployment log and worker logs for failures. Run `scripts/relaunch-smoke.mjs` against an approved public origin and exact deployed SHA when public access is enabled. The existing owner-only site must continue rejecting anonymous access; do not weaken sharing to make a public smoke test pass. A recurring monitor creation attempt did not return a completion receipt. Its activation is unconfirmed; inspect existing app automations before retrying to avoid duplicates. No notification destination is invented. Human acceptance of monitoring and incident ownership remains open.

## Evidence and open gates

Retain provider IDs, source SHA, actual checks and failures in `verification/launch-2026-09-27/`. Public launch still needs accepted editorial/operator ownership, claim-level review, unresolved image provenance, real-device/assistive-technology review and a practical rollback/restore exercise. Audio, analytics, sponsorship and email sending are deferred.

## Verified deployed candidate

Source: `bfd7158f7d19aa5094c90dba3d7c2c9e72f24379`. Saved version: `appgprj_6aa79b45dd308191b3b887c293729f00~appgver_54dedfecd954819193076a0bc61de909`. Successful deployment: `appgdep_6ab8c1ed0100819194238d3771c61311`, environment revision 3. The live revision endpoint matched; 58 private hosted checks passed and anonymous access returned 401.

The initial candidate `3aa1e5479466cbf40d3e6f006559ab296c76e985` deployed but failed live section/article availability. Its failure receipts remain preserved. The correction evaluates publication dates during requests so Worker initialization at epoch zero cannot permanently empty the archive. The later successful live checks establish recovery.

The public GitHub push was automatically rejected because it would expose unpublished drafts and internal review material. No public push, new public PR or hosted GitHub CI success is claimed. Private Sites source publication and owner-only deployment succeeded without changing audience.
