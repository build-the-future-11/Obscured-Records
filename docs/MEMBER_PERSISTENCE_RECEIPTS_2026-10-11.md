# Preserve member notes and acknowledge stored records

Date: 11 October 2026. Base: `95439482b798620ce88cbad3c1d82b1cb1c0490e`.

## Reproduced problem

The annotation upsert keyed a member's note by its ID, but updated the text,
private note and anchor without checking the existing article slug. Reusing an
ID for another article overwrote those fields while retaining the original
article. The response nevertheless acknowledged the incoming article.

Both annotation and saved-story updates also returned incoming creation/save
timestamps even though their conflict updates retained the original stored
timestamps. A successful response could therefore disagree with the next GET.

The original handlers failed four of the initial twelve new SQLite-backed
cases: note timestamp, cross-article ID collision, interleaved article requests
sharing an ID, and saved-story timestamp. The other eight controls passed.

## Repair

- Admit annotation conflict updates only when the existing row belongs to the
  authenticated member and the same article. This condition is part of the
  upsert statement, without a separate check-then-write interval.
- Return HTTP 409 for a refused note collision, retaining every existing row
  field. Valid same-article updates retain the original creation timestamp.
- Use SQLite `RETURNING` through the existing Drizzle D1 driver to construct
  successful note and saved-story receipts from the actual stored row.
- Keep internal member prefixes out of returned note IDs. If a saved-story
  write returns no row, return HTTP 503 without a success receipt.

Existing clients retain their successful response shapes and status codes.
Their existing non-success handling accepts the new conflict response. Browser
import stops on failure and never removes its local source copies; an earlier
successful import item may already be persisted. This is not an all-or-nothing
batch import. Reader dialogs retain unsaved text when saving fails.

## Verification

| Check | Result |
| --- | --- |
| Initial regressions on unchanged base | 8 passed, 4 failed |
| Final focused suite, Node 22.19.0 (workflow version) | 15 passed: 13 new persistence cases plus 2 existing member-contract cases |
| Full repository `npm test`, Node 24.19.0 | 226 passed, 0 failed/skipped/cancelled |
| Full TypeScript check | Passed |
| ESLint for the two changed routes and new test | Passed |
| Editorial integrity | Passed; 28 public article records and 145 unpublished drafts remain separate |
| Vinext production build | Passed; existing unsupported-webpack/CSS-highlight warnings retained |
| Patch whitespace and locked dependency input checks | Passed |
| Independent source review | No blocking defect found in the route changes or fixture boundaries |

The new tests import the real route handlers, real schema and locked Drizzle
0.45.2 D1 driver. A small D1 transport fixture executes its SQL against an
in-memory Node SQLite database initialized from the existing member migration.
Only the hosting identity and database transport are replaced. Cases cover
stored readback, timestamp preservation, repeated imports, collisions,
cross-account isolation, invalid/unauthenticated input, database write failure,
and an ignored write that returns no row.

The `Promise.all` witness interleaves two synthetic calls in one process. It is
not certification of separate Cloudflare workers, cloud D1 concurrency, hosting
identity enforcement, or production member access. Hosted integration and
release acceptance remain separate. No schema, migration, dependency,
authentication policy, local-storage implementation, editorial source, provider
configuration or deployment was changed. Existing overwritten content cannot
be reconstructed by this repair.

Reproduce the focused suite:

```sh
node --experimental-strip-types --test scripts/member-persistence.test.mjs scripts/member.test.mjs
```

This candidate does not overlap any changed file in the 21 open PRs inspected
on 11 October 2026, including #42's member request reader and #39's local
library/intake changes. Keep those proposals and the relaunch gate separate.
