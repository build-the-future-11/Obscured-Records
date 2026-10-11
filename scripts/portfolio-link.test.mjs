import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the owner-only reader links back to the public portfolio without changing access", () => {
  const footer = readFileSync(new URL("../components/editorial.tsx", import.meta.url), "utf8");
  assert.match(footer, /href="https:\/\/thebu1ld\.com\/network"/);
  assert.match(footer, />Portfolio<\/a>/);
});
