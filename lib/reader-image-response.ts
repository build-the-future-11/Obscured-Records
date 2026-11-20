import { readerImages } from "./reader-images.generated.ts";

const cacheControl = "private, no-cache, max-age=0, must-revalidate";

export function readerImageResponse(request: Request, filename: string): Response {
  const headers = new Headers({
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
    "Vary": "Cookie, Authorization",
  });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/.test(filename) || !Object.hasOwn(readerImages, filename)) {
    return new Response(request.method === "HEAD" ? null : "Image not found.", { status: 404, headers });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    headers.set("Allow", "GET, HEAD");
    return new Response("Method not allowed.", { status: 405, headers });
  }
  const image = readerImages[filename];
  const etag = `"sha256-${image.sha256}"`;
  headers.set("Content-Type", "image/webp");
  headers.set("ETag", etag);
  const conditional = request.headers.get("if-none-match");
  if (conditional?.split(",").some((candidate) => candidate.trim() === "*" || candidate.trim().replace(/^W\//, "") === etag)) {
    return new Response(null, { status: 304, headers });
  }
  headers.set("Content-Length", String(image.byteLength));
  if (request.method === "HEAD") return new Response(null, { headers });
  const bytes = Uint8Array.from(atob(image.base64), (character) => character.charCodeAt(0));
  return new Response(bytes, { headers });
}
