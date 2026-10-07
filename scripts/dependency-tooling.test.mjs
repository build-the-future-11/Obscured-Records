import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";

test("the Drizzle compatibility loader preserves typed exports and source maps", async () => {
  process.env.ESBK_DISABLE_CACHE = "1";
  const requireTooling = createRequire(import.meta.url);
  const { transform, transformSync } = requireTooling("@esbuild-kit/core-utils");
  const source = "type Entry = { value: number }; const entry: Entry = { value: 42 }; export const result = entry.value;";

  const esm = await transform(source, "/dependency-fixture.mts");
  const loaded = await import(`data:text/javascript;base64,${Buffer.from(esm.code).toString("base64")}`);
  assert.equal(loaded.result, 42);
  assert.ok(esm.map.sources.some((name) => name.endsWith("dependency-fixture.mts")));

  const cjs = transformSync(source, "/dependency-fixture.cts");
  const loadedCjs = { exports: {} };
  runInNewContext(cjs.code, { module: loadedCjs, exports: loadedCjs.exports });
  assert.equal(loadedCjs.exports.result, 42);
  assert.ok(cjs.map.sources.some((name) => name.endsWith("dependency-fixture.cts")));
});
