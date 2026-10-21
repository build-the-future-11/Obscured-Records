import { resolveSiteOrigin } from "./site-origin.ts";
export const siteUrl = resolveSiteOrigin(process.env);
export function absoluteUrl(path = "/") {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) throw new Error("Expected a same-origin absolute path.");
  const url = new URL(path, `${siteUrl}/`);
  if (url.origin !== siteUrl) throw new Error("Expected a same-origin URL.");
  return url.toString();
}
