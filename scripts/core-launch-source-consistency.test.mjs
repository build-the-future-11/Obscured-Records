import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();

function coreQueueRows(markdown) {
  const section = markdown.match(/## Core[^\n]*\n([\s\S]*?)\n## Reserve/);
  assert.ok(section, "launch queue must contain bounded Core and Reserve sections");

  const rows = new Map();
  for (const line of section[1].split("\n")) {
    const match = line.match(/^\|\s*(\d{4})\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (!match) continue;
    assert.ok(!rows.has(match[1]), `duplicate core queue record ${match[1]}`);
    rows.set(match[1], { story: match[2].trim(), sourceCell: match[3].trim() });
  }
  return rows;
}

function sourcePassSections(markdown) {
  const sections = new Map();
  const headings = [...markdown.matchAll(/^###\s+(\d{4})\b.*$/gm)];
  for (let index = 0; index < headings.length; index += 1) {
    const start = headings[index].index;
    const end = headings[index + 1]?.index ?? markdown.length;
    sections.set(headings[index][1], markdown.slice(start, end));
  }
  return sections;
}

function articleSourceRecords(articlesDirectory) {
  const records = new Map();
  for (const filename of fs.readdirSync(articlesDirectory).filter((name) => name.endsWith(".mdx"))) {
    const raw = fs.readFileSync(path.join(articlesDirectory, filename), "utf8");
    const frontmatter = raw.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(frontmatter, `${filename} is missing frontmatter`);

    const field = (name) => frontmatter[1].match(new RegExp(`^${name}:\\s*"?([^"\\n]+)"?\\s*$`, "m"))?.[1];
    const recordId = field("recordId");
    const sourceUrl = field("sourceUrl");
    if (!recordId) continue;
    assert.ok(sourceUrl, `${filename} has no sourceUrl`);
    records.set(recordId, { filename, sourceUrl });
  }
  return records;
}

function validateCoreSourceAlignment(queueMarkdown, sourcePassMarkdown, records) {
  const queue = coreQueueRows(queueMarkdown);
  const sourcePass = sourcePassSections(sourcePassMarkdown);
  assert.deepEqual([...queue.keys()].sort(), [...sourcePass.keys()].sort(), "core queue and source-pass rosters differ");

  for (const [recordId, row] of queue) {
    const article = records.get(recordId);
    assert.ok(article, `core record ${recordId} (${row.story}) has no MDX article`);
    assert.match(
      row.sourceCell,
      new RegExp(`\\]\\(${article.sourceUrl.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\)`),
      `core record ${recordId} (${row.story}) does not link its current MDX source URL`,
    );
    assert.ok(
      sourcePass.get(recordId)?.includes(article.sourceUrl),
      `core record ${recordId} (${row.story}) source-pass section omits its current MDX source URL`,
    );
  }
}

test("source alignment validator rejects a stale core-launch source label", () => {
  const currentUrl = "https://example.invalid/current-primary";
  const staleQueue = `## Core — certify first
| Record | Story | Source | Required closure |
|---|---|---|---|
| 0407 | Minamata | WHO source basis | Approve |
## Reserve — use only after certification`;
  const sourcePass = `### 0407 — Minamata\n${currentUrl}\n`;
  const records = new Map([["0407", { filename: "minamata-food-chain.mdx", sourceUrl: currentUrl }]]);

  assert.throws(
    () => validateCoreSourceAlignment(staleQueue, sourcePass, records),
    /does not link its current MDX source URL/,
  );
});

test("core launch queue, source pass and article records use the same primary source URL", () => {
  const queue = fs.readFileSync(path.join(root, "docs", "EDITORIAL_LAUNCH_QUEUE_2026-10-01.md"), "utf8");
  const sourcePass = fs.readFileSync(path.join(root, "docs", "CORE_SOURCE_PASS_2026-10-01.md"), "utf8");
  const records = articleSourceRecords(path.join(root, "content", "articles"));

  validateCoreSourceAlignment(queue, sourcePass, records);
});
