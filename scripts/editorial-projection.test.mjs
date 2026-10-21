import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { editorialQueue } from "../lib/editorial-drafts.generated.ts";
import { loadEditorialDraft } from "../lib/editorial-draft-loader.generated.ts";
import { summarizeEditorialDraft } from "../lib/editorial-queue.ts";
import { readDraft, wordCount, writeDraft } from "./editorial-content.mjs";

test("lazy projection preserves every manuscript body and its review evidence", async () => {
  const files = fs.readdirSync("content/drafts").filter(file => file.endsWith(".md")).sort();
  assert.equal(editorialQueue.length, files.length);
  assert.equal(new Set(editorialQueue.map(item => item.slug)).size, files.length);
  for (const file of files) {
    const {metadata, body} = readDraft(path.join("content/drafts", file));
    const draft = await loadEditorialDraft(metadata.slug);
    assert.ok(draft, metadata.slug);
    assert.equal(draft.body, body);
    assert.equal(draft.words, wordCount(body));
    for (const key of ["slug", "title", "dek", "author", "status", "createdAt", "section", "sources", "reviewChecklist", "tags"]) {
      assert.deepEqual(draft[key], metadata[key], `${metadata.slug}: ${key}`);
    }
    assert.deepEqual(draft.completedChecks, metadata.completedChecks ?? []);
    assert.deepEqual(draft.history, metadata.history ?? []);
    assert.equal(draft.approvedBy, metadata.approvedBy ?? null);
    assert.equal(draft.approvedAt, metadata.approvedAt ?? null);
    const summary = editorialQueue.find(item => item.slug === metadata.slug);
    assert.deepEqual(summary, summarizeEditorialDraft(draft));
    assert.ok(!("body" in summary) && !("sources" in summary));
  }
});

test("unknown or prototype-like slugs cannot select a manuscript shard", async () => {
  for (const slug of ["not-a-real-draft", "__proto__", "constructor", "toString", "../0", ""]) {
    assert.equal(await loadEditorialDraft(slug), undefined);
  }
});

test("failed generation preserves the previous projection and cleans staged output", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "obscured-projection-"));
  try {
    for (const directory of ["content/drafts", "content/articles", "lib/editorial-draft-data.generated"]) fs.mkdirSync(path.join(root, directory), {recursive:true});
    const file = fs.readdirSync("content/drafts").filter(name => name.endsWith(".md")).sort()[0];
    fs.copyFileSync(path.join("content/drafts", file), path.join(root, "content/drafts", file));
    fs.writeFileSync(path.join(root, "content/drafts/zzz-invalid.md"), "not frontmatter");
    for (const file of ["editorial-drafts.generated.ts", "editorial-draft-loader.generated.ts", "editorial-draft-data.generated/0.ts"]) fs.writeFileSync(path.join(root, "lib", file), "previous valid generation");
    const result = spawnSync(process.execPath, ["--max-old-space-size=96", path.resolve("scripts/generate-editorial-drafts.mjs")], {cwd:root, encoding:"utf8"});
    assert.notEqual(result.status, 0);
    for (const file of ["editorial-drafts.generated.ts", "editorial-draft-loader.generated.ts", "editorial-draft-data.generated/0.ts"]) assert.equal(fs.readFileSync(path.join(root, "lib", file), "utf8"), "previous valid generation");
    assert.ok(!fs.readdirSync(path.join(root, "lib")).some(name => name.includes(".tmp-")));
  } finally { fs.rmSync(root, {recursive:true, force:true}); }
});

function installationFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "obscured-projection-install-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const directory of ["content/drafts", "content/articles", "lib"]) fs.mkdirSync(path.join(root, directory), { recursive: true });
  const original = fs.readdirSync("content/drafts").filter(name => name.endsWith(".md")).sort()[0];
  fs.copyFileSync(path.join("content/drafts", original), path.join(root, "content/drafts", original));
  function run(preload) {
    const args = ["--max-old-space-size=96"];
    if (preload) {
      const file = path.join(root, "fault.mjs");
      fs.writeFileSync(file, preload);
      args.push("--import", file);
    }
    return spawnSync(process.execPath, [...args, path.resolve("scripts/generate-editorial-drafts.mjs")], { cwd: root, encoding: "utf8", timeout: 10_000 });
  }
  const initial = run();
  assert.equal(initial.status, 0, initial.stderr);
  const outputs = [
    ...Array.from({ length: 64 }, (_, shard) => `editorial-draft-data.generated/${shard}.ts`),
    "editorial-draft-loader.generated.ts", "editorial-drafts.generated.ts",
  ];
  const before = new Map(outputs.map(file => [file, fs.readFileSync(path.join(root, "lib", file), "utf8")]));
  const { metadata, body } = readDraft(path.join(root, "content/drafts", original));
  // Inserting before the existing slug moves that manuscript to another shard.
  writeDraft(path.join(root, "content/drafts/0-installation-fixture.md"), { ...metadata, slug: "0-installation-fixture", title: "Earlier sorted installation fixture" }, body);
  return { root, run, before };
}

test("installation rename failure restores every prior shard, loader and index", (t) => {
  const { root, run, before } = installationFixture(t);
  const result = run(`import fs from "node:fs";
const rename = fs.renameSync;
fs.renameSync = (source, destination) => {
  if (source.endsWith("/editorial-drafts.generated.ts") && !source.includes("/backups/")) throw new Error("Injected installation failure");
  return rename(source, destination);
};`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Injected installation failure/);
  for (const [file, content] of before) assert.equal(fs.readFileSync(path.join(root, "lib", file), "utf8"), content, file);
  assert.ok(!fs.readdirSync(path.join(root, "lib")).some(name => name.includes(".tmp-") || name.endsWith(".lock")));
  // An ordinary failure leaves the generator immediately safe to retry.
  assert.equal(run().status, 0);
});

test("an existing generator lock blocks concurrent replacement and stays intact", (t) => {
  const { root, run, before } = installationFixture(t);
  const lock = path.join(root, "lib/editorial-draft-data.generated.lock");
  fs.writeFileSync(lock, "another generator owns this lock");
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Editorial generation is locked/);
  assert.equal(fs.readFileSync(lock, "utf8"), "another generator owns this lock");
  for (const [file, content] of before) assert.equal(fs.readFileSync(path.join(root, "lib", file), "utf8"), content, file);
});

test("rollback preserves a concurrent edit and retains its original backup for recovery", (t) => {
  const { root, run, before } = installationFixture(t);
  const result = run(`import fs from "node:fs";
import path from "node:path";
const rename = fs.renameSync;
fs.renameSync = (source, destination) => {
  if (source.endsWith("/editorial-drafts.generated.ts") && !source.includes("/backups/")) {
    fs.writeFileSync(path.resolve("lib/editorial-draft-data.generated/0.ts"), "Concurrent editor change");
    throw new Error("Injected installation failure");
  }
  return rename(source, destination);
};`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /rollback needs manual review/);
  assert.match(result.stderr, /Preserved concurrently changed projection/);
  assert.equal(fs.readFileSync(path.join(root, "lib/editorial-draft-data.generated/0.ts"), "utf8"), "Concurrent editor change");
  for (const [file, content] of before) {
    if (file !== "editorial-draft-data.generated/0.ts") assert.equal(fs.readFileSync(path.join(root, "lib", file), "utf8"), content, file);
  }
  const recovery = fs.readdirSync(path.join(root, "lib")).find(name => name.includes(".tmp-"));
  assert.ok(recovery);
  assert.equal(fs.readFileSync(path.join(root, "lib", recovery, "backups/0.ts"), "utf8"), before.get("editorial-draft-data.generated/0.ts"));
  assert.ok(!fs.existsSync(path.join(root, "lib/editorial-draft-data.generated.lock")));
});
