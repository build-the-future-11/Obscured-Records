import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Masthead } from "@/components/editorial";
import { StoryCard } from "@/components/story-card";
import { getCatalog } from "@/lib/catalog";
import { deskSlugs, editorialDesks, getDesk } from "@/lib/desks";
import { pageMetadata } from "@/lib/page-metadata";

export function generateStaticParams() { return deskSlugs.map((desk) => ({ desk })); }

export async function generateMetadata({ params }: { params: Promise<{ desk: string }> }) {
  const { desk: slug } = await params;
  const desk = getDesk(slug);
  return desk ? pageMetadata(`/desks/${desk.slug}`, `${desk.name} desk`, desk.description) : {};
}

export default async function DeskPage({ params }: { params: Promise<{ desk: string }> }) {
  const { desk: slug } = await params;
  const desk = getDesk(slug);
  if (!desk) notFound();
  const catalog = getCatalog();
  const archiveStories = desk.archiveSlugs.map((storySlug) => catalog.find((story) => story.slug === storySlug)).filter((story) => story !== undefined);
  return <main><Masthead /><article className="desk-page" id="main-content" tabIndex={-1}>
    <header className="desk-hero"><div><span className="eyebrow">Desk {desk.number} / Relaunch division</span><h1>{desk.name}</h1><p>{desk.thesis}</p></div><aside><span>Mandate</span><p>{desk.description}</p><Link href="/contribute">Work with this desk ↗</Link></aside></header>
    <nav className="desk-switcher" aria-label="Editorial desks">{editorialDesks.map((item) => <Link key={item.slug} href={`/desks/${item.slug}`} aria-current={item.slug === desk.slug ? "page" : undefined}><span>{item.number}</span>{item.name}</Link>)}</nav>
    <section className="desk-mandate" aria-labelledby="mandate-title"><header><span className="eyebrow">What this desk does</span><h2 id="mandate-title">A clear mandate.</h2></header><ol>{desk.mandate.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ol></section>
    <section className="desk-questions" aria-labelledby="questions-title"><header><span className="eyebrow">The reporting test</span><h2 id="questions-title">Questions before<br />a story moves.</h2></header><ol>{desk.questions.map((question, index) => <li key={question}><span>0{index + 1}</span><p>{question}</p></li>)}</ol></section>
    <section className="desk-archive" aria-labelledby="archive-title"><div className="module-heading"><h2 id="archive-title">Read from the archive</h2><Link href="/archive">Complete archive ↗</Link></div><p className="desk-archive-note">Previously published records selected for related themes or formats. Inclusion here does not claim they were produced by the relaunched {desk.name} desk.</p>{archiveStories.map((story, index) => <StoryCard key={story.slug} story={story} variant={index === 0 ? "feature" : "horizontal"} number={index + 1} />)}</section>
    <section className="desk-next"><span className="eyebrow">Bring us the next record</span><h2>What are we<br />still missing?</h2><p>Send a question, source trail or contributor introduction. Editorial acceptance, responsibilities and publication are agreed separately.</p><Link className="relaunch-primary" href="/contribute">Start an introduction</Link></section>
  </article><Footer /></main>;
}
