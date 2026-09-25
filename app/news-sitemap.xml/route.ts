import { articles } from "@/lib/articles";
import { toIsoEditorialDate } from "@/lib/editorial-dates";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const cutoff = Date.now() - 2 * 24 * 60 * 60 * 1000;
  const urls = articles
    .filter((article) => new Date(`${toIsoEditorialDate(article.date)}T00:00:00.000Z`).getTime() >= cutoff)
    .map((article) => {
      const publicationDate = `${toIsoEditorialDate(article.date)}T00:00:00.000Z`;
      return `<url><loc>${siteUrl}/article/${article.slug}</loc><news:news><news:publication><news:name>Obscured Records</news:name><news:language>en</news:language></news:publication><news:publication_date>${publicationDate}</news:publication_date><news:title>${escapeXml(article.title)}</news:title></news:news></url>`;
    })
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8" } },
  );
}
