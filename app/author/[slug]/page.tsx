import { authorInitials, getAuthorProfile } from "@/lib/authors";
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
  const profile = getAuthorProfile(slug, name);
  return <main><Masthead/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ "@context": "https://schema.org", "@type": "Person", name, url: absoluteUrl(`/author/${slug}`) }) }} /><section className="author-page" id="main-content" tabIndex={-1}><div className="author-avatar hero-avatar">{authorInitials(name)}</div><span>{profile.role} / O.R</span><h1>{name}</h1><p>{profile.biography} An author credit does not certify a completed independent fact check.</p>{profile.contact && <a className="arrow-link author-contact" href={profile.contact}>Contact {profile.name} →</a>}</section><section className="author-stories"><div className="module-heading"><h2>Filed records</h2><Link href={`/archive?author=${slug}`}>Explore in archive ↗</Link></div>{getCatalog().filter((story) => story.authorSlug === slug).map((story) => <StoryCard key={story.slug} story={story} variant="horizontal" />)}<SeriesLinks slugs={stories.map((story) => story.slug)} /></section><Footer/></main>;
}
