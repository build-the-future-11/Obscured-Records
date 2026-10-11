import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { editorialInbox } from "./editorial-inbox.mjs";

test("private editorial desk exposes every manuscript without publishing it", () => {
  const rows = editorialInbox();
  assert.equal(rows.length, 42);
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
  assert.equal(drafts.filter((slug) => articles.has(slug)).length, 20);
  assert.equal(drafts.filter((slug) => !articles.has(slug)).length, 22);
});
