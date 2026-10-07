import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { render } from "../content/research/times-beach-sequence/generate.mjs";

const dataUrl = new URL("../content/research/times-beach-sequence/timeline.json", import.meta.url);
const svgUrl = new URL("../content/research/times-beach-sequence/timeline.svg", import.meta.url);

const requiredDates = [
  "Early 1970s",
  "November 1982",
  "December 1982",
  "22 February 1983",
  "1990",
  "1996–1997",
  "1999–2001",
  "2012",
];

test("timeline data is source-located and keeps review gates explicit", async () => {
  const data = JSON.parse(await readFile(dataUrl, "utf8"));

  assert.equal(data.sourceBaseSha, "e8c57da72514b666c9dadf1e92a07f5d6380dc7f");
  assert.equal(data.source.url, "https://www.epa.gov/mo/town-flood-and-superfund-looking-back-times-beach-disaster-nearly-40-years-later");
  assert.equal(data.source.checkedAt, "2026-10-02");
  assert.deepEqual(data.events.map(({ date }) => date), requiredDates);
  assert.equal(new Set(data.events.map(({ sourceLocator }) => sourceLocator)).size, data.events.length);
  assert.ok(data.events.every(({ sourceLocator }) => /^EPA retrospective, lines \d+–\d+$/.test(sourceLocator)));
  assert.match(data.caption, /Equal spacing and box size do not encode elapsed time/);
  assert.match(data.caption, /AI source review is not human editorial approval/);
});

test("generated SVG is byte-identical and accessible", async () => {
  const data = JSON.parse(await readFile(dataUrl, "utf8"));
  const committed = await readFile(svgUrl, "utf8");

  assert.equal(render(data), committed);
  assert.match(committed, /role="img" aria-labelledby="title desc"/);
  assert.match(committed, /<title id="title">/);
  assert.match(committed, /<desc id="desc">/);
  assert.equal((committed.match(/<g aria-label=/g) ?? []).length, data.events.length);
});

test("diagram does not introduce unsupported causal or quantitative encodings", async () => {
  const data = JSON.parse(await readFile(dataUrl, "utf8"));
  const svg = await readFile(svgUrl, "utf8");
  const combined = `${data.caption}\n${svg}`;

  assert.doesNotMatch(combined, /caused Superfund|proved safe|zero risk|fully restored/i);
  assert.match(combined, /do not encode elapsed time, contamination level, risk, cost, causal weight or policy effectiveness/);
  assert.doesNotMatch(svg, /<image\b|href=|data:image/i);
});
