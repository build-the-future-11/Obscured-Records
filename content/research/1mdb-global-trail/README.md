# 1MDB allegation schematic

This packet holds an original, reproducible diagram for record 0410. It is a research artifact, not a published graphic and not editorial approval.

## Reproduce

From the repository root:

```sh
node content/research/1mdb-global-trail/generate-diagram.mjs
```

The command reads `diagram-data.json` and deterministically replaces `diagram.svg`. The regression test renders to a temporary file and requires an exact byte match with the committed SVG.

## Source boundary

The figure is limited to the three principal phases in the U.S. civil-forfeiture complaint filed on 20 July 2016 and the rounded summaries in the Justice Department announcement:

- [DOJ announcement](https://www.justice.gov/archives/opa/pr/united-states-seeks-recover-more-1-billion-obtained-corruption-involving-malaysian-sovereign)
- [Civil forfeiture complaint, case 2:16-cv-05371](https://www.justice.gov/opa/file/877326/dl?inline=)

Every path is an allegation, not a finding. The figure does not claim to show every transfer, beneficiary, asset, settlement or later procedural development. Amount labels are approximate source descriptions, and no visual dimension encodes value. The asset list uses the categories in the DOJ announcement; it does not import the existing article's unsupported “superyacht” wording.

## Rights and release gates

The diagram contains original vector shapes and text generated from public-record facts. It reproduces no third-party photography, report pages or private data. Before any reader-site use, a named human editor must approve the claim mapping and caption, the consenting author attribution must be confirmed, and issue #4's public-launch certification must close. AI source review is not human approval.
