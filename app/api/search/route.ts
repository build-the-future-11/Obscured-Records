import { getCatalog, getTopics, getSeries } from "@/lib/catalog";
export function GET() {
  const stories = getCatalog();
  return Response.json({ stories, topics: getTopics(), series: getSeries(), authors: [...new Map(stories.map((story) => [story.authorSlug, { slug: story.authorSlug, name: story.author }])).values()] }, { headers: { "Cache-Control": "public, max-age=300" } });
}
