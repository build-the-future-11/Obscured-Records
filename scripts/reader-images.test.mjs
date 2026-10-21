import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { readerImages } from "../lib/reader-images.generated.ts";
import { readerImageResponse } from "../lib/reader-image-response.ts";
import { displayCover, mediaHolds, readerImagePath, readerImageSources } from "../lib/media-policy.ts";

const expected = ["apollo-1-illustration-480.webp", "apollo-1-illustration-960.webp", "apollo-1-illustration.webp", "fedex-705-480.webp", "fedex-705-960.webp", "fedex-705.webp", "goiania-source-480.webp", "goiania-source-960.webp", "goiania-source.webp", "ixtoc-1-illustration-480.webp", "ixtoc-1-illustration-960.webp", "ixtoc-1-illustration.webp", "lake-nyos-480.webp", "lake-nyos.webp", "therac-25-480.webp", "therac-25.webp", "triangle-factory-illustration-480.webp", "triangle-factory-illustration-960.webp", "triangle-factory-illustration.webp", "wirecard-480.webp", "wirecard-960.webp", "wirecard.webp"];
const request = (filename, options) => new Request(`https://publication.example/media/${filename}`, options);

test("reader image projection contains exactly the reviewed filenames", () => {
  assert.deepEqual(Object.keys(readerImages).sort(), expected);
  assert.deepEqual(fs.readdirSync(new URL("../public/", import.meta.url)).filter((file) => file.endsWith(".webp")).sort(), expected);
});

for (const filename of expected) test(`typed image response preserves every source byte: ${filename}`, async () => {
  const source = fs.readFileSync(new URL(`../public/${filename}`, import.meta.url));
  const digest = createHash("sha256").update(source).digest("hex");
  const image = readerImages[filename];
  assert.equal(image.sha256, digest);
  assert.equal(image.byteLength, source.length);
  assert.deepEqual(Buffer.from(image.base64, "base64"), source);
  const response = readerImageResponse(request(filename), filename);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("content-length"), String(source.length));
  assert.equal(response.headers.get("etag"), `"sha256-${digest}"`);
  assert.equal(response.headers.get("cache-control"), "private, no-cache, max-age=0, must-revalidate");
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), source);
});

test("conditional requests return bodyless 304 for strong, weak, list and wildcard validators", async () => {
  const filename = expected[0];
  const etag = readerImageResponse(request(filename), filename).headers.get("etag");
  for (const value of [etag, `W/${etag}`, `"other", W/${etag}`, "*"]) {
    const response = readerImageResponse(request(filename, { headers: { "If-None-Match": value } }), filename);
    assert.equal(response.status, 304);
    assert.equal(response.headers.get("etag"), etag);
    assert.match(response.headers.get("cache-control"), /^private,/);
    assert.equal(response.headers.get("content-length"), null);
    assert.equal((await response.arrayBuffer()).byteLength, 0);
  }
  assert.equal(readerImageResponse(request(filename, { headers: { "If-None-Match": '"stale"' } }), filename).status, 200);
});

test("HEAD returns representation metadata without bytes", async () => {
  for (const filename of expected) {
    const response = readerImageResponse(request(filename, { method: "HEAD" }), filename);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/webp");
    assert.equal(response.headers.get("content-length"), String(readerImages[filename].byteLength));
    assert.equal((await response.arrayBuffer()).byteLength, 0);
  }
});

test("unknown, inherited, traversal and encoded names never select an image", async () => {
  for (const filename of ["unknown.webp", "constructor", "__proto__", "toString", "../fedex-705.webp", "/fedex-705.webp", "%2e%2e%2ffedex-705.webp", "fedex-705.webp?x=1", "fedex-705.webp\u0000", "Fedex-705.webp"]) {
    const response = readerImageResponse(request("unknown.webp", { headers: { "If-None-Match": "*" } }), filename);
    assert.equal(response.status, 404, filename);
    assert.notEqual(response.headers.get("content-type"), "image/webp");
    assert.equal(response.headers.get("etag"), null);
  }
  const head = readerImageResponse(request("unknown.webp", { method: "HEAD" }), "unknown.webp");
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  assert.equal(readerImageResponse(request(expected[0], { method: "POST" }), expected[0]).status, 405);
});

test("reader and shared cover projections use typed URLs without mutating source inventory or holds", () => {
  const source = { slug: "fedex-flight-705", cover: "/fedex-705.webp" };
  assert.equal(displayCover(source), "/media/fedex-705.webp");
  assert.equal(source.cover, "/fedex-705.webp");
  for (const [slug, cover] of [["therac-25", "/therac-25.webp"], ["wirecard-missing-billions", "/wirecard.webp"], ["lake-nyos", "/lake-nyos.webp"]]) {
    assert.ok(mediaHolds[slug]);
    assert.equal(displayCover({ slug, cover }), undefined);
  }
  assert.equal(displayCover({ slug: "no-cover" }), undefined);
  assert.equal(readerImagePath("/share-card.png"), "/share-card.png");
  assert.equal(readerImagePath("/media/fedex-705.webp"), "/media/fedex-705.webp");
});

test("responsive display sources preserve dimensions and resolve exclusively to allowed typed variants", () => {
  for (const [filename, width, height] of [["apollo-1-illustration.webp", 1536, 1024], ["ixtoc-1-illustration.webp", 1536, 1024], ["triangle-factory-illustration.webp", 1536, 1024], ["fedex-705.webp", 1280, 853], ["wirecard.webp", 1800, 1199], ["goiania-source.webp", 1403, 1174], ["lake-nyos.webp", 532, 402], ["therac-25.webp", 850, 1138]]) {
    const projection = readerImageSources(`/${filename}`);
    assert.deepEqual(readerImageSources(`/media/${filename}`), projection);
    assert.equal(projection.src, `/media/${filename}`);
    assert.equal(projection.width, width); assert.equal(projection.height, height);
    const variants = projection.srcSet.split(", ").map((entry) => entry.split(" ")[0]);
    assert.equal(variants.length, width > 960 ? 3 : 2);
    for (const uri of variants) { assert.ok(uri.startsWith("/media/")); assert.ok(Object.hasOwn(readerImages, uri.slice("/media/".length))); }
  }
  assert.deepEqual(readerImageSources("/share-card.png"), { src: "/share-card.png", srcSet: undefined, width: undefined, height: undefined });
  assert.equal(readerImageSources("__proto__").srcSet, undefined);
});
