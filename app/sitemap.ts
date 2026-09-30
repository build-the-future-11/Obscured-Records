import { getTopics, getSeries } from "@/lib/catalog";
import { corrections } from "@/lib/corrections";
import type { MetadataRoute } from "next";
import { getPublicArticles, sections } from "@/lib/articles";
import { toIsoEditorialDate } from "@/lib/editorial-dates";
import { getFeature } from "@/lib/features";
import { absoluteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "latest", "archive", "topics", "authors", "series", ...sections.map((section) => section.toLowerCase()), "about", "standards", "corrections", "privacy", "submit", "contribute", "newsletter"];
  const authors = [...new Set(getPublicArticles().map((article) => article.authorSlug))];
  return [
    ...routes.map((route) => ({ url: absoluteUrl(`/${route}`) })),
    ...getTopics().map((topic) => ({ url: absoluteUrl(`/topic/${topic.slug}`) })),
    ...getSeries().map((series) => ({ url: absoluteUrl(`/series/${series.slug}`) })),
    ...authors.map((slug) => ({ url: absoluteUrl(`/author/${slug}`) })),
    ...getPublicArticles().map((article) => ({ url: absoluteUrl(`/article/${article.slug}`), lastModified: new Date(`${toIsoEditorialDate(corrections.filter((item) => item.slug === article.slug).at(-1)?.date || getFeature(article.slug)?.updated || article.updated)}T00:00:00.000Z`) })),
  ];
}
