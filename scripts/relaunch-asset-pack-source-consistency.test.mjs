import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();

function frontmatterField(markdown, name) {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(frontmatter, "article must contain frontmatter");
  const value = frontmatter[1].match(new RegExp(`^${name}:\\s*"([^"]+)"\\s*$`, "m"))?.[1];
  assert.ok(value, `article frontmatter must contain ${name}`);
  return value;
}

function briefSection(markdown) {
  const section = markdown.match(/## 3\. Obscured Brief issue 0001[\s\S]*?(?=\n## 4\.)/);
  assert.ok(section, "asset pack must contain a bounded Obscured Brief issue 0001 section");
  return section[0];
}

function validateBriefSource(articleMarkdown, assetPackMarkdown) {
  const source = frontmatterField(articleMarkdown, "source");
  const sourceUrl = frontmatterField(articleMarkdown, "sourceUrl");
  const brief = briefSection(assetPackMarkdown);

  assert.ok(
    brief.includes(`[${source}](${sourceUrl})`),
    "brief source anchor must link the exact current article source and URL",
  );
  assert.doesNotMatch(
    brief,
    /FBI Vault record already retained by the canonical article record/,
    "brief must not claim that the superseded FBI catalogue is the current canonical article source",
  );
}

test("validator rejects the reproduced stale FedEx source-anchor claim", () => {
  const article = `---\nsource: "Court record"\nsourceUrl: "https://example.invalid/court"\n---\n`;
  const assetPack = `## 3. Obscured Brief issue 0001 — private dry run\n\n- Source anchor: FBI Vault record already retained by the canonical article record.\n\n## 4. Audio`;

  assert.throws(
    () => validateBriefSource(article, assetPack),
    /exact current article source and URL|superseded FBI catalogue/,
  );
});

test("FedEx dry-run brief stays aligned with the canonical article source", () => {
  const article = fs.readFileSync(path.join(root, "content", "articles", "fedex-flight-705.mdx"), "utf8");
  const assetPack = fs.readFileSync(path.join(root, "docs", "RELAUNCH_ASSET_PACK.md"), "utf8");

  validateBriefSource(article, assetPack);
});
