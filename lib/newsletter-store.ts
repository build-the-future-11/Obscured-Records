import { enforceIntakeLimit } from "./intake-policy.ts";
type NewsletterDatabase = {
  prepare(sql: string): {
    bind(...values: unknown[]): { run(): Promise<{ success: boolean }> };
  };
};

/** Keep runtime discovery lazy: importing a route must not require Workers. */
export function createNewsletterStore(
  loadDatabase: () => Promise<NewsletterDatabase | undefined>,
) {
  return async (email: string) => {
    const database = await loadDatabase();
    if (!database) throw new Error("Newsletter storage is unavailable.");
    const result = await database.prepare(`
      INSERT INTO newsletter_subscribers (email, status, consented_at, source)
      VALUES (?, 'pending_confirmation', ?, 'website')
      ON CONFLICT(email) DO UPDATE SET
        status = CASE WHEN newsletter_subscribers.status IN ('active', 'unsubscribed', 'suppressed', 'bounced', 'complained') THEN newsletter_subscribers.status ELSE 'pending_confirmation' END,
        consented_at = excluded.consented_at
    `).bind(email, new Date().toISOString()).run();
    if (!result.success) throw new Error("Newsletter storage did not confirm the write.");
  };
}

export const saveNewsletterSubscriber = createNewsletterStore(async () => {
  // D1 is a Workers binding, not a Node/Vercel environment variable. Do not
  // replace it with in-memory storage or claim success when it is absent.
  const { env } = await import("cloudflare:workers");
  return env.DB;
});

export async function saveLimitedNewsletterSubscriber(email: string) {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Newsletter storage is unavailable.");
  await enforceIntakeLimit(env.DB, email, "newsletter");
  return createNewsletterStore(async () => env.DB)(email);
}
