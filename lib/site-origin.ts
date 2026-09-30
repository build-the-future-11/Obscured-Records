import { normalizeSiteOrigin } from "./discovery.ts";
export const existingSitesOrigin = "https://obscured-records.ryangomez-hs.chatgpt.site";
/** Never derive canonical links from visitor headers or a deployment-preview hostname. */
export function resolveSiteOrigin(env: Record<string, string | undefined>): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL || env.SITE_URL;
  if (explicit) return normalizeSiteOrigin(explicit);
  if (env.VERCEL === "1" && env.VERCEL_PROJECT_PRODUCTION_URL) return normalizeSiteOrigin(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return existingSitesOrigin;
}
