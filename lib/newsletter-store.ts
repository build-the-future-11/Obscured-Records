import { env } from "cloudflare:workers";

export async function saveNewsletterSubscriber(email: string) {
  if (!env.DB) throw new Error("D1 binding is unavailable");
  return env.DB.prepare(`
    INSERT INTO newsletter_subscribers (email, status, consented_at, source)
    VALUES (?, 'active', ?, 'website')
    ON CONFLICT(email) DO UPDATE SET status = 'active', consented_at = excluded.consented_at
  `).bind(email, new Date().toISOString()).run();
}
