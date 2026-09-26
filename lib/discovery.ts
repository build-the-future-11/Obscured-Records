/** Validate configured canonical origins, not request headers or preview URLs. */
export function normalizeSiteOrigin(value: string): string {
  const raw = value.trim();
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error("SITE_URL must be an absolute HTTP(S) origin."); }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) {
    throw new Error("SITE_URL requires HTTPS, except for local development.");
  }
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("SITE_URL must be an origin without credentials, a path, query, or fragment.");
  }
  return url.origin;
}

/** JSON placed inside an HTML script element must not contain an HTML close tag. */
export function serializeJsonLd(value: unknown): string {
  return (JSON.stringify(value) ?? "null").replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function escapeXml(value: string): string {
  return Array.from(value).filter((character) => {
    const code = character.codePointAt(0)!;
    return [9, 10, 13].includes(code) || (code >= 0x20 && code <= 0xd7ff)
      || (code >= 0xe000 && code <= 0xfffd) || (code >= 0x10000 && code <= 0x10ffff);
  }).join("")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export type FeedRecord = { slug: string; title: string; excerpt: string; publishedIso: string };

export function isRecentPublication(isoDate: string, now: number): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate) || !Number.isFinite(now)) return false;
  const time = Date.parse(`${isoDate}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === isoDate
    && time <= now && time >= now - 48 * 60 * 60 * 1000;
}

export function buildRss(origin: string, records: FeedRecord[]): string {
  const items = [...records].sort((a, b) => b.publishedIso.localeCompare(a.publishedIso)).map((record) => {
    const link = escapeXml(`${origin}/article/${encodeURIComponent(record.slug)}`);
    const date = new Date(`${record.publishedIso}T00:00:00.000Z`).toUTCString();
    return `<item><title>${escapeXml(record.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><description>${escapeXml(record.excerpt)}</description><pubDate>${date}</pubDate></item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Obscured Records</title><link>${escapeXml(origin)}</link><description>Documented histories that were overlooked or poorly explained.</description><language>en</language><atom:link href="${escapeXml(origin)}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}

export function buildNewsSitemap(origin: string, records: FeedRecord[], now: number): string {
  const urls = records.filter((record) => isRecentPublication(record.publishedIso, now)).slice(0, 1000).map((record) =>
    `<url><loc>${escapeXml(`${origin}/article/${encodeURIComponent(record.slug)}`)}</loc><news:news><news:publication><news:name>Obscured Records</news:name><news:language>en</news:language></news:publication><news:publication_date>${record.publishedIso}</news:publication_date><news:title>${escapeXml(record.title)}</news:title></news:news></url>`
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`;
}
