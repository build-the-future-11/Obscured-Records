import assert from "node:assert/strict";
import { test } from "node:test";
import { isMemberId, isPortalId, portalDate, portalList, portalText, portalUrl } from "../lib/portal-contract.ts";

test("portal contract rejects malformed public profile and workflow inputs", () => {
  assert.equal(portalText("  useful research note ", 80, 5), "useful research note");
  assert.equal(portalText("short", 80, 6), null);
  assert.equal(portalText("x".repeat(81), 80), null);
  assert.deepEqual(portalList(["Research", "Research", "Archives"]), ["Research", "Archives"]);
  assert.equal(portalList(["" ]), null);
  assert.equal(portalList(new Array(13).fill("source")), null);
  assert.equal(portalUrl("https://example.org/source"), "https://example.org/source");
  assert.equal(portalUrl("http://example.org/source"), null);
  assert.equal(portalUrl("https://user:pass@example.org"), null);
  assert.ok(portalDate("2026-11-02T10:00:00Z"));
  assert.equal(portalDate("not-a-date"), null);
  assert.equal(isPortalId("c9fca575-3f1e-4dbe-af8a-1a82d9ecbb42"), true);
  assert.equal(isPortalId("../../other-member"), false);
  assert.equal(isMemberId("oai_user_opaque/subject"), true);
  assert.equal(isMemberId("bad\nsubject"), false);
});
