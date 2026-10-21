# Dependency security repair — 7 October 2026

## Result and review scope

This change repairs the dependency findings for which compatible releases were available, retains the existing Next.js and Workers/Vinext build paths, and adds a production dependency audit to CI. The final production-only audit reports **zero affected packages**. The full audit still reports **eight high-severity affected package labels**, all propagated from the same unresolved `braces` advisory. This is not a claim that the full dependency audit is clean.

The repair is stacked on draft PR #35 (`work/reader-navigation-state-20261006`) so its dependency changes can be reviewed separately from the reader-navigation work. The release hold in issue #4 remains in force. This change does not authorize deployment or change held editorial material.

Source basis:

- Default branch: `925dec375b4b5b90a7bad72cc270153b9d5d7799`.
- PR #35 head at review: `ec3df109aad64843086dfb823dd79ed8de3ae781`.
- Local recovered source: `f6ae9477b45a5699dba69f6fc7c0961b9cb3964d`.
- The last two commits have the same tree: `333a8a784abe1c9ac15bcb9219b9182b9840e06a`.

The final hosted workflow and resulting commit are recorded in the pull request. Historical PR #35 CI results are not evidence for this dependency change.

## Dependency changes

Direct version pins remain exact:

| Dependency | Before | After |
| --- | --- | --- |
| Next.js and `eslint-config-next` | 16.3.4 | 16.3.6 |
| React, React DOM, React Server DOM Webpack | 19.2.6 | 19.2.8 |
| Vite | 8.0.13 | 8.0.16 |

Scoped overrides repair the installed transitive dependencies:

| Dependency | Before | After | Scope |
| --- | --- | --- | --- |
| Sharp | 0.35.4 | 0.35.5 | All consumers, including Next.js and Miniflare |
| Undici | 7.24.8 | 7.29.1 | Miniflare |
| `ws` | 8.18.0 | 8.21.0 | Miniflare and Cloudflare Vite plugin |
| `image-size` | 2.0.2 | 2.0.4 | Vinext |
| esbuild | 0.27.3 | 0.28.1 | Wrangler |
| esbuild | 0.18.20 | 0.25.12 | `@esbuild-kit/core-utils`, used by the Drizzle compatibility loader |

The lockfile also refreshes compatible transitive releases: Babel core 7.29.7 and its patch-level helpers, brace-expansion 1.1.21 and 5.0.12, browserslist 4.29.3 and browser data, fast-uri 3.1.8, fflate 0.7.5, js-yaml 4.3.2, source-map-js 1.2.2, and Vite's esbuild peer 0.28.2. Native and platform-specific package entries move with their parent releases.

The existing Cloudflare Vite plugin 1.37.1, Miniflare 4.20260515.0, Wrangler 4.92.0, Vinext 1.0.0-beta.5, Workers types 4.20260515.1, and Drizzle Kit 0.31.10 are retained. Upgrading the Cloudflare Vite plugin to its latest release would introduce a different Miniflare major and an alpha package. The audit's proposed forced downgrades of Next.js tooling and Drizzle Kit are also inappropriate for this repair.

The legacy esbuild override crosses several pre-1.0 minor releases. Inspection found that the compatibility wrapper uses `transform` and `transformSync`, rather than the esbuild development server. Version 0.25.12 matches the esbuild version already used by Drizzle Kit itself. The new compatibility regression test checks both module formats and source maps, and the actual schema-generation CLI was exercised against this repository's schema.

Relevant upstream security records:

- [Next.js ImageResponse advisory, fixed in 16.3.6](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j).
- [Sharp/librsvg advisory, fixed in Sharp 0.35.5](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w).
- [Vite advisory, fixed in 8.0.16](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff).
- [Undici 7.29.1 security release](https://github.com/nodejs/undici/releases/tag/v7.29.1).
- [React Server Components advisory](https://github.com/advisories/GHSA-wx67-qw84-cm4g), reported by the dependency audit for the previous installed version.
- [`image-size` parser advisories](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) and [related bounds finding](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr).
- [Legacy esbuild development-server advisory](https://github.com/advisories/GHSA-67mh-4wv8-2f99) and [newer Windows file-read advisory](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr).

These package findings do not by themselves demonstrate that the deployed website exposes every vulnerable feature.

## Audit evidence and remaining finding

Audits were run on 7 October 2026 against the committed input versions, using Node 22.22.0 and npm 10.9.4. Counts below are affected package labels, not distinct vulnerabilities.

| Audit scope | Before | After |
| --- | --- | --- |
| All dependencies | 29: 1 critical, 21 high, 6 moderate, 1 low | 8 high; zero critical, moderate, or low |
| Production subset (`--omit=dev`) | 4: 1 critical, 2 high, 1 moderate | 0 |

The full audit's eight remaining labels are `braces`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next`, `eslint-config-next`, `vite-plugin-dynamic-import`, `vite-plugin-commonjs`, and `vinext`. They arise from [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): deeply nested patterns can exhaust the stack in `braces` through version 3.0.3. At verification time 3.0.3 was still the latest release and no fixed package was available; see [the upstream issue](https://github.com/micromatch/braces/issues/73).

These are development dependency chains used by linting and Vinext transformations. That classification is not a proof of absence from every generated bundle. The full `npm audit --json` intentionally remains an exit-1 result. No advisory suppression or fictitious patched version was added.

CI now runs `npm audit --omit=dev --audit-level=high` after its unchanged-lock-input check. It fails on high or critical production findings. This gate does not certify the development dependency set.

## Verification

All local commands below succeeded unless explicitly described as an expected failure in the vulnerable baseline replay:

| Check | Result |
| --- | --- |
| Clean locked installation, including native optional packages | Passed; package inputs unchanged |
| `npm test` on final installed dependency set | 205 passed, 0 failed |
| ESLint | Passed |
| TypeScript and editorial integrity | Passed |
| Workers/Vinext build | Passed |
| Local Workers and D1 integration | 41 checks passed, including actual local intake persistence, throttling, and triage |
| Next.js webpack build | Passed |
| Built Next.js HTTP checks | 227 passed |
| Browser interaction checks | 105 passed at 320, 375, 768, and 1440 pixel widths |
| Automated axe checks | 44 page/state checks, zero violations; not a human or screen-reader certification |
| Native image round trip | Sharp 0.35.5, librsvg 2.63.2, libvips 8.18.7 rendered SVG, resized PNG, and parsed its dimensions |
| Invalid ICNS regression | Patched parser rejected a zero-length entry in a bounded child process |
| Drizzle loader compatibility | Async ESM and sync CommonJS typed exports and source maps passed |
| Actual Drizzle schema generation | Passed; generated DDL accepted by an in-memory SQLite database with the expected three project tables |
| Production dependency audit | Zero findings |

The image regression was replayed against the official `image-size` 2.0.2 package as well as installed 2.0.4. Both accepted a valid PNG. The same malformed 16-byte ICNS sample then exhausted the 64 MiB child-process heap on 2.0.2, while 2.0.4 returned a controlled `TypeError` and exited successfully. The test isolates this failure with a timeout and memory limit. It establishes the parser regression; it does not demonstrate a public website exploit.

The schema check generated from `db/schema.ts` into an isolated temporary output directory and executed the generated DDL only in memory. The resulting tables were `editorial_submissions`, `intake_limits`, and `newsletter_subscribers`. The source schema and tracked migrations were unchanged.

The local application builds and 41/227/105 runtime checks preceded the final development-only Drizzle loader override. The override was then verified with its targeted regression, real schema generation, a second clean install, and the complete 205-test suite and lint. Hosted CI must rebuild both application targets from the final draft commit. Local runtime receipts contain the original local Git revision plus their respective working-tree source digest; the original revision alone is not an identity claim for the patched working tree.

Final dependency input SHA-256 values, unchanged by the final clean install:

```text
package.json       27a24d65edc05a634d8c6e24fa44fb52bf99dbd7d6cbd5e102e225673719fdd8
package-lock.json  898b8488c11b46c150b0f6e55b244c29098f2cdaf5c404419b1c8e2d5869327b
```

Reproduction commands on Node 22 with npm 10:

```sh
npm run install:ci
git diff --exit-code -- package.json package-lock.json
npm test
npm run lint
npm run typecheck
npm run check:editorial
npm audit --omit=dev --audit-level=high
npm audit --json
npm run build
node scripts/workers-intake-smoke.mjs
npm run build:vercel
node scripts/next-runtime-smoke.mjs
BROWSER_TOOLS_DIR=/path/to/isolated/browser-tools node scripts/browser-smoke.mjs
```

The full audit command exits 1 for the disclosed `braces` finding. Browser tooling is installed separately with Playwright 1.56.0, axe-core 4.10.3, and the corresponding Chromium binary, as specified by CI.
