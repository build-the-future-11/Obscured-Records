import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

const mapPath = new URL("../docs/reviews/flight-629-claim-map.json", import.meta.url);
const patchPath = new URL("../docs/reviews/flight-629-source-corrections.patch", import.meta.url);
const articlePath = new URL("../content/articles/flight-629-suitcase-bomb.mdx", import.meta.url);
const draftPath = new URL("../content/drafts/flight-629-suitcase-bomb.md", import.meta.url);
const registryPath = new URL("../lib/articles.ts", import.meta.url);

const staleClaim = "after buying travel insurance policies on her life";
const replacement = "The FBI traced the bomb to Jack Gilbert Graham, whose signed statement described placing the device in his mother’s suitcase. Agents found a $37,500 travel-insurance policy on her life naming him as beneficiary. A Colorado jury convicted him of first-degree murder.";

test("claim map records the unsupported purchase attribution and open gates", async () => {
  const map = JSON.parse(await readFile(mapPath, "utf8"));

  assert.equal(map.recordId, "0395");
  assert.equal(map.sourceBaseSha, "e8c57da72514b666c9dadf1e92a07f5d6380dc7f");
  assert.equal(map.disposition, "held-for-human-editorial-approval");
  assert.equal(map.proposedReplacement, replacement);
  assert.equal(map.identifiedGap.severity, "material-attribution-error");
  assert.deepEqual(
    map.sources.map(({ url }) => url),
    [
      "https://www.fbi.gov/history/cases-and-criminals/jack-gilbert-graham",
      "https://law.justia.com/cases/colorado/supreme-court/1956/18058.html",
    ],
  );
  assert.ok(Object.values(map.gates).every((value) => value === "open"));
  assert.equal(
    map.claimMap.find(({ claim }) => claim === "Graham bought the travel-insurance policies.").status,
    "remove-unsupported",
  );
});

test("held patch targets only the synchronized Flight 629 surfaces", async () => {
  const patch = await readFile(patchPath, "utf8");
  const targets = [...patch.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map(([, from, to]) => {
    assert.equal(from, to);
    return to;
  });

  assert.deepEqual(targets, [
    "content/articles/flight-629-suitcase-bomb.mdx",
    "content/drafts/flight-629-suitcase-bomb.md",
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
  for (const sourcePath of [articlePath, draftPath, registryPath]) {
    assert.match(await readFile(sourcePath, "utf8"), new RegExp(staleClaim));
  }

  const result = spawnSync(
    "git",
    ["apply", "--check", "--unidiff-zero", "--whitespace=error-all", patchPath.pathname],
    { cwd: new URL("..", import.meta.url), encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
