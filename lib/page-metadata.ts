import type { Metadata } from "next";
import { absoluteUrl } from "./site";
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title, description,
    alternates: { canonical: absoluteUrl(path), types: { "application/rss+xml": absoluteUrl("/rss.xml") } },
    openGraph: { title, description, type: "website", url: absoluteUrl(path), siteName: "Obscured Records", images: [{ url: absoluteUrl("/share-card.png"), width: 1200, height: 630, alt: "Obscured Records — overlooked stories, open source trails" }] },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/share-card.png")] },
  };
}
