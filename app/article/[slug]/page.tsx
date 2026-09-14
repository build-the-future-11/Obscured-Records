import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Copy, Share2, MessageCircle, Send } from "lucide-react";
import { articles, getArticle } from "@/lib/articles";
import { Footer, Masthead, NewsletterCTA, RecordId } from "@/components/editorial";

export function generateStaticParams(){return articles.map(a=>({slug:a.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const a=getArticle(slug);return a?{title:a.title,description:a.excerpt,alternates:{canonical:`/article/${a.slug}`},openGraph:{title:a.title,description:a.excerpt,type:"article"}}:{}}

export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const article=getArticle(slug);if(!article)notFound();
  const next=articles[(articles.indexOf(article)+1)%articles.length];
  const schema={"@context":"https://schema.org","@type":"NewsArticle",headline:article.title,description:article.excerpt,datePublished:"2026-09-14",dateModified:"2026-09-14",author:{"@type":"Person",name:article.author},publisher:{"@type":"Organization",name:"Obscured Records"}};
  return <main className={`article-page ${article.special?"special-article":""}`}><div className="reading-progress" /><Masthead /><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} />
    <header className="article-hero"><div className="article-label"><RecordId id={article.recordId}/><span>{article.section} / {article.date}</span></div><h1>{article.title}</h1><p className="article-deck">{article.subtitle}</p><div className="article-byline"><div className="author-avatar">{article.author.split(" ").map(n=>n[0]).join("")}</div><p>By <Link href={`/author/${article.authorSlug}`}>{article.author}</Link><br/><span>{article.readingTime} read · Updated {article.updated}</span></p></div></header>
    <figure className="article-cover image-sea"><figcaption>Container traffic in the western Indian Ocean, photographed from above. <span>O.R / FIELD ARCHIVE</span></figcaption></figure>
    <div className="article-layout"><aside className="share"><span>Share</span><button aria-label="Copy link"><Copy/></button><a href="#" aria-label="Share on LinkedIn"><Share2/></a><a href="#" aria-label="Share on X"><Send/></a><a href="#" aria-label="Share on WhatsApp"><MessageCircle/></a></aside><article className="article-body">
      <p className="dropcap">At first, the agreement looked routine: a thirty-year lease, a dredging commitment, a new container yard on a stretch of coast rarely mentioned in global shipping reports. The ceremony lasted forty-two minutes. The consequences may last decades.</p>
      <p>Over the past four years, a series of ports along the Mozambique Channel have changed hands, expanded their concessions, or signed infrastructure agreements whose strategic value is far greater than their public profile suggests.</p>
      <h2>A map drawn in contracts</h2><p>No single deal is decisive. Together, they form a route—a chain of refuelling, repair, data and cargo capacity linking the Cape to the Gulf. The shift is visible not in speeches but in annexes: priority berths, security clauses, and options on nearby land.</p>
      <blockquote>“The most consequential infrastructure is often the infrastructure nobody thinks to call strategic—until it is.”</blockquote>
      <p>Interviews with port workers, trade officials and regional analysts describe a competition unfolding below the threshold of public attention. Governments need investment. Operators want scale. Outside powers want access without the political cost of calling it a base.</p>
      <figure className="inline-figure visual-3"><span>15° 37′ S</span><figcaption>Five ports now handle 61% of the channel’s transshipment capacity.</figcaption></figure>
      <h2>The leverage beneath the ledger</h2><p>The contracts create a new kind of influence. A port operator can prioritize cargo, shape logistics data and determine which expansion gets financed next. In a crisis, commercial preference can become geopolitical leverage overnight.</p>
      <p>None of this makes conflict inevitable. It does make the region newly important—and exposes the gap between the maps policymakers use and the networks that actually move the world.</p>
      <div className="sources"><h3>Sources & further reading</h3><ol><li>Regional port concession filings, 2022–2026</li><li>Maritime traffic data reviewed by Obscured Records</li><li>Interviews with seven officials and logistics specialists</li></ol></div>
      <div className="author-block"><div className="author-avatar large">{article.author.split(" ").map(n=>n[0]).join("")}</div><div><span>About the author</span><h3>{article.author}</h3><p>{article.author} reports on the systems, borders and agreements that quietly redistribute power.</p></div></div>
    </article></div><NewsletterCTA/><section className="read-next"><span>Read next / Record {next.recordId}</span><h2><Link href={`/article/${next.slug}`}>{next.title}</Link></h2></section><Footer/>
  </main>
}
