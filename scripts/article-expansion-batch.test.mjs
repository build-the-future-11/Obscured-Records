import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("./generate-thousand-more-articles.mjs", import.meta.url));
const repository = path.dirname(path.dirname(script));
const seed = JSON.parse(fs.readFileSync(path.join(repository, "content/article-expansion-2026-10-15.json"), "utf8"))[0];

function record(index) {
  return {
    ...structuredClone(seed),
    slug: `fixture-subject-${index}`,
    title: `Fixture subject ${index}`,
    source: { title: `Fixture source ${index}`, url: `https://en.wikipedia.org/wiki/Fixture_${index}` },
    discovery: {
      ...seed.discovery,
      wikipediaPageId: index,
      wikidataId: `Q${index}`,
      wikidataUrl: `https://www.wikidata.org/wiki/Q${index}`,
    },
  };
}

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "article-expansion-batch-"));
  const drafts = path.join(directory, "content/drafts");
  const articles = path.join(directory, "content/articles");
  fs.mkdirSync(drafts, { recursive: true });
  fs.mkdirSync(articles, { recursive: true });
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return {
    directory, drafts, articles,
    run(records, { count = String(records?.length ?? 1), preload } = {}) {
      const manifest = path.join(directory, "manifest.json");
      fs.writeFileSync(manifest, JSON.stringify(records));
      const args = ["--max-old-space-size=96"];
      if (preload) {
        const preloadPath = path.join(directory, "inject.mjs");
        fs.writeFileSync(preloadPath, preload);
        args.push("--import", preloadPath);
      }
      return spawnSync(process.execPath, [...args, script, "--manifest", manifest, "--count", count], {
        cwd: directory, encoding: "utf8", timeout: 10_000,
      });
    },
  };
}

function succeeded(result) {
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
}

function failed(result, message) {
  assert.equal(result.error, undefined);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, message);
}

test("batch output remains byte-identical and reruns preserve existing manuscripts", (t) => {
  const env = fixture(t);
  succeeded(env.run([seed]));
  const destination = path.join(env.drafts, `${seed.slug}.md`);
  assert.equal(fs.readFileSync(destination, "utf8"), fs.readFileSync(path.join(repository, "content/drafts", `${seed.slug}.md`), "utf8"));
  const before = fs.statSync(destination);
  succeeded(env.run([seed]));
  const after = fs.statSync(destination);
  assert.equal(after.ino, before.ino);
  assert.equal(after.mtimeMs, before.mtimeMs);
  assert.deepEqual(fs.readdirSync(env.drafts), [`${seed.slug}.md`]);
});

test("a late reviewed-manuscript conflict cannot leave earlier new drafts", (t) => {
  const env = fixture(t);
  succeeded(env.run([record(2)]));
  const reviewed = path.join(env.drafts, "fixture-subject-2.md");
  fs.appendFileSync(reviewed, "\nEditor's independent reporting.\n");
  const preserved = fs.readFileSync(reviewed, "utf8");
  failed(env.run([record(1), record(2)]), /Refusing to overwrite an existing or reviewed manuscript/);
  assert.deepEqual(fs.readdirSync(env.drafts), ["fixture-subject-2.md"]);
  assert.equal(fs.readFileSync(reviewed, "utf8"), preserved);
});

test("a late public-article collision cannot leave earlier new drafts", (t) => {
  const env = fixture(t);
  fs.writeFileSync(path.join(env.articles, "fixture-subject-2.mdx"), "Existing public article");
  failed(env.run([record(1), record(2)]), /Expansion collides with existing subject/);
  assert.deepEqual(fs.readdirSync(env.drafts), []);
});

test("every manuscript is validated before any draft is created", (t) => {
  const env = fixture(t);
  failed(env.run([record(1), { ...record(2), tags: [] }]), /At least two nonempty text tags required/);
  assert.deepEqual(fs.readdirSync(env.drafts), []);
});

test("invalid counts and malformed discovery records fail without filesystem writes", (t) => {
  const env = fixture(t);
  for (const count of ["0", "5001", "1.5", "no", "Infinity"]) {
    failed(env.run([record(1)], { count }), /Count must be between 1 and 5,000/);
  }
  for (const malformed of [null, {}, [record(1), null], [{ ...record(1), source: null }], [{ ...record(1), discovery: [] }]]) {
    failed(env.run(malformed), /Expansion manifest must contain exactly|Malformed article expansion record/);
  }
  failed(env.run([record(1)], { count: "2" }), /exactly 2 records; found 1/);
  failed(env.run([{ ...record(1), discovery: { ...record(1).discovery, wikipediaPageId: "1" } }]), /malformed discovery identity/);
  failed(env.run([record(1), record(1)]), /Duplicate expansion slug/);
  assert.deepEqual(fs.readdirSync(env.drafts), []);
});

test("write failure rolls back newly created files and preserves pre-existing drafts", (t) => {
  const env = fixture(t);
  succeeded(env.run([record(3)]));
  const existing = fs.readFileSync(path.join(env.drafts, "fixture-subject-3.md"), "utf8");
  failed(env.run([record(1), record(2), record(3)], {
    preload: `import fs from "node:fs";
const link = fs.linkSync;
let calls = 0;
fs.linkSync = (...args) => { if (++calls === 2) throw new Error("Injected filesystem failure"); return link(...args); };`,
  }), /Injected filesystem failure/);
  assert.deepEqual(fs.readdirSync(env.drafts), ["fixture-subject-3.md"]);
  assert.equal(fs.readFileSync(path.join(env.drafts, "fixture-subject-3.md"), "utf8"), existing);
});

test("a destination created after preflight is never overwritten or rolled back", (t) => {
  const env = fixture(t);
  failed(env.run([record(1), record(2)], {
    preload: `import fs from "node:fs";
const link = fs.linkSync;
let calls = 0;
fs.linkSync = (source, destination) => {
  if (++calls === 2) fs.writeFileSync(destination, "Concurrent editor's manuscript", { flag: "wx" });
  return link(source, destination);
};`,
  }), /EEXIST/);
  assert.deepEqual(fs.readdirSync(env.drafts), ["fixture-subject-2.md"]);
  assert.equal(fs.readFileSync(path.join(env.drafts, "fixture-subject-2.md"), "utf8"), "Concurrent editor's manuscript");
});

test("rollback preserves concurrent edits and reports the need for manual review", (t) => {
  const env = fixture(t);
  failed(env.run([record(1), record(2)], {
    preload: `import fs from "node:fs";
const link = fs.linkSync;
let first;
fs.linkSync = (source, destination) => {
  if (first) { fs.writeFileSync(first, "Concurrent editor's revision"); throw new Error("Injected filesystem failure"); }
  first = destination;
  return link(source, destination);
};`,
  }), /rollback needs manual review/);
  assert.deepEqual(fs.readdirSync(env.drafts), ["fixture-subject-1.md"]);
  assert.equal(fs.readFileSync(path.join(env.drafts, "fixture-subject-1.md"), "utf8"), "Concurrent editor's revision");
});
