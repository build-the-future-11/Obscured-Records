import { articles } from "@/lib/articles";
import { toIsoEditorialDate } from "@/lib/editorial-dates";
import { buildRss } from "@/lib/discovery";
import { siteUrl } from "@/lib/site";
export const dynamic = "force-static";
export function GET() {
  const records = articles.map((article) => ({ ...article, publishedIso: toIsoEditorialDate(article.date) }));
  return new Response(buildRss(siteUrl, records), { headers: { "content-type": "application/rss+xml; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}
