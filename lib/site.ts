import { normalizeSiteOrigin } from "./discovery";
// Verified existing Sites origin. Audience is controlled by the hosting provider.
const fallbackSiteUrl = "https://obscured-records.ryangomez-hs.chatgpt.site";
export const siteUrl = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || fallbackSiteUrl);
export function absoluteUrl(path = "/") {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) throw new Error("Expected a same-origin absolute path.");
  const url = new URL(path, `${siteUrl}/`);
  if (url.origin !== siteUrl) throw new Error("Expected a same-origin URL.");
  return url.toString();
}
