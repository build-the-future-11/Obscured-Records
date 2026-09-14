import Link from "next/link";
import { Menu, Search, ArrowUpRight } from "lucide-react";
import type { Article } from "@/lib/articles";
import { sections } from "@/lib/articles";

export function LiveTicker() {
  return <div className="ticker"><span className="live"><i /> Archive / 14 Sep 2026</span><div className="ticker-track"><span>New record: FedEx Flight 705</span><span>The blue powder that poisoned Goiânia</span><span>How Wirecard’s €1.9 billion disappeared</span><span>The night Lake Nyos exhaled</span></div></div>;
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
  return <section className="newsletter"><span className="newsletter-label">New records / No noise</span><div><h2>The Obscured<br />Brief</h2><p>New historical records and the context behind them, sent by Ryan.</p></div><div className="email-subscribe"><span>To read, contribute or subscribe</span><a href="mailto:ryangomez.hsl@gmail.com?subject=Subscribe%20me%20to%20Obscured%20Records">ryangomez.hsl@gmail.com <ArrowUpRight /></a><small>No automated funnel. Just a direct line to the editor.</small></div><blockquote>“History is full of stories<br />that never got a fair record.”</blockquote></section>;
}
export function Footer() {
  return <footer><div className="footer-wordmark"><span>OBSCURED</span><span>RECORDS</span></div><div className="footer-bottom"><nav><Link href="/about">About</Link><Link href="/submit">Submit a story</Link><Link href="/newsletter">Newsletter</Link><a href="mailto:ryangomez.hsl@gmail.com">Contact</a></nav><p>Written and edited by Ryan Gomez.</p><span>© 2026 O.R</span></div></footer>;
}
