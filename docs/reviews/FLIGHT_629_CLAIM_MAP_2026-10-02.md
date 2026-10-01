# United Flight 629 claim-map review

**Record:** 0395 (`flight-629-suitcase-bomb`)

**Canonical source SHA:** `e8c57da72514b666c9dadf1e92a07f5d6380dc7f`

**Disposition:** held for human editorial approval

**Review date:** 2026-10-02

## Finding

The published brief, draft, and registry say Jack Gilbert Graham placed the bomb after buying travel-insurance policies on his mother's life. The linked FBI history does not support that purchase attribution. It says the $37,500 policy naming Graham as beneficiary was taken out by his mother at the airport.

The safer replacement separates three propositions and maps each to evidence:

> The FBI traced the bomb to Jack Gilbert Graham, whose signed statement described placing the device in his mother's suitcase. Agents found a $37,500 travel-insurance policy on her life naming him as beneficiary. A Colorado jury convicted him of first-degree murder.

This language does not infer motive from possession of the policy, attribute the purchase to Graham, or claim that the case caused a later security policy.

## Source-to-claim map

| Claim | FBI history | Colorado Supreme Court opinion | Disposition |
|---|---|---|---|
| Graham's signed statement described placing the bomb in the suitcase | Supports | Supports | Retain with precise attribution |
| Agents found a $37,500 policy naming Graham as beneficiary | Supports | Supports | Retain |
| Graham bought the travel-insurance policies | Contradicted by the source's purchase description | Does not establish this as fact | Remove |
| Jury convicted Graham of first-degree murder | Describes the prosecution history | Supports and records affirmance | Specify verdict |
| Case caused a particular later security measure | Does not establish | Does not establish | Continue to avoid |

## Sources inspected

- [Federal Bureau of Investigation — Jack Gilbert Graham](https://www.fbi.gov/history/cases-and-criminals/jack-gilbert-graham): official history supporting the flight, fatalities, physical evidence, admission, and policy evidence. Its account attributes the policy purchase to Graham's mother, not Graham.
- [Graham v. People, 302 P.2d 737 (Colo. 1956)](https://law.justia.com/cases/colorado/supreme-court/1956/18058.html): primary judicial opinion supporting the signed statement, insurance evidence, first-degree-murder verdict, and affirmance.

The structured claim map is in `docs/reviews/flight-629-claim-map.json`.

## Held correction artifact

`docs/reviews/flight-629-source-corrections.patch` proposes synchronized corrections to:

- `content/articles/flight-629-suitcase-bomb.mdx`
- `content/drafts/flight-629-suitcase-bomb.md`
- `lib/articles.ts`

The patch is deliberately not applied. `lib/articles.ts` is active in another open pull request, and the story still requires human editorial approval. Applying the held patch later also updates the displayed date and adds the court opinion as an additional source.

## Verification

Run from the repository root:

```sh
node --test scripts/flight-629-review-packet.test.mjs
git apply --check --unidiff-zero --whitespace=error-all docs/reviews/flight-629-source-corrections.patch
```

Results on the isolated branch `editorial/flight-629-claim-map-20261002`:

- `node --test scripts/flight-629-review-packet.test.mjs` — PASS, 3 tests.
- `git apply --check --unidiff-zero --whitespace=error-all docs/reviews/flight-629-source-corrections.patch` — PASS.
- `git diff --check` — PASS.
- `npm test` — PASS, 205 tests.
- `npm run check:editorial` — PASS, 28 public article records and 42 unpublished drafts checked; no fact-check approval implied.

## Open gates and exact next action

AI source review is not approval. Human editorial approval, consenting author attribution, image/source rights review, and issue #4 public-launch certification remain open. No reader-site content, publication state, audience permission, email, analytics, or deployment is changed by this packet.

**Next action:** a human editor should compare the mapped claims with both sources, record approval or requested edits, then coordinate application of the held patch after resolving any overlap in `lib/articles.ts`.
