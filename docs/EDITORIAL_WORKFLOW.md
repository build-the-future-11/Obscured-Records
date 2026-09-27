# Editorial workflow — 27 September 2026

This publication uses reviewed files for copy and private D1 records for intake. Filesystem/repository access is the editor boundary. The optional ChatGPT auth helper is not used to authorize publishing; trusted-proxy identity would not establish editorial role on its own.

## Draft review

```sh
npm run editorial -- list
npm run editorial -- check
npm run editorial -- transition triangle-exits-and-power review
```

Supported transitions: `draft -> review | held`; `review -> draft | approved | held`; `held -> draft`; `approved -> review | held`. The command records transition history. It refuses `published`: approving copy and exposing it to readers are separate actions.

Each draft carries slug, title, dek, author, creation date, status, section, tags, description, social preview, reading time, genre, sources and specific review tasks. All current drafts are explicitly AI-assisted archival analysis. Do not silently attribute them to Ryan or imply interviews/original reporting.

Before approval, read every source, map each factual claim to the specific passage, check quotations and names/dates, and resolve each `reviewChecklist` item. Add the exact completed items to `completedChecks`, change each source to `verified` only after actual review, and record a real `approvedBy` and valid `approvedAt`. The validator checks these fields; it cannot establish whether an editor told the truth. Word counts do not establish quality or historical accuracy.

## Deliberate publication

1. Record real editorial approval and rights clearance. Review inherited claims separately from new analysis.
2. Integrate approved copy into `lib/articles.ts` and, when appropriate, `lib/features.ts`. Keep its companion `content/articles/<slug>.mdx` metadata synchronized. An expansion replaces a brief at its existing URL; it does not create a second subject.
3. Use a real author identity with permission, canonical slug, current publication/update dates and explicit `status: "published"`. Never backdate a newly published draft to the original corpus date. Preserve the first-publication date when expanding an existing record.
4. Update `lib/corrections.ts` when changing a material claim. Source URL repairs alone are recorded in the link-repair receipt; they do not certify every claim at the new source.
5. Run the checks in REPRODUCE.md and inspect article, archive, search, RSS and sitemap output. Rebuild before release: publication filtering occurs when the registry module is evaluated and static output can retain old content until rebuilt/deployed.
6. Retain review evidence with the source revision. Have an authorized operator release the reviewed build and perform exact-revision live verification.

A published registry record with an invalid/future date or any other status is excluded. Homepage curated slots also filter through that public registry. The empty archive has a readable holding page. A draft that shares a public brief's slug does not replace or leak through that public brief.

## Private submissions

After a local Workers build/migration, `node scripts/intake-admin.mjs list` lists the newest 50 records. `read <UUID>` displays private content. `transition <UUID> received triage` advances an allowed state with a current-state condition. An empty result means no row transitioned. Never paste private output into public issues or this content tree.

This CLI always targets `.wrangler/state` locally. The integration smoke uses a different, isolated directory and cannot be mistaken for live inbox data. Live triage requires authorized D1 access and a named operator; no remote operator workflow or mail delivery was exercised here.

Keep acknowledgement/assignment outside the public site, preserve consent, and review closed submissions for deletion after 90 days unless an active matter requires retention. The retention policy is an operator procedure, not an automated deletion job.

## Reader-experience pass: a clearer private inbox

`npm run editorial -- inbox` groups existing drafts by their actual state and shows headline, author, section, source-review progress, outstanding checks, assigned reviewer and last transition. `npm run editorial -- inspect <slug>` prints SEO/social descriptions, remaining review work and transition history for one record. Both commands are read-only. An absent reviewer or transition remains explicitly absent. These views add no publication authority and do not expose draft material through public routes. Scheduled publishing and browser autosave remain inapplicable to this repository-backed editing workflow.
