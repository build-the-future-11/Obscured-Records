# Relaunch execution — 1 October 2026

## Purpose

This is the current execution receipt for Obscured Records. It reconciles the repository, the owner-only deployment, the public reader inventory, the editorial queue and the operational launch gates without inventing editorial approval or claiming a public launch that has not happened.

## Exact source state

- GitHub default branch at start of this pass: `c49759baa383c3c57d1200cea55e5d4d8ab17687`.
- PR #16 is merged and hardens editorial approval metadata validation. Its reported exact-head CI passed 202 tests plus the repository's editorial/build/runtime/browser checks.
- The last verified provider deployment receipt in this repository is dated 28 September 2026 for application source `052ee569f0b75bcc1baafbb52e7a1f2afe270092`.
- Later September 30 / October 1 source changes exist on `main`. The September 28 receipt therefore must not be reused to claim that current `main` is deployed.
- The deployed audience documented by the repository remains owner-only. Public launch remains **HOLD**.

## Reader estate

Current `main` contains:

- 28 reader records in the public registry.
- 8 expanded features among those 28.
- 42 review drafts that remain excluded from reader pages and feeds.
- No launch-time claim that those 42 drafts are approved publications.

Open draft-oriented PRs remain separate from the launch candidate:

- PR #14: Month 1 operating system plus source-led revisions for Mars Climate Orbiter, Challenger, Columbia and Hyatt Regency.
- PR #17: Johnstown source-reviewed draft.
- PR #18: stacked Blackout + Herald drafts.
- PR #19: stacked six-draft batch.

These PRs add useful future editorial material, but they are **not required for relaunch certification**. They should not be merged merely to increase article count.

## October archive audit

The connected Editorial OS now contains a canonical tab named **Public Archive Audit — Oct 1**. All 28 current reader records were classified into launch buckets using the existing source-review, media-review and launch-review evidence.

Summary:

- **10 CORE publish candidates**
- **8 RESERVE publish candidates**
- **10 REVISE / HOLD**
- **0 MERGE**
- **0 KILL**
- **0 owner-approved in this execution pass**

The absence of owner approvals is deliberate. Source analysis, CI and automated review cannot substitute for a named human claim-level editorial decision.

### Core launch slate

1. FedEx Flight 705
2. Wirecard
3. Satyam
4. 1MDB
5. Goiânia
6. Minamata
7. Times Beach
8. Therac-25
9. United Flight 629
10. Centralia

The homepage configuration already selects FedEx as lead, Wirecard and Goiânia as secondary stories, and Therac-25 as the long-read feature. No homepage-code change is required merely to express the initial editorial hierarchy.

### Reserve slate

- Air France 8969
- Richard McCoy
- Yodogo
- Parmalat
- Olympus
- Toshiba
- Lake Nyos
- Great Molasses Flood

### Revision / hold slate

- Ethiopian Airlines 961
- Dawson's Field
- Aral Sea
- Banqiao
- Stanislav Petrov
- Vela Incident
- MOVE bombing
- Eastland
- Iraq mercury poisoning
- USS Akron

These records are held because the existing review evidence shows a source-access, source-specificity, claim-boundary, sensitivity or provenance gap. They should be repaired rather than promoted by default.

## Media boundary

Current media evidence supports a conservative launch:

- FedEx: exact original match and CC BY-SA 4.0 evidence recorded.
- Goiânia: exact original match and CC BY 2.0 evidence recorded.
- Wirecard: text is usable, but the current local derivative still needs final provenance review.
- Lake Nyos: source-page public-domain designation exists, but the exact local derivative / photographer chain is unresolved.
- Therac-25: contradictory provenance remains unresolved.

The application already withholds the Wirecard, Lake Nyos and Therac-25 covers from reader projections/sharing where required. **Text-only publication is the default for a story whose image remains held.**

## Product / site state

Substantial reader infrastructure exists: curated homepage, article reader, archive, search, topics, series, authors, corrections, standards, RSS, sitemap/news sitemap, canonical sharing, saved stories, reading preferences and contributor intake.

The website is therefore no longer blocked on basic product construction. The launch bottleneck is certification and operations.

## Newsletter state

Newsletter signup is **capture-only**:

- consent is required;
- rows remain `pending_confirmation`;
- the application does not send email;
- unavailable storage fails visibly;
- suppression/unsubscribe statuses are preserved by storage logic.

Do not promise newsletter delivery until confirmation, sender/provider, unsubscribe/suppression delivery and controlled end-to-end email tests exist. Alternatively, the owner may explicitly accept capture-only scope for the site launch.

## Analytics state

Cloudflare Web Analytics integration is present but defaults **off**. It requires explicit approval and a valid public beacon token. Do Not Track and Global Privacy Control prevent script loading.

Do not report current analytics collection until a production verification proves it.

## Current hard gates

1. Complete claim-level review of the frozen launch stories.
2. Record explicit named editorial approval for every story that remains in the launch package.
3. Name the release / incident owner and retention / intake owner.
4. Close monitoring and provider-supported rollback / restore rehearsal.
5. Decide and document newsletter scope: capture-only or fully certified sending.
6. Freeze an exact post-approval release-candidate SHA.
7. Run clean exact-source CI.
8. Deploy exactly that SHA to the intended production surface.
9. Verify origin, revision, routes, feeds, assets, intake and launch CTA on that deployment.
10. Explicitly authorize the public audience change.
11. Distribute only after canonical live URLs exist.
12. Capture a fresh readership / subscriber / referral baseline; historical audience claims are not substitutes.

## Operating decision

Obscured Records is no longer in a “generate more articles” phase.

Until launch certification closes, the default priority is:

**claim review → approval → release freeze → production certification → public launch → distribution → measurement**

New draft volume is subordinate to that sequence.

## Control surfaces

- Google Drive: **Obscured Records — Content & Editorial Operating Plan**
- Google Sheets: **Obscured Records — Editorial OS**
  - Public Archive Audit — Oct 1
  - Relaunch Gate — Oct 1
  - Launch Sequence — Oct 1
- GitHub: this receipt and the October launch queue.

This receipt records work performed and known boundaries. It does not itself approve stories, change the production audience or certify public launch.
