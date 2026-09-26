import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, sections } from "@/lib/articles";
import { pageMetadata } from "@/lib/page-metadata";
import { Footer, ArchiveTicker, Masthead, NewsletterCTA, RecordId, SectionHeader, StoryMeta } from "@/components/editorial";
const copy: Record<string,string> = {world:"Power, borders, conflict, diplomacy—and the lives caught between them.",business:"Capital, labor, markets and the systems that decide who gets what.",technology:"Systems, machines, platforms, infrastructure and the people building them.",science:"Evidence, discovery, climate and the changing limits of what we know.",culture:"Ideas, art, memory and the institutions that shape how we see.",underreported:"The overlooked stories. The missing context. The records that still matter.",people:"Conversations with people worth knowing.",opinion:"Arguments and analysis from independent minds."};
const valid = sections.map((section) => section.toLowerCase());
export function generateStaticParams() { return valid.map((section) => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = sections.find((name) => name.toLowerCase() === section);
  return title ? pageMetadata(`/${section}`, title, copy[section]) : {};
}
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!valid.includes(section)) notFound();
  const title = section.toUpperCase();
  const stories = articles.filter((article) => section === "underreported" ? article.underreported : article.section.toLowerCase() === section);
  const lead = stories[0];
  if (!lead) notFound();
  return <main className={section === "underreported" ? "section-dark" : ""}><ArchiveTicker/><Masthead/>
    <section className="listing-hero" id="main-content" tabIndex={-1}><span>O.R / Section archive</span><h1>{title}</h1><p>{copy[section]}</p></section>
    <section className="section-lead"><Link href={`/article/${lead.slug}`} aria-label={`Read ${lead.title}`} className={`section-lead-image ${lead.cover ? "has-cover" : "visual-2"}`} style={lead.cover ? {backgroundImage:`linear-gradient(180deg,transparent,rgba(10,10,10,.45)),url('${lead.cover}')`} : undefined}><RecordId id={lead.recordId} inverse/></Link><div><StoryMeta article={lead}/><h2><Link href={`/article/${lead.slug}`}>{lead.title}</Link></h2><p>{lead.subtitle}</p><Link href={`/article/${lead.slug}`} className="arrow-link">Read record →</Link></div></section>
    <section className="section-feed"><SectionHeader number="01" title={`${stories.length} records`} note="Only records filed to this section—no filler from unrelated desks."/><div className="feed-grid">{stories.slice(1).map((article, index) => <article key={article.slug}><Link href={`/article/${article.slug}`} aria-label={`Read ${article.title}`} className={`feed-image ${article.cover ? "has-cover" : `visual-${index % 5 + 1}`}`} style={article.cover ? {backgroundImage:`linear-gradient(180deg,transparent,rgba(10,10,10,.34)),url('${article.cover}')`} : undefined}/><RecordId id={article.recordId}/><h3><Link href={`/article/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p><StoryMeta article={article}/></article>)}</div></section><NewsletterCTA/><Footer/>
  </main>;
}
