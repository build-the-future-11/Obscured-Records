import { IntakeRateLimit } from "./intake-policy.ts";
const maxRequestBytes = 4096;
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
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        // Do not wait for an untrusted stream's cancellation hook.
        void reader.cancel().catch(() => {});
        throw new RequestTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
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

export function createNewsletterHandler(\n  save: (email: string) => Promise<unknown>,\n  sendConfirmation?: (email: string) => Promise<boolean>,\n) {
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
    let shouldSend: unknown;
    try {
      shouldSend = await save(email);
    } catch (error) {
      if (error instanceof IntakeRateLimit) return json("Too many requests. Please try again in an hour.", 429);
      // Do not log email addresses, request bodies, or provider exceptions.
      console.error("Newsletter persistence unavailable.");
      return json("Newsletter signups are temporarily unavailable. Please try again shortly.", 503);
    }

    // A false result means the address is already active or protected by an
    // unsubscribe/suppression state. Do not send and do not reveal which state.
    if (shouldSend === false) return json("Your newsletter preference is already recorded.");

    if (sendConfirmation) {
      try {
        if (await sendConfirmation(email)) {
          return json("Check your inbox to confirm your Obscured Records subscription. No newsletter will be sent until you confirm.");
        }
      } catch {
        // The consented request remains pending so a later retry can resend.
        console.error("Newsletter confirmation delivery unavailable.");
        return json("Your request was saved, but the confirmation email could not be sent. Please try again later.", 503);
      }
    }

    // Persistence is not evidence that an email was sent or delivered.
    return json("Your waitlist request has been saved. Email delivery is not enabled; you have not been added to an active mailing list.");
  };
}
