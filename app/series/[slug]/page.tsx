import { notFound } from "next/navigation";
import Link from "next/link";
import { DiscoveryShell } from "@/components/discovery";
import { StoryCard } from "@/components/story-card";
import { getCatalog, getSeries } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-metadata";
export function generateStaticParams() { return getSeries().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const series = getSeries().find((s) => s.slug === slug); return series ? pageMetadata(`/series/${slug}`, series.title, series.description) : {}; }
export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const series = getSeries().find((s) => s.slug === slug); if (!series) notFound(); const catalog = getCatalog(); const stories = series.slugs.map((slug) => catalog.find((s) => s.slug === slug)!);
  return <DiscoveryShell eyebrow={`Reading series / ${stories.length} records`} title={series.title} description={series.description}><p className="device-note">Suggested reading order through previously published records. By <Link href={`/author/${stories[0].authorSlug}`}>{stories[0].author}</Link>.</p>{stories.map((story, i) => <StoryCard key={story.slug} story={story} variant={i === 0 ? "feature" : "horizontal"} number={i + 1} />)}<Link className="text-link" href="/series">Explore another series →</Link></DiscoveryShell>;
}
