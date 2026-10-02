import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

const mapPath = new URL("../docs/reviews/centralia-relocation-claim-map.json", import.meta.url);
const patchPath = new URL("../docs/reviews/centralia-relocation-corrections.patch", import.meta.url);
const articlePath = new URL("../content/articles/centralia-underground-fire.mdx", import.meta.url);
const draftPath = new URL("../content/drafts/centralia-underground-fire.md", import.meta.url);
const registryPath = new URL("../lib/articles.ts", import.meta.url);

const staleTitle = "Centralia: The Mine Fire That Forced a Town’s Relocation";
const staleMechanism = "spread through a network of seams and mine passages";
const replacementTitle = "Centralia: The Mine Fire and Decades of Relocation";
const replacementContext = "From 1979 to 1982, the Office of Surface Mining acquired 34 impacted properties and the state began air-quality monitoring. After fire-related subsidence severely damaged Route 61, Congress appropriated $42 million in 1984 for voluntary acquisition and relocation of impacted businesses and residences. By 1991, 545 residences and businesses had been acquired and residents moved; condemnation procedures for remaining properties began in 1992.";

test("claim map separates voluntary acquisition from later condemnation", async () => {
  const map = JSON.parse(await readFile(mapPath, "utf8"));

  assert.equal(map.recordId, "0394");
  assert.equal(map.sourceBaseSha, "e8c57da72514b666c9dadf1e92a07f5d6380dc7f");
  assert.equal(map.disposition, "held-for-human-editorial-approval");
  assert.equal(map.proposedCopy.title, replacementTitle);
  assert.equal(map.proposedCopy.context, replacementContext);
  assert.deepEqual(map.sources.map(({ url }) => url), [
    "https://www.pa.gov/agencies/dep/programs-and-services/mining/abandoned-mine-reclamation/aml-program-information/centralia-mine-fire-resources/chronology",
  ]);
  assert.ok(Object.values(map.gates).every((value) => value === "open"));
  assert.equal(
    map.claimMap.find(({ claim }) => claim === "The relocation was uniformly forced.").status,
    "replace-collapsed-sequence",
  );
  assert.equal(
    map.claimMap.find(({ claim }) => claim.includes("network of seams")).status,
    "remove-unsupported",
  );
});

test("held patch targets only the synchronized Centralia surfaces", async () => {
  const patch = await readFile(patchPath, "utf8");
  const targets = [...patch.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map(([, from, to]) => {
    assert.equal(from, to);
    return to;
  });

  assert.deepEqual(targets, [
    "content/articles/centralia-underground-fire.mdx",
    "content/drafts/centralia-underground-fire.md",
    "lib/articles.ts",
  ]);
  assert.match(patch, new RegExp(replacementTitle));
  assert.match(patch, new RegExp(`^\\+${replacementContext.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  const additions = patch
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .join("\n");
  assert.doesNotMatch(additions, new RegExp(staleTitle));
  assert.doesNotMatch(additions, new RegExp(staleMechanism));
});

test("held patch applies cleanly to the recorded canonical source", async () => {
  for (const sourcePath of [articlePath, draftPath, registryPath]) {
    const source = await readFile(sourcePath, "utf8");
    assert.match(source, new RegExp(staleTitle));
    assert.match(source, new RegExp(staleMechanism));
  }

  const result = spawnSync(
    "git",
    ["apply", "--check", "--unidiff-zero", "--whitespace=error-all", patchPath.pathname],
    { cwd: new URL("..", import.meta.url), encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
