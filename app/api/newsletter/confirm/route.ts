import { readNewsletterToken, newsletterTokenSecret } from "@/lib/newsletter-tokens";
import { confirmNewsletterSubscriber } from "@/lib/newsletter-store";

export const dynamic = "force-dynamic";

function redirect(path: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: path,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const secret = newsletterTokenSecret(process.env);
  if (!token || !secret) return redirect("/newsletter/problem");
  const email = await readNewsletterToken(token, "confirm", secret);
  if (!email) return redirect("/newsletter/problem");
  try {
    return redirect(await confirmNewsletterSubscriber(email) ? "/newsletter/confirmed" : "/newsletter/problem");
  } catch {
    console.error("Newsletter confirmation persistence unavailable.");
    return redirect("/newsletter/problem");
  }
}
