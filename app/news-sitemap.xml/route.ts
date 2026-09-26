import { articles } from "@/lib/articles";
import { toIsoEditorialDate } from "@/lib/editorial-dates";
import { buildNewsSitemap } from "@/lib/discovery";
import { siteUrl } from "@/lib/site";
// The 48-hour window must advance without a rebuild. Future dates are excluded.
export const dynamic = "force-dynamic";
export function GET() {
  const records = articles.map((article) => ({ ...article, publishedIso: toIsoEditorialDate(article.date) }));
  return new Response(buildNewsSitemap(siteUrl, records, Date.now()), { headers: { "content-type": "application/xml; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
