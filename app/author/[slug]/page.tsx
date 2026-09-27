import { getCatalog } from "@/lib/catalog";
import { StoryCard } from "@/components/story-card";
import { SeriesLinks } from "@/components/discovery";
import { serializeJsonLd } from "@/lib/discovery";
import { absoluteUrl } from "@/lib/site";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicArticles } from "@/lib/articles";
import { pageMetadata } from "@/lib/page-metadata";
import { Footer, Masthead } from "@/components/editorial";
export function generateStaticParams() { return [...new Set(getPublicArticles().map((article) => article.authorSlug))].map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getPublicArticles().find((entry) => entry.authorSlug === slug);
  return article ? pageMetadata(`/author/${slug}`, article.author, `Filed records by ${article.author} at Obscured Records.`) : {};
}
export default async function Author({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stories = getPublicArticles().filter((article) => article.authorSlug === slug);
  if (!stories.length) notFound();
  const name = stories[0].author;
  return <main><Masthead/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ "@context": "https://schema.org", "@type": "Person", name, url: absoluteUrl(`/author/${slug}`) }) }} /><section className="author-page" id="main-content" tabIndex={-1}><div className="author-avatar hero-avatar">{name.split(" ").map((part) => part[0]).join("")}</div><span>Founder &amp; editor / O.R</span><h1>{name}</h1><p>{name} founded Obscured Records to build a permanent, sourced home for real events that were overlooked, flattened into trivia or never explained with enough care. The archive includes AI-assisted copy and links to the documents behind its records. Method notes explain the scope of each entry; an author credit does not certify a completed independent fact check.</p><Link className="arrow-link author-contact" href="mailto:ryangomez.hs@gmail.com">Contact the editor →</Link></section><section className="author-stories"><div className="module-heading"><h2>Filed records</h2><Link href={`/archive?author=${slug}`}>Explore in archive ↗</Link></div>{getCatalog().filter((story) => story.authorSlug === slug).map((story) => <StoryCard key={story.slug} story={story} variant="horizontal" />)}<SeriesLinks slugs={stories.map((story) => story.slug)} /></section><Footer/></main>;
}
