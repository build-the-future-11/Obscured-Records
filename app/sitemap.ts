import type { MetadataRoute } from "next";
import { articles, sections } from "@/lib/articles";

const base = "https://obscured-records.ryangomez-hs.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "latest", ...sections.map((section) => section.toLowerCase()), "about", "standards", "corrections", "privacy", "submit", "newsletter", "search"];
  return [
    ...routes.map((route) => ({ url: `${base}/${route}`, lastModified: new Date("2026-09-19") })),
    ...articles.map((article) => ({ url: `${base}/article/${article.slug}`, lastModified: new Date("2026-09-19") })),
  ];
}
