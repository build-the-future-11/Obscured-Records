import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { readDraft, validateDraft, wordCount } from "./editorial-content.mjs";

const manifest = JSON.parse(fs.readFileSync("content/article-expansion-2026-10-15.json", "utf8"));
const earlier = [
  ...JSON.parse(fs.readFileSync("content/article-expansion-2026-10-11.json", "utf8")),
  ...JSON.parse(fs.readFileSync("content/article-expansion-2026-10-14.json", "utf8")),
];
const published = new Set(
  fs.readdirSync("content/articles")
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, "")),
);

test("15 October expansion contains exactly 1,000 source-traceable subjects", () => {
  assert.equal(manifest.length, 1000);
  for (const field of ["slug", "title", "dek", "event", "mechanism", "system", "memory"]) {
    assert.equal(new Set(manifest.map((record) => record[field])).size, 1000, `${field} must be unique across the batch`);
  }
  assert.equal(new Set(manifest.map((record) => record.source.url)).size, 1000);
  assert.equal(new Set(manifest.map((record) => record.discovery.wikipediaPageId)).size, 1000);
  assert.equal(new Set(manifest.map((record) => record.discovery.wikidataId)).size, 1000);
  assert.ok(new Set(manifest.map((record) => record.discovery.category)).size >= 40, "source selection must remain broad");
  assert.deepEqual(new Set(manifest.map((record) => record.section)), new Set(["World", "Business", "Technology", "Science", "Culture", "Underreported"]));
  assert.ok(manifest.every((record) => record.discovery.wikipediaRevisionId && record.discovery.wikidataRevisionId));
  assert.ok(manifest.every((record) => record.evidencePlan.length === 3 && record.stakeholderPlan.length === 3 && record.openQuestions.length === 3));

  const oldSlugs = new Set(earlier.map((record) => record.slug));
  const oldTitles = new Set(earlier.map((record) => record.title));
  const oldSources = new Set(earlier.map((record) => record.source.url));
  assert.equal(manifest.filter((record) => oldSlugs.has(record.slug)).length, 0);
  assert.equal(manifest.filter((record) => oldTitles.has(record.title)).length, 0);
  assert.equal(manifest.filter((record) => oldSources.has(record.source.url)).length, 0);
  assert.equal(manifest.filter((record) => published.has(record.slug)).length, 0);
});

test("every 15 October manuscript is substantive, unapproved and excluded from public content", () => {
  const bodies = new Set();
  for (const record of manifest) {
    const file = path.join("content/drafts", `${record.slug}.md`);
    assert.equal(fs.existsSync(file), true, `${record.slug} draft is missing`);
    const { metadata, body } = readDraft(file);
    validateDraft(metadata, body);
    assert.equal(metadata.slug, record.slug);
    assert.equal(metadata.title, record.title);
    assert.equal(metadata.createdAt, "2026-10-15");
    assert.equal(metadata.status, "draft");
    assert.equal(metadata.author, "Unassigned — AI-assisted editorial draft");
    assert.equal(metadata.approvedBy, null);
    assert.equal(metadata.approvedAt, null);
    assert.deepEqual(metadata.completedChecks, []);
    assert.equal(metadata.sources.length, 2);
    assert.ok(metadata.sources.every((source) => source.status === "orientation-source-not-verified"));
    assert.ok(wordCount(body) >= 650, `${record.slug} must contain at least 650 words`);
    assert.match(body, /private, AI-assisted archival reconstruction plan/);
    assert.match(body, /Category membership, labels and descriptions can change; none is claim-level proof\./);
    assert.match(body, /No reachability check, generated word count, category label, metadata revision or batch test converts it into verified journalism\./);
    assert.doesNotMatch(body, /\b(?:TBD|TODO)\b|<PLACEHOLDER>|\[PLACEHOLDER\]/i);
    assert.equal(published.has(metadata.slug), false);
    bodies.add(body);
  }
  assert.equal(bodies.size, 1000);
});
