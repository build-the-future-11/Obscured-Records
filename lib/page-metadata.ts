import type { Metadata } from "next";
import { absoluteUrl } from "./site";
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title, description,
    alternates: { canonical: absoluteUrl(path), types: { "application/rss+xml": absoluteUrl("/rss.xml") } },
    openGraph: { title, description, type: "website", url: absoluteUrl(path), siteName: "Obscured Records" },
    twitter: { card: "summary", title, description },
  };
}
