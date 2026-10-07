import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();
const article = fs.readFileSync(path.join(root, "content/articles/satyam-confession.mdx"), "utf8");
const registryLine = fs.readFileSync(path.join(root, "lib/articles.ts"), "utf8")
  .split("\n")
  .find((line) => line.includes('slug:"satyam-confession"'));
const claimMap = fs.readFileSync(path.join(root, "docs/reviews/SATYAM_CLAIM_MAP_2026-10-01.md"), "utf8");

const sources = [
  "https://www.sec.gov/Archives/edgar/data/1106056/000114554909000025/u00107exv99w2.htm",
  "https://www.sebi.gov.in/web/?file=%2Fsebi_data%2Fattachdocs%2F1404444629445.pdf",
  "https://www.sec.gov/Archives/edgar/containers/fix061/1106056/000114554909000039/u00110exv99w4.htm",
  "https://www.sec.gov/newsroom/press-releases/2011-81-sec-charges-satyam-computer-services-financial-fraud",
];

test("Satyam packet binds the article, registry and claim map to the same official records", () => {
  assert.ok(registryLine, "Satyam registry entry is missing");
  for (const source of sources) {
    assert.ok(article.includes(source), `article omits ${source}`);
    assert.ok(registryLine.includes(source), `registry omits ${source}`);
    assert.ok(claimMap.includes(source), `claim map omits ${source}`);
  }
  assert.match(article, /updated: "2026-10-01"/);
  assert.match(registryLine, /updated:"1 Oct 2026"/);
});

test("Satyam copy preserves admission, allegation and settlement boundaries", () => {
  assert.match(article, /Those figures are admissions in the letter, not an independent audit\./);
  assert.match(article, /the SEC alleged/);
  assert.match(article, /without admitting or denying the allegations/);
  assert.doesNotMatch(article, /investor backlash/);
  assert.doesNotMatch(article, /India dissolved the board/);
});
