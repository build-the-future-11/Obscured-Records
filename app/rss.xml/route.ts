import { articles } from "@/lib/articles";
import { toRssEditorialDate } from "@/lib/editorial-dates";

export const dynamic = "force-static";

export function GET() {
  const base = "https://obscured-records.ryangomez-hs.chatgpt.site";
  const items = articles.map((article) => `<item><title><![CDATA[${article.title}]]></title><link>${base}/article/${article.slug}</link><guid>${base}/article/${article.slug}</guid><description><![CDATA[${article.excerpt}]]></description><pubDate>${toRssEditorialDate(article.date)}</pubDate></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Obscured Records</title><link>${base}</link><description>Documented histories that were overlooked or poorly explained.</description>${items}</channel></rss>`, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
