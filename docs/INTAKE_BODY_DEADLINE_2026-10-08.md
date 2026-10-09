# Intake request-body deadline — 8 October 2026

## Defect reproduced

Source: `main@925dec375b4b5b90a7bad72cc270153b9d5d7799`.

The shared request reader enforced 4,096-byte newsletter and 16,384-byte
submission limits but awaited every stream read without a deadline or request
abort listener. A partial JSON upload could leave both endpoints waiting
indefinitely before their persistence and durable rate-limit operations.

A local constructed newsletter request enqueued `{"email":`, left the stream
open, and then aborted the Request. After 100 ms its signal was aborted, the
handler was still unsettled, the stream had not been cancelled, and no save had
occurred. The new abort regression also failed against the original reader by
exceeding its 1,500 ms test bound. No real submission or provider was used.

## Repair

- Give the complete request body one 5,000 ms deadline, beginning when the shared
  reader starts. Each new chunk uses the remaining budget; it does not restart it.
- Observe both already-aborted requests and aborts during a pending read.
- Check the deadline between reads, including streams of empty chunks that can
  keep the microtask queue busy without allowing a timer callback to run.
- Discard empty chunks and race the complete read loop once, so repeated empty
  chunks cannot grow the retained chunk array or interruption-promise handlers.
- Cancel the reader after abort, timeout, byte-limit violation, or read failure;
  never wait for a stalled or rejecting cancellation hook.
- Remove the timer and abort listener, and release the reader lock on every exit.
- Return a no-store HTTP 408 response with retry guidance for body timeouts.
  Incomplete or aborted uploads cannot reach the save callback.

This is an upload budget, not a new persistence deadline. A valid body completed
within the budget still follows the existing persistence acknowledgment flow.
Legitimate uploads requiring more than five seconds to supply the small JSON
body now receive 408 and must retry. That is the material behavior change.

The existing submission form disables its fields while saving and calls
`form.reset()` only after an OK response with a success message. Its non-OK
response path, including 408, retains the fields and displays the error and
retained-text email fallback. That behavior was checked in the component source;
no new browser verification is claimed.

## Verification completed

Runtime: Node **24.19.0**, npm **11.9.0**. Targeted TypeScript compiler:
**5.9.3**, matching the repository dependency declaration.

| Check | Result |
| --- | --- |
| `node --experimental-strip-types --test scripts/intake-body-deadline.test.mjs` | 11 passed |
| `npm test` | 213 passed; 0 failed, cancelled or skipped |
| Targeted strict TypeScript check of both handlers and their imported intake policy | Passed |
| `npm run check:editorial` | Passed: 28 article records and 42 unpublished drafts; no fact-check approval implied |
| Node syntax checks for both changed handlers | Passed |
| `git diff --check` | Passed |

The new regressions cover both endpoints, pre-aborted and mid-upload aborted
requests, a total deadline despite continued chunk delivery, stalled/rejecting
cancellation hooks, empty chunks, split multibyte UTF-8, stream errors, zero
persistence on failure, and released stream locks. Existing size, UTF-8,
consent, same-origin, persistence, and durable rate-limit checks remain passing.

Targeted compiler command:

```sh
npm exec --yes --package typescript@5.9.3 -- tsc --noEmit --strict \
  --target ES2017 --lib dom,dom.iterable,esnext --module esnext \
  --moduleResolution bundler --allowImportingTsExtensions \
  lib/newsletter-handler.ts lib/submission-handler.ts
```

Full dependency installation, framework builds, hosted CI and browser checks
were not rerun for this local patch. The Node suite exercises the actual shared
reader, both route handlers, and constructed Request/ReadableStream objects.

## Integration state

The work is on isolated local branch
`work/intake-body-deadline-20261008`. It is not pushed, reviewed, merged or
deployed. Existing public-launch and public-push holds remain applicable.

The open reader/security/focus candidates #35, #37 and #38 do not change these
two handler files. Any later integration must still recheck the current base
and run the repository's ordinary CI. This patch neither substitutes for the
dependency repair in #37 nor certifies production intake persistence.
