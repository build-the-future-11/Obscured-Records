import { createNewsletterToken, newsletterTokenSecret } from "./newsletter-tokens.ts";

type Environment = Record<string, string | undefined>;
type DeliveryConfig = {
  apiKey: string;
  fromEmail: string;
  siteOrigin: string;
  tokenSecret: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const unavailable = () => new Error("Newsletter delivery is unavailable.");

export function newsletterDeliveryConfig(env: Environment = process.env): DeliveryConfig | undefined {
  const enabled = env.NEWSLETTER_DELIVERY_ENABLED;
  if (!enabled || enabled === "false") return undefined;
  if (enabled !== "true") throw unavailable();

  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.NEWSLETTER_FROM_EMAIL?.trim().toLowerCase();
  const rawOrigin = env.NEWSLETTER_SITE_ORIGIN;
  const tokenSecret = newsletterTokenSecret(env);
  if (!apiKey || apiKey.length < 12 || /[\s\x00-\x1f\x7f]/.test(apiKey) || !fromEmail || !emailPattern.test(fromEmail) || !rawOrigin || !tokenSecret) {
    throw unavailable();
  }

  let siteOrigin: string;
  try {
    const parsed = new URL(rawOrigin);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) throw unavailable();
    siteOrigin = parsed.origin;
  } catch {
    throw unavailable();
  }
  return { apiKey, fromEmail, siteOrigin, tokenSecret };
}

export function newsletterDeliveryConfigured(env: Environment = process.env) {
  try { return Boolean(newsletterDeliveryConfig(env)); } catch { return false; }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] ?? character));
}

export async function sendNewsletterConfirmation(
  email: string,
  config = newsletterDeliveryConfig(),
  send: typeof fetch = fetch,
  now = Date.now(),
): Promise<boolean> {
  if (!config) return false;
  const confirmation = await createNewsletterToken(email, "confirm", config.tokenSecret, now + 48 * 60 * 60 * 1000);
  const unsubscribe = await createNewsletterToken(email, "unsubscribe", config.tokenSecret, now + 10 * 365 * 24 * 60 * 60 * 1000);
  const confirmUrl = `${config.siteOrigin}/api/newsletter/confirm?token=${encodeURIComponent(confirmation)}`;
  const unsubscribeUrl = `${config.siteOrigin}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribe)}`;
  const text = [
    "Confirm your Obscured Records newsletter subscription",
    "",
    "Confirm: " + confirmUrl,
    "",
    "If you did not request this, no newsletter will be sent unless the address is confirmed.",
    "Decline/unsubscribe: " + unsubscribeUrl,
  ].join("\n");
  const html = `<p>Confirm your Obscured Records newsletter subscription.</p><p><a href="${escapeHtml(confirmUrl)}">Confirm subscription</a></p><p>If you did not request this, no newsletter will be sent unless the address is confirmed.</p><p><a href="${escapeHtml(unsubscribeUrl)}">Decline or unsubscribe</a></p>`;

  let response: Response;
  try {
    response = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: config.fromEmail, to: [email], subject: "Confirm your Obscured Records subscription", text, html }),
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw unavailable();
  }
  if (!response.ok) throw unavailable();
  try {
    const payload = await response.json() as { id?: unknown };
    if (typeof payload.id !== "string" || !payload.id) throw unavailable();
  } catch {
    throw unavailable();
  }
  return true;
}
