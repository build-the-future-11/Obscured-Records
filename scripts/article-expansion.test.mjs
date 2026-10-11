import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { readDraft, validateDraft, wordCount } from "./editorial-content.mjs";

const manifest = JSON.parse(fs.readFileSync("content/article-expansion-2026-10-11.json", "utf8"));
const published = new Set(fs.readdirSync("content/articles").filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, "")));

test("11 October expansion contains exactly 100 distinct private articles", () => {
  assert.equal(manifest.length, 100);
  for (const field of ["slug", "title", "dek", "event", "mechanism", "system", "memory"]) {
    assert.equal(new Set(manifest.map((record) => record[field])).size, 100, `${field} must be unique across the batch`);
  }
  assert.equal(manifest.filter((record) => published.has(record.slug)).length, 0);
});

test("every expansion article is substantive, unapproved and isolated from public content", () => {
  const bodies = new Set();
  for (const record of manifest) {
    const file = path.join("content/drafts", `${record.slug}.md`);
    assert.equal(fs.existsSync(file), true, `${record.slug} draft is missing`);
    const { metadata, body } = readDraft(file);
    validateDraft(metadata, body);
    assert.equal(metadata.slug, record.slug);
    assert.equal(metadata.status, "draft");
    assert.equal(metadata.approvedBy, null);
    assert.equal(metadata.approvedAt, null);
    assert.ok(metadata.sources.every((source) => source.status === "orientation-source-not-verified"));
    assert.ok(wordCount(body) >= 350);
    assert.equal(published.has(metadata.slug), false);
    bodies.add(body);
  }
  assert.equal(bodies.size, 100);
});
