# Times Beach source-located sequence diagram

This review artifact turns the existing record 0406 sequence checklist into a reproducible visual. It remains outside public assets and application imports.

## Files

- `timeline.json` — source-located event data and caption safeguards.
- `generate.mjs` — deterministic SVG generator using only Node built-ins.
- `timeline.svg` — generated accessible diagram.

## Reproduce

```sh
node content/research/times-beach-sequence/generate.mjs
node --test scripts/times-beach-sequence-diagram.test.mjs
```

## Interpretation boundary

The source is the [U.S. EPA Region 7 retrospective](https://www.epa.gov/mo/town-flood-and-superfund-looking-back-times-beach-disaster-nearly-40-years-later), inspected on 2 October 2026. The diagram selects eight documented stages. Equal spacing and equal card size do not encode duration, contamination level, risk, cost, causal weight or cleanup effectiveness.

It is not a complete community history, independent toxicological assessment, finding about any person's liability, or evidence that a named policy outcome resulted from one event. AI source review does not satisfy human editorial approval.
