import { RecordImage } from "@/components/record-image";
import Link from "next/link";
import { getArticle } from "@/lib/articles";
import { getCatalog, getTopics } from "@/lib/catalog";
import { mediaCredits } from "@/lib/media";
import { pageMetadata } from "@/lib/page-metadata";
import { Footer, ArchiveTicker, Masthead, NewsletterCTA } from "@/components/editorial";
import { StoryCard } from "@/components/story-card";
import { SeriesLinks } from "@/components/discovery";
export const metadata = { ...pageMetadata("/", "Obscured Records", "Documented histories that were overlooked, flattened into trivia or never explained with enough care."), title: { absolute: "Obscured Records" } };
export default function Home() {
  const stories = getCatalog(); const lead = getArticle("fedex-flight-705") || getArticle(stories[0]?.slug);
  if (!lead) return <main><Masthead /><section className="discovery-page" id="main-content"><h1>The archive is being reviewed</h1><p>Records appear after publication.</p></section><Footer /></main>;
  const secondary = ["wirecard-missing-billions", "goiania-blue-powder"].flatMap((slug) => stories.filter((s) => s.slug === slug));
  const feature = stories.find((s) => s.slug === "therac-25");
  const topics = getTopics().slice(0, 8);
  return <main className="publication-home"><ArchiveTicker /><Masthead />
    <div className="edition-line"><span>Independent histories. Open source trails.</span><Link href="/standards">How we build the record ↗</Link></div>
    <section className="home-lead" id="main-content" tabIndex={-1} aria-labelledby="lead-title"><div className="home-lead-copy"><span className="eyebrow">The lead record / {lead.section}</span><h1 id="lead-title"><Link href={`/article/${lead.slug}`}>{lead.title}</Link></h1><p className="lead-dek">{lead.subtitle}</p><p className="lead-byline">By <Link href={`/author/${lead.authorSlug}`}>{lead.author}</Link> · {lead.date}</p><Link className="text-link" href={`/article/${lead.slug}`}>Open the record ↗</Link></div>{lead.cover && <figure><Link href={`/article/${lead.slug}`} aria-label={`Read ${lead.title}`}><RecordImage src={lead.cover} alt={mediaCredits[lead.slug]?.description || lead.title} priority /></Link><figcaption>{lead.coverCredit}</figcaption></figure>}</section>
    <section className="home-secondary" aria-label="More featured records">{secondary.map((story) => <StoryCard key={story.slug} story={story} variant="horizontal" />)}</section>
    <section className="home-editorial"><div className="home-feature"><div className="module-heading"><h2>A closer reading</h2><span>From the feature archive</span></div>{feature && <StoryCard story={feature} variant="feature" />}</div><div className="home-latest"><div className="module-heading"><h2>Latest records</h2><Link href="/latest">All latest ↗</Link></div>{stories.slice(0, 5).map((story) => <StoryCard key={story.slug} story={story} variant="latest" />)}</div></section>
    <div className="home-series"><SeriesLinks /></div>
    <section className="home-topics"><div><span className="eyebrow">Find the thread</span><h2>One event is rarely<br />the whole story.</h2><p>Explore the subjects that connect the archive.</p><Link className="text-link" href="/topics">All topics ↗</Link></div><div className="home-topic-list">{topics.map((topic) => <Link href={`/topic/${topic.slug}`} key={topic.slug}><span>{topic.name}</span><small>{topic.count} records ↗</small></Link>)}</div></section>
    <section className="archive-invitation"><span className="eyebrow">Keep looking</span><h2>{stories.length} records.<br />More than one way in.</h2><p>Search by event. Follow an author. Read across a subject.</p><Link className="text-link" href="/archive">Explore the complete archive →</Link></section><NewsletterCTA /><Footer />
  </main>;
}
