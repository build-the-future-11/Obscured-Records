import test from "node:test";
import assert from "node:assert/strict";
import { boundedText, digestFrequencies, isIsoDate, isOneOf, isReadingState, isSlug, readerSizes, readerThemes } from "../lib/member-contract.ts";

test("member records accept bounded canonical values", () => {
  assert.equal(isSlug("fedex-flight-705"), true);
  assert.equal(isReadingState("Finished"), true);
  assert.equal(isOneOf("weekly", digestFrequencies), true);
  assert.equal(isOneOf("larger", readerSizes), true);
  assert.equal(isOneOf("dark", readerThemes), true);
  assert.equal(isIsoDate("2026-10-10T18:00:00.000Z"), true);
});

test("member records reject traversal, invented states and oversized private text", () => {
  assert.equal(isSlug("../draft"), false);
  assert.equal(isReadingState("Paid"), false);
  assert.equal(isOneOf("daily", digestFrequencies), false);
  assert.equal(boundedText("x".repeat(501), 500), null);
  assert.equal(isIsoDate("not-a-date"), false);
});
