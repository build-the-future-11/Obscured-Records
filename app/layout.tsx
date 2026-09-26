import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import "./globals.css";
import "./accessibility.css";
export const metadata: Metadata = {
  title: { default: "Obscured Records", template: "%s — Obscured Records" },
  description: "Documented histories that were overlooked, flattened into trivia or never explained with enough care.",
  metadataBase: new URL(siteUrl),
  // Do not inherit a homepage canonical on every nested route.
  alternates: { types: { "application/rss+xml": `${siteUrl}/rss.xml` } },
  openGraph: { title: "Obscured Records", description: "The record beneath the remembered story.", type: "website" },
  twitter: { card: "summary", title: "Obscured Records", description: "The record beneath the remembered story." },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body></html>;
}
