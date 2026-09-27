export class IntakeRateLimit extends Error {}

export type IntakeDatabase = {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
    };
  };
};

export const rateLimitSql = `
  INSERT INTO intake_limits (bucket, hits, expires_at) VALUES (?1, 1, ?2)
  ON CONFLICT(bucket) DO UPDATE SET
    hits = CASE WHEN expires_at <= ?3 THEN 1 ELSE hits + 1 END,
    expires_at = CASE WHEN expires_at <= ?3 THEN ?2 ELSE expires_at END
  WHERE expires_at <= ?3 OR hits < ?4
`;

/** Shared database counters, not isolate-local memory. Never store raw IPs. */
export async function enforceIntakeLimit(database: IntakeDatabase, email: string, channel: string, now = Date.now()) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  const key = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  // A global cap bounds floods that rotate addresses; per-address cap bounds repeats.
  for (const [bucket, duration, limit] of [[`${channel}:global`, 60000, 60], [`${channel}:${key}`, 3600000, 3]] as const) {
    const result = await database.prepare(rateLimitSql).bind(bucket, now + duration, now, limit).run();
    if (!result.success || typeof result.meta?.changes !== "number") throw new Error("Intake limiter unavailable.");
    if (result.meta.changes === 0) throw new IntakeRateLimit("Please wait before submitting again.");
  }
  // Bounded-age operational state. Hashes are pseudonymous, not anonymous.
  await database.prepare("DELETE FROM intake_limits WHERE expires_at <= ?").bind(now).run();
}
