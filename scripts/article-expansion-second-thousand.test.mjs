import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createHash } from "node:crypto";
import { readDraft, validateDraft, wordCount } from "./editorial-content.mjs";

const manifest = JSON.parse(fs.readFileSync("content/article-expansion-2026-10-15-second.json", "utf8"));
const batchSlugs = new Set(manifest.map((record) => record.slug));
const earlier = ["2026-10-11", "2026-10-14", "2026-10-15"]
  .flatMap((date) => JSON.parse(fs.readFileSync(`content/article-expansion-${date}.json`, "utf8")));

test("second 15 October expansion has 2,000 distinct, revision-traceable subjects", () => {
  assert.equal(manifest.length, 2000);
  for (const field of ["slug", "title", "dek", "event", "mechanism", "system", "memory"]) {
    assert.equal(new Set(manifest.map((record) => record[field])).size, 2000, field);
  }
  for (const key of ["wikipediaPageId", "wikidataId"]) {
    const oldIds = new Set(earlier.map((record) => record.discovery?.[key]).filter(Boolean));
    assert.equal(new Set(manifest.map((record) => record.discovery[key])).size, 2000, key);
    assert.ok(manifest.every((record) => !oldIds.has(record.discovery[key])), `No reused ${key}`);
  }
  assert.equal(new Set(manifest.map((record) => record.source.url)).size, 2000);
  assert.deepEqual(new Set(manifest.map((record) => record.section)), new Set(["World", "Business", "Technology", "Science", "Culture", "Underreported"]));
  assert.ok(new Set(manifest.map((record) => record.discovery.category)).size >= 40);
  for (const record of manifest) {
    assert.ok(record.discovery.wikipediaRevisionId && record.discovery.wikidataRevisionId);
    assert.ok(Number.isFinite(Date.parse(record.discovery.retrievedAt)));
    assert.equal(new URL(record.source.url).hostname, "en.wikipedia.org");
    for (const field of ["evidencePlan", "stakeholderPlan", "openQuestions"]) assert.equal(record[field].length, 3);
  }
});

test("new subjects do not reuse any existing manuscript's title, source, or public slug", () => {
  const previousTitles = new Set();
  const previousSources = new Set();
  for (const file of fs.readdirSync("content/drafts").filter((name) => name.endsWith(".md"))) {
    if (batchSlugs.has(file.slice(0, -3))) continue;
    const { metadata } = readDraft(path.join("content/drafts", file));
    previousTitles.add(metadata.title.toLowerCase());
    for (const source of metadata.sources) previousSources.add(source.url);
  }
  const publicSlugs = new Set(fs.readdirSync("content/articles").filter((name) => name.endsWith(".mdx")).map((name) => name.slice(0, -4)));
  for (const record of manifest) {
    assert.ok(!previousTitles.has(record.title.toLowerCase()), record.slug);
    assert.ok(!previousSources.has(record.source.url), record.slug);
    assert.ok(!previousSources.has(record.discovery.wikidataUrl), record.slug);
    assert.ok(!publicSlugs.has(record.slug), record.slug);
  }
});

test("all 2,000 manuscripts retain their sources, review obligations, and unapproved state", () => {
  const bodies = new Set();
  for (const record of manifest) {
    const { metadata, body } = readDraft(path.join("content/drafts", `${record.slug}.md`));
    validateDraft(metadata, body);
    assert.equal(metadata.slug, record.slug);
    assert.equal(metadata.title, record.title);
    assert.equal(metadata.createdAt, "2026-10-15");
    assert.equal(metadata.status, "draft");
    assert.equal(metadata.author, "Unassigned — AI-assisted editorial draft");
    assert.equal(metadata.approvedBy, null);
    assert.equal(metadata.approvedAt, null);
    assert.deepEqual(metadata.completedChecks, []);
    assert.deepEqual(metadata.sources.map((source) => source.url), [record.source.url, record.discovery.wikidataUrl]);
    assert.ok(metadata.sources.every((source) => source.status === "orientation-source-not-verified"));
    assert.ok(wordCount(body) >= 650);
    assert.match(body, /private, AI-assisted archival reconstruction plan/);
    assert.match(body, /none is claim-level proof/);
    assert.doesNotMatch(body, /\b(?:TBD|TODO)\b|<PLACEHOLDER>|\[PLACEHOLDER\]/i);
    bodies.add(createHash("sha256").update(body).digest("hex"));
  }
  assert.equal(bodies.size, 2000);
});
