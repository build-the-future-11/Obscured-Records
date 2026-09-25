import { saveNewsletterSubscriber } from "@/lib/newsletter-store";

export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxRequestBytes = 4096;
const noStoreHeaders = { "cache-control": "no-store" };

function json(message: string, status = 200) {
  return Response.json({ message }, { status, headers: noStoreHeaders });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return json("Send newsletter signups as JSON.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxRequestBytes) {
    return json("Signup request is too large.", 413);
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maxRequestBytes) {
      return json("Signup request is too large.", 413);
    }

    let body: { email?: unknown; website?: unknown };
    try {
      body = JSON.parse(rawBody) as { email?: unknown; website?: unknown };
    } catch {
      return json("Send a valid signup request.", 400);
    }

    if (typeof body.website === "string" && body.website.trim()) {
      return json("You are on the list.");
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!emailPattern.test(email) || email.length > 254) {
      return json("Enter a valid email address.", 400);
    }

    await saveNewsletterSubscriber(email);
    return json("You are on the list.");
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return json("Subscriptions are temporarily unavailable. Please try again shortly.", 503);
  }
}
