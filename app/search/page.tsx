import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { Search as SearchIcon } from "lucide-react";
import { articles } from "@/lib/articles";
import { getFeature } from "@/lib/features";
import { MAX_SEARCH_QUERY_LENGTH, normalizeSearchQuery } from "@/lib/search-query";
import { Footer, Masthead, StoryMeta } from "@/components/editorial";

export const metadata = { ...pageMetadata("/search", "Search the archive", "Search Obscured Records by subject, event or record number."), robots: { index: false, follow: true } };

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = normalizeSearchQuery((await searchParams).q);
  const query = q.toLowerCase();
  const results = query ? articles.filter((article) => [article.title, article.subtitle, article.excerpt, article.section, article.eventDate, article.recordId, ...article.tags].join(" ").toLowerCase().includes(query)) : [];
  return <main><Masthead/><section className="search-page" id="main-content" tabIndex={-1}>
    <span>O.R / Search the archive</span>
    <form action="/search" method="get"><label htmlFor="q">Search stories, subjects, dates and record numbers</label><div><input id="q" name="q" defaultValue={q} maxLength={MAX_SEARCH_QUERY_LENGTH} placeholder="Try “mercury”, “aviation” or “0421”"/><button aria-label="Search" type="submit"><SearchIcon/></button></div></form>
    {query ? <><div className="search-summary"><h1>{results.length} {results.length === 1 ? "record" : "records"}</h1><p>Results for “{q}”</p></div>{results.length ? results.map((article) => <article key={article.slug}><StoryMeta article={article}/><div><span className="format-label">{getFeature(article.slug)?"Expanded feature":"Brief record"}</span><h2><Link href={`/article/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p></div></article>) : <div className="search-empty"><h2>No record matches that search.</h2><p>Try a place, event, subject or four-digit record number.</p></div>}</> : <><h1>Search all {articles.length} records.</h1><p className="search-intro">The index covers aviation, corporate fraud, environmental disasters, medical technology, infrastructure and political history.</p></>}
  </section><Footer/></main>;
}
