import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import test from "node:test";

const requireFromMiniflare = createRequire(import.meta.resolve("miniflare"));
const requireFromVinext = createRequire(import.meta.resolve("vinext"));

test("the Workers image dependencies render SVG and read the resulting PNG dimensions", async () => {
  const sharp = requireFromMiniflare("sharp");
  const { imageSize } = requireFromVinext("image-size");
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="#007d85"/></svg>');
  const png = await sharp(svg).resize(2, 2).png().toBuffer();
  assert.deepEqual(imageSize(png), { width: 2, height: 2, type: "png" });
});

test("a zero-length ICNS image entry is rejected without stalling the parser", () => {
  // A regressed parser can loop and allocate indefinitely. Keep that failure
  // in a subprocess with a memory limit and a hard deadline.
  const result = spawnSync(process.execPath, [
    "--max-old-space-size=64",
    "--input-type=commonjs",
    "--eval",
    `
      const assert = require("node:assert/strict");
      const { imageSize } = require(process.argv[1]);
      const invalid = Buffer.alloc(16);
      invalid.write("icns", 0, "ascii");
      invalid.writeUInt32BE(16, 4);
      invalid.write("ic07", 8, "ascii");
      invalid.writeUInt32BE(0, 12);
      assert.throws(() => imageSize(invalid), TypeError);
    `,
    requireFromVinext.resolve("image-size"),
  ], { encoding: "utf8", timeout: 5000, maxBuffer: 64 * 1024 });

  assert.ifError(result.error);
  assert.equal(result.status, 0, `ICNS parser failed or did not terminate: ${result.signal ?? ""}\n${result.stderr}`);
});
