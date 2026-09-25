const fallbackSiteUrl = "https://obscured-records-tawny.vercel.app";

function normalizeSiteUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || fallbackSiteUrl,
);

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}
