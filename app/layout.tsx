import { PrivacyAnalytics } from "@/components/privacy-analytics";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { EditorialEvents } from "@/components/editorial-events";
import { SearchPalette } from "@/components/search-palette";
import "./globals.css";
import "./accessibility.css";
import "./publication.css";
import "./launch.css";
export const metadata: Metadata = {
  title: { default: "Obscured Records", template: "%s — Obscured Records" },
  description: "Documented histories that were overlooked, flattened into trivia or never explained with enough care.",
  metadataBase: new URL(siteUrl),
  // Do not inherit a homepage canonical on every nested route.
  alternates: { types: { "application/rss+xml": `${siteUrl}/rss.xml` } },
  openGraph: { title: "Obscured Records", description: "The record beneath the remembered story.", type: "website", images: [{ url: `${siteUrl}/share-card.png`, width: 1200, height: 630, alt: "Obscured Records" }] },
  twitter: { images: [`${siteUrl}/share-card.png`], card: "summary_large_image", title: "Obscured Records", description: "The record beneath the remembered story." },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}<SearchPalette /><EditorialEvents /><PrivacyAnalytics /></body></html>;
}
