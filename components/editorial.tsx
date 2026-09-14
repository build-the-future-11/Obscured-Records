import Link from "next/link";
import { Menu, Search, ArrowUpRight } from "lucide-react";
import type { Article } from "@/lib/articles";
import { sections } from "@/lib/articles";

export function LiveTicker() {
  return <div className="ticker"><span className="live"><i /> Live / 14 Sep 2026</span><div className="ticker-track"><span>Rare earth supply chain deepens</span><span>West African coastal states reopen energy talks</span><span>New protein model changes drug discovery</span><span>Global food prices reach two-year high</span></div></div>;
}
export function Masthead() {
  return <header className="masthead"><Link className="brand" href="/"><b>O.R</b><span>Obscured Records</span></Link><nav aria-label="Primary navigation">{sections.map(s=><Link key={s} href={`/${s.toLowerCase()}`}>{s}</Link>)}</nav><div className="header-actions"><Link href="/search" aria-label="Search"><Search /></Link><Link className="subscribe" href="/newsletter">Subscribe</Link><button aria-label="Open menu"><Menu /></button></div></header>;
}
export function StoryMeta({article,inverse=false}:{article:Article;inverse?:boolean}) {
  return <div className={`story-meta ${inverse?"inverse":""}`}><span>{article.section}</span><span>{article.date}</span><span>{article.readingTime}</span></div>;
}
export function RecordId({id,inverse=false}:{id:string;inverse?:boolean}) { return <span className={`record-id ${inverse?"inverse":""}`}>Record {id}</span>; }
export function SectionHeader({number,title,note,inverse=false}:{number:string;title:string;note:string;inverse?:boolean}) {
  return <header className={`section-header ${inverse?"inverse":""}`}><span>{number}</span><h2>{title}</h2><p>{note}</p></header>;
}
export function NewsletterCTA() {
  return <section className="newsletter"><span className="newsletter-label">Weekly intelligence / No noise</span><div><h2>The Obscured<br />Brief</h2><p>The stories worth knowing before everyone else does.</p></div><form><label htmlFor="brief-email">Email address</label><div><input id="brief-email" type="email" placeholder="you@example.com" required /><button type="submit">Subscribe <ArrowUpRight /></button></div><small>One essential briefing, every Sunday. Unsubscribe anytime.</small></form><blockquote>“In an age of noise,<br />context is a superpower.”</blockquote></section>;
}
export function Footer() {
  return <footer><div className="footer-wordmark"><span>OBSCURED</span><span>RECORDS</span></div><div className="footer-bottom"><nav><Link href="/about">About</Link><Link href="/submit">Submit a story</Link><Link href="/newsletter">Newsletter</Link><a href="mailto:hello@obscuredrecords.com">Contact</a></nav><p>Independent journalism for the edges of the record.</p><span>© 2026 O.R</span></div></footer>;
}
