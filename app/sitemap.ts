import type { MetadataRoute } from "next";
import { articles, sections } from "@/lib/articles";
import { toIsoEditorialDate } from "@/lib/editorial-dates";
import { getFeature } from "@/lib/features";
import { absoluteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "latest", ...sections.map((section) => section.toLowerCase()), "about", "standards", "corrections", "privacy", "submit", "newsletter"];
  const authors = [...new Set(articles.map((article) => article.authorSlug))];
  return [
    ...routes.map((route) => ({ url: absoluteUrl(`/${route}`) })),
    ...authors.map((slug) => ({ url: absoluteUrl(`/author/${slug}`) })),
    ...articles.map((article) => ({ url: absoluteUrl(`/article/${article.slug}`), lastModified: new Date(`${toIsoEditorialDate(getFeature(article.slug)?.updated || article.updated)}T00:00:00.000Z`) })),
  ];
}
