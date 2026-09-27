import { notFound } from "next/navigation";
import Link from "next/link";
import { sections, getPublicArticles } from "@/lib/articles";
import { getCatalog, getTopics } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-metadata";
import { DiscoveryShell, SeriesLinks } from "@/components/discovery";
import { StoryCard } from "@/components/story-card";
const copy: Record<string, string> = { world: "Power, borders, conflict and the lives caught between them.", business: "Accounts, institutions and the distance between what was reported and what could be verified.", technology: "Systems, machines and the decisions built into them.", science: "Evidence, uncertainty and the consequences of hazards we struggle to see.", culture: "Ideas, memory and the institutions that shape the public record.", underreported: "Overlooked histories, missing context and records that reward a closer reading." };
export function generateStaticParams() { return sections.map((section) => ({ section: section.toLowerCase() })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; const title = sections.find((name) => name.toLowerCase() === section); return title ? pageMetadata(`/${section}`, title, copy[section]) : {}; }
export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params; const title = sections.find((name) => name.toLowerCase() === section); if (!title) notFound();
  const slugs = getPublicArticles().filter((a) => section === "underreported" ? a.underreported : a.section.toLowerCase() === section).map((a) => a.slug);
  const stories = getCatalog().filter((s) => slugs.includes(s.slug)); const lead = stories.find((s) => s.format === "feature") || stories[0];
  const topics = getTopics().filter((t) => stories.some((s) => s.tags.includes(t.tag)));
  return <DiscoveryShell eyebrow="Section / Obscured Records" title={title} description={copy[section]}><nav className="topic-links" aria-label="Subjects in this section">{topics.map((t) => <Link key={t.slug} href={`/topic/${t.slug}`}>{t.name}</Link>)}</nav>{lead && <StoryCard story={lead} variant="feature" />}<div className="module-heading"><h2>From the section</h2><span>{stories.length} published records</span></div>{stories.filter((s) => s.slug !== lead?.slug).map((story) => <StoryCard key={story.slug} story={story} variant="horizontal" />)}<SeriesLinks slugs={slugs} /></DiscoveryShell>;
}
