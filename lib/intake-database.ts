import type { IntakeDatabase } from "./intake-policy.ts";
type Environment = Record<string, string | undefined>;
type D1Config = { accountId: string; databaseId: string; token: string };
const unavailable = () => new Error("Intake storage is unavailable.");
export function d1HttpConfig(env: Environment): D1Config | undefined {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = env.CLOUDFLARE_D1_DATABASE_ID;
  const token = env.CLOUDFLARE_D1_API_TOKEN;
  if (!accountId && !databaseId && !token) return undefined;
  if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId) || !databaseId || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(databaseId) || !token || /[\s\x00-\x1f\x7f]/.test(token)) throw unavailable();
  return { accountId, databaseId, token };
}
/** Server-only D1 REST adapter for Node/Vercel. No new database or email service is created.
 * Queries remain parameterized; errors never include SQL, credentials, email or provider bodies.
 * Cloudflare API reference: /api/resources/d1/subresources/database/methods/query/
 */
export function createD1HttpDatabase(config: D1Config, send: typeof fetch = fetch, now: () => number = Date.now): IntakeDatabase {
  if (typeof window !== "undefined") throw unavailable();
  // Revalidate even when invoked directly, before composing a privileged endpoint.
  d1HttpConfig({ CLOUDFLARE_ACCOUNT_ID: config.accountId, CLOUDFLARE_D1_DATABASE_ID: config.databaseId, CLOUDFLARE_D1_API_TOKEN: config.token });
  const deadline = now() + 8000;
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`;
  return { prepare(sql: string) { return { bind(...values: unknown[]) {
    if (values.some((value) => typeof value !== "string" && !(typeof value === "number" && Number.isFinite(value)))) throw unavailable();
    // This intake schema binds only text and finite numbers; SQLite column affinity
    // restores numeric timestamps/counters from the REST API's string parameters.
    const params = values.map(String);
    return { async run() {
      const remaining = deadline - now();
      if (remaining <= 0) throw unavailable();
      try {
        const response = await send(endpoint, {
          method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${config.token}` },
          body: JSON.stringify({ sql, params }), cache: "no-store", redirect: "error",
          signal: AbortSignal.timeout(Math.min(remaining, 4000)),
        });
        if (!response.ok) throw unavailable();
        const payload = await response.json();
        if (payload?.success !== true || !Array.isArray(payload.result) || payload.result.length !== 1 || payload.result[0]?.success !== true || (Array.isArray(payload.errors) && payload.errors.length)) throw unavailable();
        const changes = payload.result[0].meta?.changes;
        if (typeof changes !== "number" || !Number.isSafeInteger(changes) || changes < 0) throw unavailable();
        return { success: true, meta: { changes } };
      } catch { throw unavailable(); }
    } };
  } }; } };
}
/** Resolve real storage per request. Native Workers binding takes precedence. */
export async function loadIntakeDatabase(): Promise<IntakeDatabase | undefined> {
  if (typeof window !== "undefined") throw unavailable();
  try {
    const { env } = await import("cloudflare:workers");
    if (env.DB) return env.DB;
  } catch { /* Node does not provide the Workers module. */ }
  const config = d1HttpConfig(process.env);
  return config ? createD1HttpDatabase(config) : undefined;
}
