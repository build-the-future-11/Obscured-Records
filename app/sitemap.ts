import type { MetadataRoute } from "next";
import { articles, sections } from "@/lib/articles";
import { toIsoEditorialDate } from "@/lib/editorial-dates";
import { getFeature } from "@/lib/features";
import { siteUrl } from "@/lib/site";


export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "latest", ...sections.map((section) => section.toLowerCase()), "about", "standards", "corrections", "privacy", "submit", "newsletter", "search"];
  return [
    ...routes.map((route) => ({ url: `${siteUrl}/${route}`, lastModified: new Date("2026-09-20T00:00:00.000Z") })),
    ...articles.map((article) => {
      const updated = getFeature(article.slug)?.updated || article.updated;
      return {
        url: `${siteUrl}/article/${article.slug}`,
        lastModified: new Date(`${toIsoEditorialDate(updated)}T00:00:00.000Z`),
      };
    }),
  ];
}
