import { displayCover } from "@/lib/media-policy";
import { selectHomepage } from "@/lib/homepage";
import { RecordImage } from "@/components/record-image";
import Link from "next/link";
import { getArticle } from "@/lib/articles";
import { getCatalog, getTopics } from "@/lib/catalog";
import { mediaCredits } from "@/lib/media";
import { pageMetadata } from "@/lib/page-metadata";
import { Footer, ArchiveTicker, Masthead, NewsletterCTA } from "@/components/editorial";
import { StoryCard } from "@/components/story-card";
import { SeriesLinks } from "@/components/discovery";
export const metadata = { ...pageMetadata("/", "Obscured Records", "Independent, youth-led journalism for overlooked stories, original reporting and evidence-driven investigations."), title: { absolute: "Obscured Records" } };
const divisions = [
  { number: "01", name: "Editorial", copy: "Context-rich reporting and analysis that makes consequential stories clear, useful and hard to ignore.", href: "/desks/editorial" },
  { number: "02", name: "Originals", copy: "Distinctive features built from firsthand questions, primary sources and reporting that begins with curiosity.", href: "/desks/originals" },
  { number: "03", name: "Investigations", copy: "Patient, evidence-led work that follows systems, records and accountability beyond the first headline.", href: "/desks/investigations" },
] as const;
export default function Home() {
  const stories = getCatalog();
  const edition = selectHomepage(stories);
  const lead = edition.lead ? getArticle(edition.lead.slug) : undefined;
  if (!lead) return <main><Masthead /><section className="discovery-page" id="main-content"><h1>The archive is being reviewed</h1><p>Records appear after publication.</p></section><Footer /></main>;
  const { secondary, feature, latest } = edition;
  const cover = displayCover(lead);
  const topics = getTopics().slice(0, 8);
  return <main className="publication-home"><ArchiveTicker /><Masthead />
    <section className="relaunch-hero" id="main-content" tabIndex={-1} aria-labelledby="relaunch-title">
      <div className="relaunch-hero-copy"><span className="eyebrow">Independent / Youth-led / Relaunch 2026</span><h1 id="relaunch-title">The stories we miss shape the world we see.</h1><p>Obscured Records reports beyond the obvious: original journalism, investigations and evidence-led coverage of the issues that slip past the daily news cycle.</p><div className="relaunch-actions"><Link className="relaunch-primary" href="/contribute">Join The Stories We Miss</Link><Link className="relaunch-secondary" href="/latest">Read the latest records</Link></div></div>
      <aside className="relaunch-index" aria-label="Relaunch at a glance"><span className="relaunch-mark" aria-hidden="true">O/R</span><dl><div><dt>Divisions</dt><dd>Editorial · Originals · Investigations</dd></div><div><dt>Previously reported reach</dt><dd>≈2.2 million views</dd></div><div><dt>Open call</dt><dd>Writers · Reporters · Researchers · Visual storytellers</dd></div></dl></aside>
    </section>
    <section className="division-grid" aria-labelledby="division-title"><header><span className="eyebrow">One newsroom / Three ways to report</span><h2 id="division-title">Go deeper than the feed.</h2></header><div>{divisions.map((division) => <article key={division.name}><span>{division.number}</span><h3>{division.name}</h3><p>{division.copy}</p><Link href={division.href}>Explore the desk <span aria-hidden="true">↗</span></Link></article>)}</div></section>
    <section className="newsroom-now" aria-labelledby="newsroom-now-title"><header><span className="eyebrow">Newsroom now / Relaunch priorities</span><h2 id="newsroom-now-title">What we are<br />building next.</h2><Link className="text-link" href="/about">About the relaunch →</Link></header><div><article><span>Active</span><h3>Recruit the contributor team</h3><p>Open roles across reporting, research, editing and visual storytelling.</p><Link href="/contribute">Join the open call ↗</Link></article><article><span>In development</span><h3>Publication partnerships</h3><p>Building a careful outreach pipeline for youth reporting and distribution.</p><Link href="/about#collaborations">View relationship stages ↗</Link></article><article><span>Ongoing</span><h3>Pitch and archive review</h3><p>Strengthening the path from incoming idea to sourced, human-approved publication.</p><Link href="/standards">See the review standard ↗</Link></article><article><span>Prototyping</span><h3>Story discovery research</h3><p>Developing verification, originality and computational discovery methods.</p><Link href="/about#collaborations">Read the research boundary ↗</Link></article></div></section>
    <div className="edition-line"><span>From the record / Evidence you can inspect</span><Link href="/standards">How we build the record ↗</Link></div>
    <section className={`home-lead${cover ? "" : " home-lead-text"}`} aria-labelledby="lead-title"><div className="home-lead-copy"><span className="eyebrow">The lead record / {lead.section}</span><h2 id="lead-title"><Link href={`/article/${lead.slug}`}>{lead.title}</Link></h2><p className="lead-dek">{lead.subtitle}</p><p className="lead-byline">By <Link href={`/author/${lead.authorSlug}`}>{lead.author}</Link> · {lead.date}</p><Link className="text-link" href={`/article/${lead.slug}`}>Open the record ↗</Link></div>{cover && <figure><Link href={`/article/${lead.slug}`} aria-label={`Read ${lead.title}`}><RecordImage src={cover} alt={mediaCredits[lead.slug]?.description || lead.title} priority /></Link><figcaption>{lead.coverCredit}</figcaption></figure>}</section>
    <section className="home-secondary" aria-label="More featured records">{secondary.map((story) => <StoryCard key={story.slug} story={story} variant="horizontal" />)}</section>
    <section className="home-editorial"><div className="home-feature"><div className="module-heading"><h2>A closer reading</h2><span>From the feature archive</span></div>{feature && <StoryCard story={feature} variant="feature" />}</div><div className="home-latest"><div className="module-heading"><h2>Latest records</h2><Link href="/latest">All latest ↗</Link></div>{latest.map((story) => <StoryCard key={story.slug} story={story} variant="latest" />)}</div></section>
    <section className="stories-we-miss" aria-labelledby="stories-we-miss-title"><div className="stories-we-miss-number" aria-hidden="true">SWM / 01</div><div><span className="eyebrow">Open contributor call</span><h2 id="stories-we-miss-title">The Stories<br />We Miss</h2></div><div className="stories-we-miss-copy"><p>What is important in your community, field or generation—but still absent from the record?</p><p>Bring the question. We are building a team to help report, research, verify, edit and visualize the answer.</p><Link className="relaunch-primary" href="/contribute">Find your role</Link></div></section>
    <div className="home-series"><SeriesLinks /></div>
    <section className="home-topics"><div><span className="eyebrow">Find the thread</span><h2>One event is rarely<br />the whole story.</h2><p>Explore the subjects that connect the archive.</p><Link className="text-link" href="/topics">All topics ↗</Link></div><div className="home-topic-list">{topics.map((topic) => <Link href={`/topic/${topic.slug}`} key={topic.slug}><span>{topic.name}</span><small>{topic.count} records ↗</small></Link>)}</div></section>
    <section className="archive-invitation"><span className="eyebrow">Keep looking</span><h2>{stories.length} records.<br />More than one way in.</h2><p>Search by event. Follow an author. Read across a subject.</p><Link className="text-link" href="/archive">Explore the complete archive →</Link></section><section className="newsroom-invitation"><span className="eyebrow">Research and collaboration</span><h2>Build better ways to<br />find what gets missed.</h2><p>We are developing source-verification methods, originality assessments and computational approaches to story discovery—with every relationship described at its actual stage.</p><Link className="text-link" href="/about#collaborations">See the collaboration ledger →</Link></section><NewsletterCTA /><Footer />
  </main>;
}
