import assert from "node:assert/strict";
import { test } from "node:test";
import { getCatalog } from "../lib/catalog.ts";
import { deskSlugs, editorialDesks, getDesk } from "../lib/desks.ts";

test("relaunch desks have unique routes and use only public archive records", () => {
  const publicSlugs = new Set(getCatalog().map((story) => story.slug));
  assert.deepEqual(deskSlugs, ["editorial", "originals", "investigations"]);
  assert.equal(new Set(deskSlugs).size, editorialDesks.length);
  for (const desk of editorialDesks) {
    assert.equal(getDesk(desk.slug), desk);
    assert.ok(desk.mandate.length >= 3);
    assert.ok(desk.questions.length >= 3);
    assert.ok(desk.archiveSlugs.length >= 4);
    assert.equal(new Set(desk.archiveSlugs).size, desk.archiveSlugs.length);
    for (const slug of desk.archiveSlugs) assert.ok(publicSlugs.has(slug), `${desk.slug} references non-public record ${slug}`);
  }
  assert.equal(getDesk("../editorial"), undefined);
  assert.equal(getDesk("review"), undefined);
});
