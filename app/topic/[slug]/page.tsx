import Link from "next/link";
import { notFound } from "next/navigation";
import { DiscoveryShell, SeriesLinks } from "@/components/discovery";
import { StoryCard } from "@/components/story-card";
import { getCatalog, getTopics } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-metadata";
export function generateStaticParams() { return getTopics().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const topic = getTopics().find((t) => t.slug === slug); return topic ? pageMetadata(`/topic/${slug}`, topic.name, topic.description) : {}; }
export default async function Topic({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const topics = getTopics(); const topic = topics.find((t) => t.slug === slug); if (!topic) notFound();
  const stories = getCatalog().filter((s) => s.tags.includes(topic.tag));
  const lead = stories.find((s) => s.format === "feature") || stories[0];
  const related = topics.filter((t) => t.slug !== slug && stories.some((s) => s.tags.includes(t.tag)));
  const authors = [...new Map(stories.map((s) => [s.authorSlug, s.author])).entries()];
  return <DiscoveryShell eyebrow="Topic / Obscured Records" title={topic.name} description={topic.description}>
    <StoryCard story={lead} variant="feature" /><div className="module-heading"><h2>In the record</h2><Link href={`/archive?topic=${encodeURIComponent(topic.tag)}`}>Filter this topic ↗</Link></div>{stories.filter((s) => s.slug !== lead.slug).map((story) => <StoryCard key={story.slug} story={story} />)}
    <SeriesLinks slugs={stories.map((s) => s.slug)} /><section className="topic-connections"><h2>Connected subjects</h2><div className="topic-links">{related.map((t) => <Link key={t.slug} href={`/topic/${t.slug}`}>{t.name} ↗</Link>)}</div><h2>Bylines in this topic</h2>{authors.map(([authorSlug, name]) => <Link key={authorSlug} href={`/author/${authorSlug}`}>{name} →</Link>)}</section>
  </DiscoveryShell>;
}
