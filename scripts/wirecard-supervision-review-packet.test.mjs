import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

const mapPath = new URL("../docs/reviews/wirecard-supervision-claim-map.json", import.meta.url);
const patchPath = new URL("../docs/reviews/wirecard-supervision-corrections.patch", import.meta.url);
const articlePath = new URL("../content/articles/wirecard-missing-billions.mdx", import.meta.url);
const registryPath = new URL("../lib/articles.ts", import.meta.url);

const staleContext = "Regulators treated Wirecard partly as a technology company rather than as the financial institution its risks resembled.";
const replacementContext = "ESMA’s peer review found that FREP did not act on international-media signals when selecting Wirecard for examination between 2016 and 2018, despite specific risks in its reporting. ESMA also found that FREP and BaFin should have expanded the scope of the 2018 financial-report examination earlier after serious 2019 media allegations about third-party-acquiring revenue and disclosures.";
const esmaSource = "https://www.esma.europa.eu/document/fast-track-peer-review-report-wirecard";

test("claim map replaces the Wirecard supervision compression with attributed findings", async () => {
  const map = JSON.parse(await readFile(mapPath, "utf8"));

  assert.equal(map.recordId, "0415");
  assert.equal(map.sourceBaseSha, "e8c57da72514b666c9dadf1e92a07f5d6380dc7f");
  assert.equal(map.disposition, "held-for-human-editorial-approval");
  assert.equal(map.proposedCopy.context, replacementContext);
  assert.deepEqual(map.sources.map(({ id }) => id), ["esma-peer-review", "bundestag-inquiry"]);
  assert.ok(Object.values(map.gates).every((value) => value === "open"));
  assert.equal(
    map.claimMap.find(({ claim }) => claim.startsWith("Regulators treated Wirecard")).status,
    "remove-unattributed-analysis",
  );
});

test("held patch targets only the synchronized Wirecard surfaces", async () => {
  const patch = await readFile(patchPath, "utf8");
  const targets = [...patch.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map(([, from, to]) => {
    assert.equal(from, to);
    return to;
  });

  assert.deepEqual(targets, [
    "content/articles/wirecard-missing-billions.mdx",
    "lib/articles.ts",
  ]);
  assert.match(patch, new RegExp(`^\\+${replacementContext.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  assert.match(patch, new RegExp(esmaSource.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const additions = patch
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .join("\n");
  assert.doesNotMatch(additions, new RegExp(staleContext));
});

test("held patch applies cleanly to the recorded canonical source", async () => {
  for (const sourcePath of [articlePath, registryPath]) {
    assert.match(await readFile(sourcePath, "utf8"), new RegExp(staleContext));
  }

  const result = spawnSync(
    "git",
    ["apply", "--check", "--unidiff-zero", "--whitespace=error-all", patchPath.pathname],
    { cwd: new URL("..", import.meta.url), encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
