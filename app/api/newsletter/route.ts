import { saveNewsletterSubscriber } from "@/lib/newsletter-store";

export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown; website?: unknown };
    if (typeof body.website === "string" && body.website.trim()) {
      return Response.json({ message: "You are on the list." });
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!emailPattern.test(email) || email.length > 254) {
      return Response.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    await saveNewsletterSubscriber(email);
    return Response.json({ message: "You are on the list. The first brief will arrive by email." });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return Response.json({ message: "Subscriptions are temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
