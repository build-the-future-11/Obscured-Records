import { getTopics, getSeries } from "@/lib/catalog";
import { corrections } from "@/lib/corrections";
import type { MetadataRoute } from "next";
import { getPublicArticles, sections } from "@/lib/articles";
import { toIsoEditorialDate } from "@/lib/editorial-dates";
import { getFeature } from "@/lib/features";
import { articleUpdatedDate } from "@/lib/article-metadata";
import { absoluteUrl } from "@/lib/site";
import { deskSlugs } from "@/lib/desks";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "latest", "desks", ...deskSlugs.map((desk) => `desks/${desk}`), "archive", "topics", "authors", "series", ...sections.map((section) => section.toLowerCase()), "membership", "about", "standards", "corrections", "privacy", "submit", "contribute", "newsletter"];
  const authors = [...new Set(getPublicArticles().map((article) => article.authorSlug))];
  return [
    ...routes.map((route) => ({ url: absoluteUrl(`/${route}`) })),
    ...getTopics().map((topic) => ({ url: absoluteUrl(`/topic/${topic.slug}`) })),
    ...getSeries().map((series) => ({ url: absoluteUrl(`/series/${series.slug}`) })),
    ...authors.map((slug) => ({ url: absoluteUrl(`/author/${slug}`) })),
    ...getPublicArticles().map((article) => ({ url: absoluteUrl(`/article/${article.slug}`), lastModified: new Date(`${toIsoEditorialDate(articleUpdatedDate(article, getFeature(article.slug), corrections))}T00:00:00.000Z`) })),
  ];
}
