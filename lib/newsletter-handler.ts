import { IntakeRateLimit } from "./intake-policy.ts";
const maxRequestBytes = 4096;
const intakeBodyTimeoutMs = 5_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function intakeJson(message: string, status = 200) {
  return Response.json({ message }, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...(status === 429 ? { "Retry-After": "3600" } : {}) },
  });
}

const json = intakeJson;
export class RequestTooLarge extends Error {}

export async function readBody(request: Request, limit = maxRequestBytes) {
  const unavailable = () => new Error("Request body is unavailable.");
  if (request.signal.aborted || request.bodyUsed) {
    try { void request.body?.cancel().catch(() => {}); } catch {}
    throw unavailable();
  }
  if (!request.body) return "";
  const reader = request.body.getReader();
  let interrupt: () => void = () => {};
  let interrupted = false;
  const interruption = new Promise<never>((_, reject) => {
    interrupt = () => { interrupted = true; reject(unavailable()); };
  });
  // Cover an abort between listener registration and the first pending read.
  void interruption.catch(() => {});
  const timer = setTimeout(interrupt, intakeBodyTimeoutMs);
  request.signal.addEventListener("abort", interrupt, { once: true });
  if (request.signal.aborted) interrupt();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      if (interrupted) throw unavailable();
      const { done, value } = await Promise.race([reader.read(), interruption]);
      if (interrupted) throw unavailable();
      if (done) break;
      if (!(value instanceof Uint8Array)) throw unavailable();
      size += value.byteLength;
      if (size > limit) throw new RequestTooLarge();
      if (!value.byteLength) {
        // Empty synchronous chunks must yield to the abort/deadline callbacks.
        await Promise.race([new Promise<void>((resolve) => setTimeout(resolve, 0)), interruption]);
        continue;
      }
      chunks.push(new Uint8Array(value));
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", interrupt);
    chunks.length = 0;
    // An untrusted source's cancellation hook must not extend the deadline.
    try { void reader.cancel().catch(() => {}); } catch {}
    try { reader.releaseLock(); } catch {}
  }
}

/** Compare the browser's origin with the actual request authority. Next.js may
 * reconstruct request.url with an internal hostname. Never trust forwarded-host
 * headers supplied by an arbitrary caller, or accept an origin by substring. */
export function isSameOriginSignup(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  // Preserve non-browser clients; this public endpoint does not authenticate users.
  if (origin === null) return true;
  try {
    const source = new URL(origin);
    if (!["http:", "https:"].includes(source.protocol) || source.origin !== origin) return false;
    const target = new URL(request.url);
    const host = request.headers.get("host");
    if (host !== null) {
      if (!host || /[\s,\\/@?#]/.test(host)) return false;
      const authority = new URL(`${target.protocol}//${host}`);
      if (authority.username || authority.password || authority.pathname !== "/") return false;
      return source.origin === authority.origin;
    }
    return source.origin === target.origin;
  } catch {
    return false;
  }
}

export function createNewsletterHandler(save: (email: string) => Promise<unknown>) {
  return async (request: Request): Promise<Response> => {
    const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
    if (mediaType !== "application/json") return json("Send newsletter signups as JSON.", 415);

    if (!isSameOriginSignup(request)) {
      return json("Submit this form from the publication website.", 403);
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength !== null) {
      if (!/^\d+$/.test(contentLength)) return json("Send a valid signup request.", 400);
      if (Number(contentLength) > maxRequestBytes) return json("Signup request is too large.", 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(await readBody(request));
    } catch (error) {
      return error instanceof RequestTooLarge
        ? json("Signup request is too large.", 413)
        : json("Send a valid signup request.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json("Send a valid signup request.", 400);
    }
    const fields = body as Record<string, unknown>;
    if (fields.website !== undefined && typeof fields.website !== "string") {
      return json("Send a valid signup request.", 400);
    }
    // Preserve the existing honeypot response without writing subscriber data.
    if (typeof fields.website === "string" && fields.website.trim()) return json("You are on the list.");

    if (fields.consent !== true) return json("Confirm that your email may be stored for the newsletter waitlist.", 400);
    const email = typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
    const hasControlCharacter = Array.from(email).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
    if (email.length > 254 || hasControlCharacter || !emailPattern.test(email)) return json("Enter a valid email address.", 400);
    try {
      await save(email);
      // Persistence is not evidence that an email was sent or delivered.
      return json("Your waitlist request has been saved. Email delivery is not enabled; you have not been added to an active mailing list.");
    } catch (error) {
      if (error instanceof IntakeRateLimit) return json("Too many requests. Please try again in an hour.", 429);
      // Do not log email addresses, request bodies, or provider exceptions.
      console.error("Newsletter persistence unavailable.");
      return json("Waitlist signups are temporarily unavailable. Please try again shortly.", 503);
    }
  };
}
