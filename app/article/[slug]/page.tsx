import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticle } from "@/lib/articles";
import { toIsoEditorialDate } from "@/lib/editorial-dates";
import { serializeJsonLd } from "@/lib/discovery";
import { absoluteUrl, siteUrl } from "@/lib/site";
import { getFeature, getReadingLabel } from "@/lib/features";
import { Footer, Masthead, NewsletterCTA, RecordId } from "@/components/editorial";
import { ReadingProgress, ShareTools } from "@/components/publication-client";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const feature = getFeature(slug);
  const image = article.cover ? new URL(article.cover, `${siteUrl}/`).toString() : undefined;
  const url = absoluteUrl(`/article/${article.slug}`);
  return {
    title: article.title, description: article.excerpt,
    authors: [{ name: article.author, url: absoluteUrl(`/author/${article.authorSlug}`) }], keywords: article.tags,
    alternates: { canonical: url, types: { "application/rss+xml": absoluteUrl("/rss.xml") } },
    openGraph: { title: article.title, description: article.excerpt, type: "article", url, publishedTime: toIsoEditorialDate(article.date), modifiedTime: toIsoEditorialDate(feature?.updated || article.updated), images: image ? [{ url: image, alt: article.coverCredit || article.title }] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title: article.title, description: article.excerpt, images: image ? [image] : [] },
  };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const feature = getFeature(slug);
  const next = articles.filter((candidate) => candidate.slug !== article.slug).map((candidate) => ({
    article: candidate,
    score: candidate.tags.filter((tag) => article.tags.includes(tag)).length * 3 + (candidate.section === article.section ? 2 : 0) + (Boolean(getFeature(candidate.slug)) === Boolean(feature) ? 1 : 0),
  })).sort((a, b) => b.score - a.score || a.article.slug.localeCompare(b.article.slug))[0]?.article;
  const updated = feature?.updated || article.updated;
  const sources = feature?.sources || [{ label: article.source, publisher: article.source, url: article.sourceUrl, kind: "Primary source" as const }];
  const schema = {
    "@context": "https://schema.org", "@type": feature ? "NewsArticle" : "Article",
    headline: article.title, description: article.excerpt,
    datePublished: toIsoEditorialDate(article.date), dateModified: toIsoEditorialDate(updated),
    mainEntityOfPage: absoluteUrl(`/article/${article.slug}`),
    image: article.cover ? new URL(article.cover, `${siteUrl}/`).toString() : undefined,
    author: { "@type": "Person", name: article.author, url: absoluteUrl(`/author/${article.authorSlug}`) },
    publisher: { "@type": "Organization", name: "Obscured Records", url: siteUrl },
  };
  return <main className={`article-page ${article.special ? "special-article" : ""}`}>
    <ReadingProgress /><Masthead />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <header className="article-hero" id="main-content" tabIndex={-1}>
      <div className="article-label"><RecordId id={article.recordId}/><span>{article.section} / {feature ? "Feature" : "Brief record"} / {article.date}</span></div>
      <h1>{article.title}</h1><p className="article-deck">{feature?.standfirst || article.subtitle}</p>
      <div className="article-byline"><div className="author-avatar">RG</div><p>By <Link href={`/author/${article.authorSlug}`}>{article.author}</Link><br/><span>{getReadingLabel(article.slug)} · Updated {updated}</span></p></div>
    </header>
    <figure className={`article-cover ${article.cover ? "has-cover" : "visual-3"}`} style={article.cover ? { backgroundImage:`linear-gradient(180deg,transparent,rgba(10,10,10,.35)),url('${article.cover}')`, backgroundSize:"cover", backgroundPosition:"center" } : undefined}>
      <figcaption>{article.eventDate} / Archival record. <span>{article.coverCredit || "OBSCURED RECORDS / SOURCE FILE"}</span></figcaption>
    </figure>
    <div className="article-layout">
      <ShareTools title={article.title} url={absoluteUrl(`/article/${article.slug}`)} />
      <article className="article-body">
        <p className="dropcap">{article.opening}</p>
        {feature ? <>
          <div className="record-context"><span>Location</span><strong>{feature.location}</strong><span>Record type</span><strong>Expanded feature</strong></div>
          <section className="article-timeline" aria-labelledby="timeline-title"><h2 id="timeline-title">Record timeline</h2><ol>{feature.timeline.map((item) => <li key={`${item.date}-${item.event}`}><time>{item.date}</time><p>{item.event}</p></li>)}</ol></section>
          {feature.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
        </> : <>
          <h2>What happened</h2><p>{article.context}</p>
          <blockquote>“{article.excerpt}”</blockquote>
          <figure className="inline-figure record-figure"><span>RECORD {article.recordId}</span><strong>{article.eventDate}</strong><figcaption>A concise entry in the archive. This brief will expand when more primary material is reviewed.</figcaption></figure>
          <h2>Why this record matters</h2><p>{article.significance}</p>
        </>}
        <div className="method-note"><span>Method</span><p>{feature ? "This feature separates the documented sequence from interpretation and links the reports used to reconstruct it. Source labels describe the role of each document, not an endorsement of every conclusion inside it." : "This is a brief record: a verified starting point, not a finished long-form investigation. The reading label and format are intentionally explicit."}</p><Link href="/standards">Read our editorial standards →</Link></div>
        <div className="sources"><h3>Sources &amp; further reading</h3><ol>{sources.map((source) => <li key={source.url}><span>{source.kind}</span><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>{"publisher" in source && source.publisher !== source.label ? <small>{source.publisher}</small> : null}</li>)}</ol></div>
        <div className="correction-line"><span>See something wrong or incomplete?</span><Link href={`/corrections?record=${article.recordId}`}>Send a correction</Link></div>
        <div className="author-block"><div className="author-avatar large">RG</div><div><span>Founder &amp; editor</span><h3>Ryan Gomez</h3><p>Ryan publishes evidence-led records of events that were overlooked, flattened into trivia or never explained with enough care.</p></div></div>
      </article>
    </div><NewsletterCTA />
    {next && <section className="read-next"><span>Read next / Record {next.recordId}</span><h2><Link href={`/article/${next.slug}`}>{next.title}</Link></h2></section>}
    <Footer />
  </main>;
}
