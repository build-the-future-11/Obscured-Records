import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();
const jsonPath = path.join(root, "docs", "reviews", "cross-domain-closeout-2026-10-02.json");
const markdownPath = path.join(root, "docs", "reviews", "CROSS_DOMAIN_CLOSEOUT_2026-10-02.md");

function readCloseout() {
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

test("closeout pins every sprint PR to an open draft exact head and successful CI run", () => {
  const closeout = readCloseout();
  assert.equal(closeout.canonicalMainSha, "e8c57da72514b666c9dadf1e92a07f5d6380dc7f");
  assert.equal(closeout.issue4State, "open_hold");
  assert.deepEqual(closeout.pullRequests.map(({ number }) => number), [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]);

  for (const pr of closeout.pullRequests) {
    assert.equal(pr.state, "open_draft", `PR #${pr.number} must remain an open draft`);
    assert.equal(pr.merged, false, `PR #${pr.number} must not be represented as merged`);
    assert.match(pr.head, /^[0-9a-f]{40}$/, `PR #${pr.number} needs an exact head SHA`);
    assert.equal(pr.ciConclusion, "success", `PR #${pr.number} exact-head CI is not recorded as successful`);
    assert.ok(Number.isInteger(pr.ciRun) && pr.ciRun > 0, `PR #${pr.number} needs a workflow run ID`);
  }
});

test("closeout covers the ten core records without converting artifacts into approvals", () => {
  const closeout = readCloseout();
  const expected = ["0394", "0395", "0404", "0406", "0407", "0409", "0410", "0414", "0415", "0421"];
  assert.deepEqual(closeout.coreRecords.map(({ recordId }) => recordId).sort(), expected);
  assert.equal(new Set(closeout.coreRecords.map(({ recordId }) => recordId)).size, 10);

  for (const record of closeout.coreRecords) {
    assert.match(record.sourceUrl, /^https:\/\//, `${record.recordId} needs a source citation`);
    assert.match(record.disposition, /(unapproved|human_approval_open)/, `${record.recordId} must retain an open approval boundary`);
  }

  assert.deepEqual(Object.values(closeout.gates), Array(Object.keys(closeout.gates).length).fill(false));
  assert.match(closeout.nextExactAction, /named human editor/i);
});

test("closeout exposes integration collisions and Markdown matches the machine receipt", () => {
  const closeout = readCloseout();
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const registryCollision = closeout.integrationDependencies.find(({ path: target }) => target === "lib/articles.ts");
  assert.deepEqual(registryCollision?.pullRequests, [23, 33]);

  for (const pr of closeout.pullRequests) {
    assert.ok(markdown.includes(`[#${pr.number}]`), `Markdown omits PR #${pr.number}`);
    assert.ok(markdown.includes(pr.head), `Markdown omits PR #${pr.number} head`);
    assert.ok(markdown.includes(String(pr.ciRun)), `Markdown omits PR #${pr.number} CI run`);
  }
  for (const record of closeout.coreRecords) {
    assert.ok(markdown.includes(record.recordId), `Markdown omits core record ${record.recordId}`);
    assert.ok(markdown.includes(record.sourceUrl), `Markdown omits ${record.recordId} source URL`);
  }
  assert.match(markdown, /all 28 decisions remain `PENDING`/);
  assert.match(markdown, /issue #4 remains open/i);
});
