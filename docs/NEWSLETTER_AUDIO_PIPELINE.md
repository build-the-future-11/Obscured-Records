# Newsletter and audio pipeline

This document defines pre-publication controls only. It does not authorize sends, releases, uploads, or publication.

## Newsletter issue packet

Each issue should have one folder or tracker record containing:

- issue ID;
- source article / record ID;
- editor;
- writer;
- final subject line;
- preview text;
- final body;
- source-link checklist;
- test-render screenshot or receipt;
- send provider / list segment;
- approval state;
- final send receipt;
- archive URL;
- correction status.

### Gates

1. **Issue candidate** — source web record exists and is editorially approved.
2. **Brief draft** — no new factual claims beyond the source record unless independently sourced.
3. **Fact check** — every link opens and every central claim maps to the source packet.
4. **Copy edit** — subject/body are final enough for test rendering.
5. **Test render** — desktop/mobile, dark/light where relevant, links, unsubscribe path, sender identity.
6. **Send approval** — named human approval recorded.
7. **Send** — performed manually through the approved provider.
8. **Archive** — save provider receipt and public archive link if one exists.

If the provider fails or the list cannot be verified, stop at `SEND_APPROVAL`; do not infer delivery from a successful website subscription write.

## Subscriber handling

Current website signup stores a normalized email, subscription status, consent time, and source in D1. That is a list-membership write, not an email-delivery system.

Required before the first real newsletter send:

- confirm the production D1 migration has been applied and the website uses that binding;
- confirm the sending provider and authenticated sending domain;
- document import/sync from D1 to the provider, or replace it with one canonical list system;
- establish unsubscribe handling and suppression behavior;
- ensure resubscription does not accidentally bypass suppression policy;
- test one internal address end to end;
- keep a durable send receipt and correction path.

## Audio episode packet

Each audio release should contain:

- episode ID and linked record ID;
- approved source article revision;
- script;
- claim ledger delta (only claims that differ from the article wording);
- narrator / recording owner;
- audio rights and music/SFX rights;
- edit master path/hash;
- transcript;
- transcript QA owner;
- loudness/export settings;
- final approval;
- platform upload receipts;
- canonical web URL;
- correction/replacement notes.

### Gates

`RECORD_APPROVED -> SCRIPT_LOCK -> FACT_CHECK -> RIGHTS_CHECK -> RECORDING -> EDIT -> TRANSCRIPT_QA -> RELEASE_APPROVAL -> RELEASED`

No episode may move to `RELEASE_APPROVAL` without a transcript and source/article reference. If a correction changes meaning, replace or annotate the audio release rather than silently editing the text archive only.

## Recommended first relaunch test

Use one already-approved record for a private dry run:

- produce a 4–6 minute script;
- create a source-linked transcript;
- complete fact and rights checks;
- export the audio file locally;
- stop before upload/release.

The goal is to prove the handoff and QA process, not to claim that the audio channel is launched.
