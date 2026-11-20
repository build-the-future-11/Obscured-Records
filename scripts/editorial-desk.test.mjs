import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { editorialInbox } from "./editorial-inbox.mjs";
import { compareEditorialPriority, editorialOpenWork, editorialProgress, editorialStage, paginateEditorialQueue } from "../lib/editorial-queue.ts";

test("private editorial desk exposes every manuscript without publishing it", () => {
  const rows = editorialInbox();
  const draftCount = fs.readdirSync("content/drafts").filter((file) => file.endsWith(".md")).length;
  assert.equal(rows.length, draftCount);
  assert.ok(rows.length > 0);
  assert.equal(rows.filter((row) => row.state === "approved").length, 0);
  assert.equal(rows.filter((row) => row.sourceReview.verified > 0).length, 0);
  const route = fs.readFileSync("app/editorial/page.tsx", "utf8");
  const draftRoute = fs.readFileSync("app/editorial/draft/[slug]/page.tsx", "utf8");
  assert.match(route, /requireEditorialOwner/);
  assert.match(route, /index: false, follow: false/);
  assert.match(draftRoute, /PRIVATE DRAFT \/ NOT PUBLISHED/);
  assert.match(draftRoute, /requireEditorialOwner/);
});

test("generated desk keeps new and archival manuscripts distinct", () => {
  const articles = new Set(fs.readdirSync("content/articles").filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, "")));
  const drafts = fs.readdirSync("content/drafts").filter((file) => file.endsWith(".md")).map((file) => file.replace(/\.md$/, ""));
  const archival = drafts.filter((slug) => articles.has(slug));
  const unpublished = drafts.filter((slug) => !articles.has(slug));
  assert.equal(archival.length + unpublished.length, drafts.length);
  assert.ok(archival.length > 0);
  assert.ok(unpublished.length > 0);
});

test("review queue progress and stages preserve evidence boundaries", () => {
  const base = { slug: "record", title: "Record", dek: "", section: "World", status: "review", tags: [], words: 500, publishedInArchive: false, sourceCount: 2, verifiedSources: 0, totalChecks: 3, completedChecks: 0, approvedBy: null };
  assert.equal(editorialStage(base), "Evidence review open");
  assert.equal(editorialOpenWork(base), 6);
  assert.equal(editorialProgress(base), 0);
  const checked = { ...base, verifiedSources: 2, completedChecks: 3 };
  assert.equal(editorialStage(checked), "Human approval open");
  assert.equal(editorialOpenWork(checked), 1);
  assert.equal(editorialProgress(checked), 83);
  const approved = { ...checked, status: "approved", approvedBy: "Named editor" };
  assert.equal(editorialStage(approved), "Approval recorded");
  assert.equal(editorialProgress(approved), 100);
});

test("review priority is deterministic and favors new records with less open work", () => {
  const base = { slug: "a", title: "Zulu", dek: "", section: "World", status: "review", tags: [], words: 500, publishedInArchive: false, sourceCount: 1, verifiedSources: 0, totalChecks: 1, completedChecks: 0, approvedBy: null };
  const fewer = { ...base, slug: "b", title: "Beta", completedChecks: 1 };
  const archival = { ...fewer, slug: "c", title: "Alpha", publishedInArchive: true };
  assert.deepEqual([base, archival, fewer].sort(compareEditorialPriority).map((item) => item.slug), ["b", "a", "c"]);
});


test("held and revoked approvals cannot count as approval or take queue priority", () => {
  const reviewed = { slug: "reviewed", title: "Review", status: "review", publishedInArchive: false, sourceCount: 2, verifiedSources: 2, totalChecks: 3, completedChecks: 3, approvedBy: "Stale editor" };
  assert.equal(editorialStage(reviewed), "Human approval open");
  assert.equal(editorialProgress(reviewed), 83);
  const held = { ...reviewed, slug: "held", status: "held" };
  assert.equal(editorialStage(held), "On hold");
  assert.deepEqual([held, reviewed].sort(compareEditorialPriority).map(row => row.slug), ["reviewed", "held"]);
});

test("queue pages cover all 3245 drafts without duplicate or unbounded rendering", () => {
  const items = Array.from({length: 3245}, (_, index) => index);
  const collected = [];
  for (let page = 1; page <= 91; page++) {
    const result = paginateEditorialQueue(items, page);
    assert.ok(result.items.length <= 36);
    collected.push(...result.items);
  }
  assert.deepEqual(collected, items);
  assert.equal(paginateEditorialQueue(items, Infinity).page, 1);
  assert.equal(paginateEditorialQueue(items, -1).page, 1);
  assert.equal(paginateEditorialQueue(items, 999).page, 91);
  assert.deepEqual(paginateEditorialQueue([], 90), {page:1, totalPages:1, start:0, end:0, items:[]});
  assert.equal(paginateEditorialQueue(["filtered"], 91).page, 1);
});
