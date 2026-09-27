import { RecordImage } from "@/components/record-image";
import { ReaderTools, SourcePreview } from "@/components/reader-tools";
import { getCatalog, getSeries, getTopics } from "@/lib/catalog";
import { StoryCard } from "@/components/story-card";
import { mediaCredits } from "@/lib/media";
import { corrections } from "@/lib/corrections";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicArticles, getArticle } from "@/lib/articles";
import { toIsoEditorialDate } from "@/lib/editorial-dates";
import { serializeJsonLd } from "@/lib/discovery";
import { absoluteUrl, siteUrl } from "@/lib/site";
import { getFeature, getReadingLabel } from "@/lib/features";
import { Footer, Masthead, NewsletterCTA, RecordId } from "@/components/editorial";
import { ReadingProgress, ShareTools } from "@/components/publication-client";

export function generateStaticParams() { return getPublicArticles().map((article) => ({ slug: article.slug })); }
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
    openGraph: { title: article.title, description: article.excerpt, type: "article", url, publishedTime: toIsoEditorialDate(article.date), modifiedTime: toIsoEditorialDate(corrections.filter((item) => item.slug === slug).at(-1)?.date || feature?.updated || article.updated), images: image ? [{ url: image, alt: article.coverCredit || article.title }] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title: article.title, description: article.excerpt, images: image ? [image] : [] },
  };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const feature = getFeature(slug);
  const related = getPublicArticles().filter((candidate) => candidate.slug !== article.slug).map((candidate) => ({
    article: candidate,
    score: candidate.tags.filter((tag) => article.tags.includes(tag)).length * 3 + (candidate.section === article.section ? 2 : 0) + (Boolean(getFeature(candidate.slug)) === Boolean(feature) ? 1 : 0),
  })).filter((item) => item.score > 1).sort((a, b) => b.score - a.score || a.article.slug.localeCompare(b.article.slug)).slice(0, 3).map((item) => item.article);
  const recordCorrections = corrections.filter((item) => item.slug === slug);
  const updated = recordCorrections.at(-1)?.date || feature?.updated || article.updated;
  const sources = Array.from(new Map([...(feature?.sources || [{ label: article.source, publisher: article.source, url: article.sourceUrl, kind: "Source record" }]), ...(article.additionalSources || []).map(source => ({ ...source, publisher: "", kind: "Primary document" }))].map((source) => [source.url, source])).values());
  const headings = feature ? [{ id: "timeline-title", label: "Record timeline" }, ...feature.sections.map((section, index) => ({ id: `section-${index + 1}`, label: section.heading })), { id: "sources-title", label: "Sources & further reading" }] : [{ id: "what-happened", label: "What happened" }, { id: "why-it-matters", label: "Why this record matters" }, { id: "sources-title", label: "Sources & further reading" }];
  const series = getSeries().find((item) => item.slugs.includes(slug));
  const seriesIndex = series?.slugs.indexOf(slug) ?? -1;
  const topics = getTopics().filter((topic) => article.tags.includes(topic.tag));
  const catalog = getCatalog();
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd([schema, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Archive", item: absoluteUrl("/archive") }, { "@type": "ListItem", position: 2, name: article.section, item: absoluteUrl(`/${article.section.toLowerCase()}`) }, { "@type": "ListItem", position: 3, name: article.title, item: absoluteUrl(`/article/${slug}`) }] }]) }} />
    <header className="article-hero" id="main-content" tabIndex={-1}>
      <div className="article-label"><RecordId id={article.recordId}/><Link href={`/${article.section.toLowerCase()}`}>{article.section}</Link><span>{feature ? "Feature" : "Brief record"}</span></div>
      <h1>{article.title}</h1><p className="article-deck">{feature?.standfirst || article.subtitle}</p>
      <div className="article-byline"><div className="author-avatar">RG</div><p>By <Link href={`/author/${article.authorSlug}`}>{article.author}</Link><br/><span><time dateTime={toIsoEditorialDate(article.date)}>Published {article.date}</time> · <span title="Estimated from the displayed editorial text at 210 words per minute">{getReadingLabel(article.slug)} read</span>{updated !== article.date && <> · <time dateTime={toIsoEditorialDate(updated)}>Updated {updated}</time></>}</span></p></div>
    </header>
    {article.cover && <figure className="article-cover semantic-cover"><RecordImage src={article.cover} alt={mediaCredits[article.slug]?.description || article.coverCredit || article.title} priority sizes="(max-width: 1080px) 94vw, 1032px" /><figcaption>{mediaCredits[article.slug]?.description} <span>{article.coverCredit}</span></figcaption></figure>}
    <div className="article-layout">
      <ReaderTools slug={slug} headings={headings} />
      <article className="article-body" id="reading-body" aria-label={article.title}>
        <ShareTools title={article.title} url={absoluteUrl(`/article/${article.slug}`)} />
        <p className="dropcap" id="opening" data-passage>{article.opening}</p>
        {feature ? <>
          <div className="record-context"><span>Location</span><strong>{feature.location}</strong><span>Record type</span><strong>Expanded feature</strong></div>
          <section className="article-timeline" aria-labelledby="timeline-title"><h2 id="timeline-title">Record timeline</h2><ol>{feature.timeline.map((item) => <li key={`${item.date}-${item.event}`}><time>{item.date}</time><p>{item.event}</p></li>)}</ol></section>
          {feature.sections.map((section, index) => <section key={section.heading}><h2 id={`section-${index + 1}`}><a href={`#section-${index + 1}`}>{section.heading}</a></h2>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraph} id={`section-${index + 1}-p-${paragraphIndex + 1}`} data-passage>{paragraph}</p>)}</section>)}
        </> : <>
          <h2 id="what-happened"><a href="#what-happened">What happened</a></h2><p id="context" data-passage>{article.context}</p>
          <p className="record-summary">{article.excerpt}</p>
          <h2 id="why-it-matters"><a href="#why-it-matters">Why this record matters</a></h2><p id="significance" data-passage>{article.significance}</p>
        </>}
        <div className="method-note"><span>Method</span><p>{feature ? "This is an AI-assisted archival synthesis, not original reporting. Sources are linked for readers to examine; their presence does not mean every claim has received independent human review." : "This AI-assisted brief introduces the event and its source trail. It is not original reporting or a claim that every detail has been independently checked."}</p>{feature && <p>{feature.evidenceNote}</p>}<Link href="/standards">Read our editorial standards →</Link></div>
        <section className="sources" aria-labelledby="sources-title"><h2 id="sources-title">Sources &amp; further reading</h2><p className="source-intro">Inspect the documents behind this record. Source types describe the material, not a verification score.</p><ol>{sources.map((source, index) => <li id={`source-${index + 1}`} key={source.url}><span>{source.kind}</span><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>{"publisher" in source && source.publisher !== source.label ? <small>{source.publisher}</small> : null}<SourcePreview source={source} index={index + 1} /></li>)}</ol></section>
        {mediaCredits[article.slug] && <aside className="method-note"><span>Image source &amp; reuse</span><p>{mediaCredits[article.slug].note}</p><a href={mediaCredits[article.slug].source}>Original image record</a>{" · "}<a href={mediaCredits[article.slug].licenseUrl}>{mediaCredits[article.slug].license}</a></aside>}
        {recordCorrections.map((item) => <aside className="method-note" key={item.date}><span>Correction · {item.date}</span><p>{item.note}</p><a href={item.sourceUrl}>Supporting record →</a></aside>)}
        <div className="correction-line"><span>See something wrong or incomplete?</span><Link href={`/corrections?record=${article.recordId}`}>Send a correction</Link></div>
        <div className="author-block"><div className="author-avatar large">RG</div><div><span>Founder &amp; editor</span><h3><Link href={`/author/${article.authorSlug}`}>{article.author}</Link></h3><p>Ryan publishes evidence-led records of events that were overlooked, flattened into trivia or never explained with enough care.</p></div></div>
        <div className="topic-links" aria-label="Article topics">{topics.map((topic) => <Link key={topic.slug} href={`/topic/${topic.slug}`}>{topic.name} ↗</Link>)}</div>
        {series && <nav className="series-continuation" aria-label="Continue reading series"><span className="eyebrow">Reading path · {seriesIndex + 1} of {series.slugs.length}</span><h2><Link href={`/series/${series.slug}`}>{series.title}</Link></h2><p>Suggested sequence through existing records.</p><div>{seriesIndex > 0 && <Link href={`/article/${series.slugs[seriesIndex - 1]}`}>← Previous record</Link>}{seriesIndex < series.slugs.length - 1 && <Link href={`/article/${series.slugs[seriesIndex + 1]}`}>Next record →</Link>}<Link href={`/series/${series.slug}`}>View full series</Link></div></nav>}
      </article>
    </div>
    {related.length > 0 && <section className="related-reporting"><div className="module-heading"><h2>Continue the record</h2><span>Connected by subject or section</span></div>{related.map((record) => <StoryCard key={record.slug} story={catalog.find((item) => item.slug === record.slug)!} variant="compact" />)}</section>}<NewsletterCTA />
    <Footer />
  </main>;
}
