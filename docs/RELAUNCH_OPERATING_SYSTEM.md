# Obscured Records relaunch operating system

Status: internal operating document. This file does not authorize publication, deployment, newsletter sends, sponsor outreach, or production-data changes.

## 1. Source of truth

The public site currently renders the repository-backed article registry in `lib/articles.ts`, while matching archival MDX records live under `content/articles/`. Until those are consolidated, both surfaces must stay in lockstep. `npm run check:editorial` fails when article slugs, record IDs, dates, or required source metadata drift.

Publication state is an editorial decision, not an inference from a file existing in the repository.

## 2. Editorial queue

Use these states only:

`SUBMITTED -> TRIAGE -> ASSIGNED -> REPORTING -> DRAFT -> FACT_CHECK -> COPY_EDIT -> APPROVED -> SCHEDULED -> PUBLISHED -> CORRECTED/ARCHIVED`

Every item must have:

- working title / record ID;
- accountable editor;
- contributor or reporter;
- current state;
- primary-source anchor;
- next action and due date;
- blocker, if any;
- public-claim boundary;
- final evidence location.

Nothing may move to `APPROVED` without a source check, rights/credit check for media, and explicit handling of uncertainty. Nothing may move to `PUBLISHED` because a build is green.

## 3. Submission intake

Incoming material should be triaged within the editorial system rather than copied verbatim into public GitHub issues.

### Intake classes

1. **Correction** — a claim in an existing record may be wrong or incomplete.
2. **Primary-source lead** — document, archive, filing, report, image, transcript, dataset, or recording.
3. **Story pitch** — proposed record with a documentary trail and a defined missing context.
4. **Contributor pitch** — a person proposing to report/write/edit a specific record.
5. **Rights / attribution** — image, audio, quotation, or ownership concern.

### Triage minimum

Record internally:

- received date;
- intake class;
- sender/contact reference kept outside public repo if personal;
- record/story affected;
- source URLs or file references;
- sensitivity / privacy flag;
- next owner;
- disposition: `REVIEW`, `REQUEST_MORE`, `DECLINE`, `CORRECTION_REVIEW`, or `ACCEPT_TO_QUEUE`.

Do not commit confidential documents, personal contact details, embargoed material, or unpublished allegations to this public repository.

## 4. Contributor workflow

A contributor starts with one bounded artifact, not a standing title.

1. Editor assigns one record and a written scope.
2. Contributor returns a source packet and claim ledger before prose is treated as final.
3. Fact checker independently verifies central factual claims.
4. Copy edit occurs only after the evidence pass.
5. Contributor receives a final pre-publication factual review for their own attributed statements where appropriate.
6. Editor makes the publication decision.

Required handoff is defined in `templates/EDITORIAL_HANDOFF.md`.

## 5. Newsletter pipeline

Newsletter publication is separate from web publication.

`CANDIDATE_RECORD -> ISSUE_BRIEF -> SOURCE_CHECK -> COPY_EDIT -> LINK_CHECK -> TEST_RENDER -> SEND_APPROVAL -> SENT -> ARCHIVED`

Rules:

- website publication does not automatically authorize newsletter send;
- subscriber count is not a readership claim;
- signup success means the subscription write succeeded, not that an email was delivered;
- every issue keeps a canonical web record, source links, final subject line, final body, send timestamp, sending provider receipt, and correction note if needed;
- no send happens from unattended repository automation.

See `docs/NEWSLETTER_AUDIO_PIPELINE.md`.

## 6. Audio pipeline

Audio is an adaptation of an approved record, never a looser factual surface.

`APPROVED_RECORD -> SCRIPT -> FACT_CHECK -> RIGHTS_CHECK -> RECORD -> EDIT -> TRANSCRIPT_QA -> RELEASE_APPROVAL -> PUBLISHED`

The audio script may simplify wording but must not introduce new factual claims without returning them to the source/claim ledger.

## 7. Metadata and SEO release contract

For every public article, verify:

- stable canonical URL;
- unique title, slug, and record ID;
- non-empty description/excerpt;
- publication and modified dates tied to the article record rather than a release-wide placeholder;
- author URL;
- image credit when an image is used;
- Open Graph/Twitter metadata;
- schema.org article metadata;
- RSS inclusion only when the record is intentionally public;
- sitemap inclusion only when the record is intentionally public;
- robots behavior matches launch intent.

Until publication states become first-class data, editorial review must treat the repository article registry as public-by-default and keep non-public records out of it.

## 8. Analytics contract

Analytics must answer editorial/product questions without creating a surveillance layer or inflated readership claims.

Allowed initial metrics:

- page view by normalized route class;
- article view by public record ID/slug;
- newsletter form attempt / success / failure;
- outbound source-link click;
- search performed (query text should not be retained by default);
- correction-link click;
- share action type;
- audio start / 25 / 50 / 75 / complete when audio exists.

Do not collect article-reader email, free-form search queries, submission content, IP-derived identity, precise location, or cross-site advertising identifiers for editorial analytics.

The event taxonomy in `ops/analytics_contract.json` is a contract, not evidence that instrumentation is live. Analytics claims remain `UNVERIFIED` until a deployed exact-revision event path and data receipt exist.

## 9. Sponsor inventory and editorial independence

A sponsor/prospect record must distinguish contact status from commercial commitment.

Allowed states:

`PROSPECT -> QUALIFIED -> DISCUSSION -> TERMS_REVIEW -> CONFIRMED -> ACTIVE -> COMPLETE/DECLINED`

No logo, sponsor name, quoted amount, deliverable, exclusivity, audience claim, or partnership language is public until the underlying commitment is confirmed and approved.

Editorial requirements:

- sponsor cannot preview or veto unrelated editorial conclusions;
- sponsored/native material must be labeled;
- conflicts involving a sponsor and a covered subject must be disclosed or the relationship declined;
- audience/reach statements must use verified measurement windows and definitions.

Use `ops/sponsor_inventory.json` as the internal schema/template. The empty inventory is intentional until real approved records are entered.

## 10. Launch gate

A relaunch is ready only when all P0 items below are green on the exact release candidate:

- canonical CI passes;
- editorial integrity check passes;
- all launch articles have reviewed source links and credits;
- RSS and sitemap reflect only intended public content;
- newsletter signup succeeds against the intended production storage path and fails honestly when storage is unavailable;
- no claim of a newsletter send exists without a send receipt;
- submission page has a monitored intake route and a named triage owner;
- privacy/corrections/standards pages match actual operations;
- mobile/keyboard navigation receives a final smoke pass;
- deployment is bound to one immutable source revision;
- public smoke test covers home, article, search, newsletter, submit, corrections, standards, RSS, sitemap, robots;
- sponsor inventory contains no unapproved public claims;
- analytics claims remain off unless the deployed event path is verified.

See `ops/relaunch_queue.json` for the current operating queue.
