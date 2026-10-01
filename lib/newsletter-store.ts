import { loadIntakeDatabase } from "./intake-database.ts";
import { enforceIntakeLimit } from "./intake-policy.ts";

type NewsletterDatabase = {
  prepare(sql: string): {
    bind(...values: unknown[]): { run(): Promise<{ success: boolean; meta?: { changes?: number } }> };
  };
};

function confirmedChanges(result: { success: boolean; meta?: { changes?: number } }) {
  const changes = result.meta?.changes;
  if (!result.success || !Number.isSafeInteger(changes) || (changes as number) < 0) {
    throw new Error("Newsletter storage did not confirm the write.");
  }
  return changes as number;
}

/** Capture a consented signup without overriding active or protected states.
 * Returns true only when a confirmation may be sent. */
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
        consented_at = excluded.consented_at
      WHERE newsletter_subscribers.status = 'pending_confirmation'
    `).bind(email, new Date().toISOString()).run();
    return confirmedChanges(result) > 0;
  };
}

export function createNewsletterStatusStore(
  loadDatabase: () => Promise<NewsletterDatabase | undefined>,
) {
  async function update(email: string, sql: string) {
    const database = await loadDatabase();
    if (!database) throw new Error("Newsletter storage is unavailable.");
    const result = await database.prepare(sql).bind(email).run();
    return confirmedChanges(result) > 0;
  }
  return {
    confirm(email: string) {
      return update(email, `
        UPDATE newsletter_subscribers
        SET status = 'active'
        WHERE email = ? AND status IN ('pending_confirmation', 'active')
      `);
    },
    unsubscribe(email: string) {
      return update(email, `
        UPDATE newsletter_subscribers
        SET status = 'unsubscribed'
        WHERE email = ? AND status IN ('pending_confirmation', 'active', 'unsubscribed')
      `);
    },
  };
}

export const saveNewsletterSubscriber = createNewsletterStore(loadIntakeDatabase);
const statusStore = createNewsletterStatusStore(loadIntakeDatabase);
export const confirmNewsletterSubscriber = statusStore.confirm;
export const unsubscribeNewsletterSubscriber = statusStore.unsubscribe;

export async function saveLimitedNewsletterSubscriber(email: string) {
  const database = await loadIntakeDatabase();
  if (!database) throw new Error("Newsletter storage is unavailable.");
  await enforceIntakeLimit(database, email, "newsletter");
  return createNewsletterStore(async () => database)(email);
}
