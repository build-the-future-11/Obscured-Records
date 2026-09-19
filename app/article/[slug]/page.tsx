import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticle } from "@/lib/articles";
import { getFeature, getReadingLabel } from "@/lib/features";
import { Footer, Masthead, NewsletterCTA, RecordId } from "@/components/editorial";
import { ReadingProgress, ShareTools } from "@/components/publication-client";

const base = "https://obscured-records.ryangomez-hs.chatgpt.site";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const image = article.cover ? (article.cover.startsWith("http") ? article.cover : `${base}${article.cover}`) : undefined;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/article/${article.slug}` },
    openGraph: { title: article.title, description: article.excerpt, type: "article", publishedTime: "2026-09-14", modifiedTime: getFeature(slug) ? "2026-09-19" : "2026-09-14", images: image ? [{ url: image }] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title: article.title, description: article.excerpt, images: image ? [image] : [] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const feature = getFeature(slug);
  const next = articles[(articles.indexOf(article) + 1) % articles.length];
  const updated = feature?.updated || article.updated;
  const sources = feature?.sources || [{ label: article.source, publisher: article.source, url: article.sourceUrl, kind: "Primary source" as const }];
  const schema = {
    "@context": "https://schema.org",
    "@type": feature ? "NewsArticle" : "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: "2026-09-14",
    dateModified: feature ? "2026-09-19" : "2026-09-14",
    mainEntityOfPage: `${base}/article/${article.slug}`,
    image: article.cover ? (article.cover.startsWith("http") ? article.cover : `${base}${article.cover}`) : undefined,
    author: { "@type": "Person", name: article.author, url: `${base}/author/${article.authorSlug}` },
    publisher: { "@type": "Organization", name: "Obscured Records", url: base },
  };

  return <main className={`article-page ${article.special ? "special-article" : ""}`}>
    <ReadingProgress /><Masthead />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <header className="article-hero">
      <div className="article-label"><RecordId id={article.recordId}/><span>{article.section} / {feature ? "Feature" : "Brief record"} / {article.date}</span></div>
      <h1>{article.title}</h1><p className="article-deck">{feature?.standfirst || article.subtitle}</p>
      <div className="article-byline"><div className="author-avatar">RG</div><p>By <Link href={`/author/${article.authorSlug}`}>{article.author}</Link><br/><span>{getReadingLabel(article.slug)} · Updated {updated}</span></p></div>
    </header>
    <figure className={`article-cover ${article.cover ? "has-cover" : "visual-3"}`} style={article.cover ? { backgroundImage:`linear-gradient(180deg,transparent,rgba(10,10,10,.35)),url('${article.cover}')`, backgroundSize:"cover", backgroundPosition:"center" } : undefined}>
      <figcaption>{article.eventDate} / Archival record. <span>{article.coverCredit || "OBSCURED RECORDS / SOURCE FILE"}</span></figcaption>
    </figure>
    <div className="article-layout">
      <ShareTools title={article.title} />
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
        <div className="sources"><h3>Sources & further reading</h3><ol>{sources.map((source) => <li key={source.url}><span>{source.kind}</span><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>{"publisher" in source && source.publisher !== source.label ? <small>{source.publisher}</small> : null}</li>)}</ol></div>
        <div className="correction-line"><span>See something wrong or incomplete?</span><Link href={`/corrections?record=${article.recordId}`}>Send a correction</Link></div>
        <div className="author-block"><div className="author-avatar large">RG</div><div><span>Founder & editor</span><h3>Ryan Gomez</h3><p>Ryan publishes evidence-led records of events that were overlooked, flattened into trivia or never explained with enough care.</p></div></div>
      </article>
    </div>
    <NewsletterCTA />
    <section className="read-next"><span>Read next / Record {next.recordId}</span><h2><Link href={`/article/${next.slug}`}>{next.title}</Link></h2></section>
    <Footer />
  </main>;
}
