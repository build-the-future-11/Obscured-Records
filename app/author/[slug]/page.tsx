import { notFound } from "next/navigation";
import Link from "next/link";
import { articles } from "@/lib/articles";
import { pageMetadata } from "@/lib/page-metadata";
import { Footer, Masthead, StoryMeta } from "@/components/editorial";
export function generateStaticParams() { return [...new Set(articles.map((article) => article.authorSlug))].map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((entry) => entry.authorSlug === slug);
  return article ? pageMetadata(`/author/${slug}`, article.author, `Filed records by ${article.author} at Obscured Records.`) : {};
}
export default async function Author({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stories = articles.filter((article) => article.authorSlug === slug);
  if (!stories.length) notFound();
  const name = stories[0].author;
  return <main><Masthead/><section className="author-page" id="main-content" tabIndex={-1}><div className="author-avatar hero-avatar">{name.split(" ").map((part) => part[0]).join("")}</div><span>Founder &amp; editor / O.R</span><h1>{name}</h1><p>{name} founded Obscured Records to build a permanent, sourced home for real events that were overlooked, flattened into trivia or never explained with enough care. Every published record is currently written and edited by him.</p><Link className="arrow-link author-contact" href="mailto:ryangomez.hs@gmail.com">Contact the editor →</Link></section><section className="author-stories"><h2>Filed records</h2>{stories.map((article) => <article key={article.slug}><StoryMeta article={article}/><h3><Link href={`/article/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p></article>)}</section><Footer/></main>;
}
