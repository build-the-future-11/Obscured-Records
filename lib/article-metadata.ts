import type { Metadata } from "next";
import type { Article } from "./articles.ts";
import { toIsoEditorialDate } from "./editorial-dates.ts";
import { absoluteUrl, siteUrl } from "./site.ts";

/** Correction logs may be newest-first. Their array order is not chronology. */
export function articleUpdatedDate(
  article: Pick<Article, "slug" | "date" | "updated">,
  feature: { updated: string } | undefined,
  corrections: readonly { slug: string; date: string }[],
): string {
  return [article.date, article.updated, feature?.updated, ...corrections.filter((item) => item.slug === article.slug).map((item) => item.date)]
    .filter((date): date is string => Boolean(date))
    .map((date) => ({ date, iso: toIsoEditorialDate(date) }))
    .sort((a, b) => b.iso.localeCompare(a.iso))[0].date;
}

type ArticlePresentation = { updated: string; cover?: string };

/** Share cards can identify the publication without claiming to depict the event. */
export function articleMetadata(article: Article, { updated, cover }: ArticlePresentation): Metadata {
  const image = cover ? new URL(cover, `${siteUrl}/`).toString() : absoluteUrl("/share-card.png");
  const url = absoluteUrl(`/article/${article.slug}`);
  return {
    title: article.title, description: article.excerpt,
    authors: [{ name: article.author, url: absoluteUrl(`/author/${article.authorSlug}`) }], keywords: article.tags,
    alternates: { canonical: url, types: { "application/rss+xml": absoluteUrl("/rss.xml") } },
    openGraph: {
      title: article.title, description: article.excerpt, type: "article", url, siteName: "Obscured Records",
      publishedTime: toIsoEditorialDate(article.date), modifiedTime: toIsoEditorialDate(updated),
      images: [{ url: image, alt: cover ? article.coverCredit || article.title : "Obscured Records — publication preview; no documentary image" }],
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt, images: [image] },
  };
}

export function articleStructuredData(article: Article, { updated, cover }: ArticlePresentation) {
  return {
    "@context": "https://schema.org", "@type": "Article",
    articleSection: article.section, inLanguage: "en",
    headline: article.title, description: article.excerpt,
    datePublished: toIsoEditorialDate(article.date), dateModified: toIsoEditorialDate(updated),
    mainEntityOfPage: absoluteUrl(`/article/${article.slug}`),
    // A withheld or absent documentary image must not become a publisher logo.
    ...(cover ? { image: new URL(cover, `${siteUrl}/`).toString() } : {}),
    author: { "@type": "Person", name: article.author, url: absoluteUrl(`/author/${article.authorSlug}`) },
    publisher: { "@type": "Organization", name: "Obscured Records", url: siteUrl },
  };
}
