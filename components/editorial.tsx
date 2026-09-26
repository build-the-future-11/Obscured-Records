import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import type { Article } from "@/lib/articles";
import { articles, sections } from "@/lib/articles";
import { getFeature, getReadingLabel } from "@/lib/features";
import { MobileMenu, NewsletterForm } from "@/components/publication-client";

export function ArchiveTicker() {
  const notes = [`${articles.length} documented records`, `${articles.filter((article) => getFeature(article.slug)).length} expanded features`, "Sources attached to every file", "Corrections remain open"];
  return <div className="ticker" aria-label="Publication status">
    <span className="live"><i /> Independent archive</span>
    <div className="ticker-track" aria-hidden="true">{[...notes, ...notes].map((note, index) => <span key={index}>{note}</span>)}</div>
  </div>;
}
export const LiveTicker = ArchiveTicker;
export function Masthead() {
  return <header className="masthead">
    <Link className="brand" href="/" aria-label="Obscured Records home"><b>O.R</b><span>Obscured Records</span></Link>
    <nav aria-label="Primary navigation">{sections.map((section) => <Link key={section} href={`/${section.toLowerCase()}`}>{section}</Link>)}</nav>
    <div className="header-actions"><Link href="/search" aria-label="Search the archive"><Search /></Link><Link className="subscribe" href="/newsletter">Subscribe</Link><MobileMenu /></div>
  </header>;
}
export function StoryMeta({ article, inverse = false }: { article: Article; inverse?: boolean }) {
  return <div className={`story-meta ${inverse ? "inverse" : ""}`}><span>{article.section}</span><span>{getFeature(article.slug) ? "Feature" : "Brief record"}</span><span>{getReadingLabel(article.slug).split(" · ").at(-1)}</span></div>;
}
export function RecordId({ id, inverse = false }: { id: string; inverse?: boolean }) {
  return <span className={`record-id ${inverse ? "inverse" : ""}`}>Record {id}</span>;
}
export function SectionHeader({ number, title, note, inverse = false }: { number: string; title: string; note: string; inverse?: boolean }) {
  return <header className={`section-header ${inverse ? "inverse" : ""}`}><span>{number}</span><h2>{title}</h2><p>{note}</p></header>;
}
export function NewsletterCTA() {
  return <section className="newsletter" aria-labelledby="newsletter-title">
    <span className="newsletter-label">A quiet email brief</span>
    <div><h2 id="newsletter-title">The Obscured<br />Brief</h2><p>One documented story, the evidence behind it and the context most summaries leave out.</p></div>
    <NewsletterForm compact />
    <blockquote>“History is full of stories<br />that never got a fair record.”</blockquote>
  </section>;
}
export function Footer() {
  return <footer><div className="footer-wordmark"><span>OBSCURED</span><span>RECORDS</span></div><div className="footer-bottom">
    <nav aria-label="Footer navigation"><Link href="/about">About</Link><Link href="/standards">Standards</Link><Link href="/corrections">Corrections</Link><Link href="/privacy">Privacy</Link><Link href="/submit">Submit a record</Link><a href="/rss.xml">RSS</a><a href="mailto:ryangomez.hs@gmail.com">Contact <ArrowUpRight /></a></nav>
    <p>Written and edited by Ryan Gomez.</p><span>© 2026 O.R</span>
  </div></footer>;
}
