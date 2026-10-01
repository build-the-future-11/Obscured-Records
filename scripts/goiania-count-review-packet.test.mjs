import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

const mapPath = new URL("../docs/reviews/goiania-count-claim-map.json", import.meta.url);
const patchPath = new URL("../docs/reviews/goiania-count-corrections.patch", import.meta.url);
const articlePath = new URL("../content/articles/goiania-blue-powder.mdx", import.meta.url);
const registryPath = new URL("../lib/articles.ts", import.meta.url);

const staleClaim = "hundreds were contaminated or exposed";
const replacement = "Fragments travelled through families and neighbourhoods before the source was recognized. The IAEA reports that about 112,000 people were monitored, 249 were found internally or externally contaminated, 20 required hospital treatment and four died. Cleanup included the demolition of seven houses, and the response ultimately stored 3,500 cubic metres of radioactive waste.";

test("claim map separates the Goiânia cohorts and records open gates", async () => {
  const map = JSON.parse(await readFile(mapPath, "utf8"));

  assert.equal(map.recordId, "0409");
  assert.equal(map.sourceBaseSha, "e8c57da72514b666c9dadf1e92a07f5d6380dc7f");
  assert.equal(map.disposition, "held-for-human-editorial-approval");
  assert.equal(map.proposedReplacement, replacement);
  assert.equal(map.identifiedGap.severity, "material-precision-error");
  assert.deepEqual(map.sources.map(({ url }) => url), [
    "https://www-pub.iaea.org/mtcd/publications/pdf/pub815_web.pdf",
  ]);
  assert.ok(Object.values(map.gates).every((value) => value === "open"));
  assert.deepEqual(
    map.claimMap.filter(({ status }) => status === "supported").map(({ claim }) => claim),
    [
      "About 112,000 people were monitored.",
      "249 people were found internally or externally contaminated.",
      "20 people required hospital treatment and four died.",
      "Cleanup included the demolition of seven houses.",
      "The final volume of stored waste was 3,500 cubic metres.",
    ],
  );
});

test("held patch targets only the synchronized Goiânia surfaces", async () => {
  const patch = await readFile(patchPath, "utf8");
  const targets = [...patch.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map(([, from, to]) => {
    assert.equal(from, to);
    return to;
  });

  assert.deepEqual(targets, [
    "content/articles/goiania-blue-powder.mdx",
    "lib/articles.ts",
  ]);
  assert.match(patch, new RegExp(`^\\+${replacement.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  assert.doesNotMatch(
    patch
      .split("\n")
      .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
      .join("\n"),
    new RegExp(staleClaim),
  );
});

test("held patch applies cleanly to the recorded canonical source", async () => {
  for (const sourcePath of [articlePath, registryPath]) {
    assert.match(await readFile(sourcePath, "utf8"), new RegExp(staleClaim));
  }

  const result = spawnSync(
    "git",
    ["apply", "--check", "--unidiff-zero", "--whitespace=error-all", patchPath.pathname],
    { cwd: new URL("..", import.meta.url), encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
