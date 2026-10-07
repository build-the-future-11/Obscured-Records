# Relaunch asset-pack source consistency — 2 October 2026

Status: **AI-assisted consistency repair; human approval and public launch remain blocked.**

## Source identity

- Canonical repository: `build-the-future-11/Obscured-Records`
- Canonical source SHA: `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`
- Record: `0421` / `fedex-flight-705`
- Current article source: [United States v. Calloway, 116 F.3d 1129 (6th Cir. 1997)](https://law.justia.com/cases/federal/appellate-courts/F3/116/1129/610984/)
- Source checked: 2 October 2026

## Reproduced defect

PR #21 changed the canonical FedEx article's primary source from the FBI Vault catalogue to the appellate opinion. The unapproved newsletter dry-run in `docs/RELAUNCH_ASSET_PACK.md` still said that the FBI Vault record was “already retained by the canonical article record.” That statement was false on current `main` and could cause a later adaptation to start from a superseded source surface.

The new regression was run against the unmodified asset pack and failed with:

> `brief source anchor must link the exact current article source and URL`

## Repair and evidence boundary

The dry-run now links the exact source label and URL in the canonical article frontmatter. The appellate opinion identifies the court and citation, describes the 7 April 1994 attack and emergency return, and records the disposition of the attempted-aircraft-piracy conviction. The repair does not expand the article or dry-run claims.

The FBI Vault catalogue remains an additional research lead only. This receipt does not claim review of its underlying files, and the asset pack no longer identifies that catalogue as the canonical article source.

## Changed files

- `docs/RELAUNCH_ASSET_PACK.md`
- `docs/reviews/RELAUNCH_ASSET_PACK_SOURCE_CONSISTENCY_2026-10-02.md`
- `scripts/relaunch-asset-pack-source-consistency.test.mjs`

## Verification

- `node --test scripts/relaunch-asset-pack-source-consistency.test.mjs` — PASS (2 tests)
- `npm test` — PASS (204 tests)
- `npm run check:editorial` — PASS (28 public article records; 42 unpublished drafts; no fact-check approval implied)
- `git diff --check` — PASS

## Gates and next action

This is a source-identity consistency check, not named-human editorial approval. It does not authorize newsletter sending, audio release, publication, deployment, analytics, audience changes, or closure of issue #4. Consenting author attribution and image/source-rights review remain open.

**Next exact action:** a human editor should compare the FedEx dry-run wording with the linked appellate opinion, record an approval or revision decision, and keep the newsletter/audio artifacts private until issue #4's immutable-candidate and delivery gates close.
