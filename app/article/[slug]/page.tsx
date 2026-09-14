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
    <figure className={`article-cover ${article.cover?"":"visual-3"}`} style={article.cover?{backgroundImage:`linear-gradient(180deg,transparent,rgba(10,10,10,.3)),url('${article.cover}')`,backgroundSize:"cover",backgroundPosition:"center"}:undefined}><figcaption>{article.eventDate} / Archival record. <span>{article.coverCredit||"OBSCURED RECORDS / SOURCE FILE"}</span></figcaption></figure>
    <div className="article-layout"><aside className="share"><span>Share</span><button aria-label="Copy link"><Copy/></button><a href="#" aria-label="Share on LinkedIn"><Share2/></a><a href="#" aria-label="Share on X"><Send/></a><a href="#" aria-label="Share on WhatsApp"><MessageCircle/></a></aside><article className="article-body">
      <p className="dropcap">{article.opening}</p>
      <h2>What happened</h2><p>{article.context}</p>
      <blockquote>“{article.excerpt}”</blockquote>
      <figure className="inline-figure record-figure"><span>RECORD {article.recordId}</span><strong>{article.eventDate}</strong><figcaption>A date, a source, and the part of the story that tends to disappear.</figcaption></figure>
      <h2>Why this record matters</h2><p>{article.significance}</p>
      <p className="reporting-note">This launch edition is a concise historical record assembled from the source below. Obscured Records will continue expanding it as primary documents and testimony are added.</p>
      <div className="sources"><h3>Sources & further reading</h3><ol><li><a href={article.sourceUrl} target="_blank" rel="noreferrer">{article.source} ↗</a></li></ol></div>
      <div className="author-block"><div className="author-avatar large">RG</div><div><span>Founder & editor</span><h3>Ryan Gomez</h3><p>Ryan writes Obscured Records: documented stories from history that deserve a clearer, wider record.</p></div></div>
    </article></div><NewsletterCTA/><section className="read-next"><span>Read next / Record {next.recordId}</span><h2><Link href={`/article/${next.slug}`}>{next.title}</Link></h2></section><Footer/>
  </main>
}
