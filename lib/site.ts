import { normalizeSiteOrigin } from "./discovery";
// Keep this established candidate origin configurable; never infer it from a request.
const fallbackSiteUrl = "https://obscured-records-tawny.vercel.app";
export const siteUrl = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || fallbackSiteUrl);
export function absoluteUrl(path = "/") {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) throw new Error("Expected a same-origin absolute path.");
  const url = new URL(path, `${siteUrl}/`);
  if (url.origin !== siteUrl) throw new Error("Expected a same-origin URL.");
  return url.toString();
}
