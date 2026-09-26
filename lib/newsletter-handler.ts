const maxRequestBytes = 4096;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(message: string, status = 200) {
  return Response.json({ message }, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

class RequestTooLarge extends Error {}

async function readBody(request: Request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxRequestBytes) {
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

export function createNewsletterHandler(save: (email: string) => Promise<unknown>) {
  return async (request: Request): Promise<Response> => {
    const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
    if (mediaType !== "application/json") return json("Send newsletter signups as JSON.", 415);

    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
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

    const email = typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
    const hasControlCharacter = Array.from(email).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
    if (email.length > 254 || hasControlCharacter || !emailPattern.test(email)) return json("Enter a valid email address.", 400);
    try {
      await save(email);
      // Persistence is not evidence that an email was sent or delivered.
      return json("Your signup has been saved.");
    } catch {
      // Do not log email addresses, request bodies, or provider exceptions.
      console.error("Newsletter persistence unavailable.");
      return json("Subscriptions are temporarily unavailable. Please try again shortly.", 503);
    }
  };
}
