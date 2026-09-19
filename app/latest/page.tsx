import Link from "next/link";
import { articles } from "@/lib/articles";
import { getFeature, getReadingLabel } from "@/lib/features";
import { ArchiveTicker, Footer, Masthead, NewsletterCTA, SectionHeader } from "@/components/editorial";

export const metadata = { title: "Archive", description: "Every filed record from Obscured Records, ordered by record number." };

export default function Latest() {
  return <main><ArchiveTicker/><Masthead/>
    <section className="listing-hero"><span>Complete index / 28 records</span><h1>Archive</h1><p>Every feature and brief currently filed. Entries are ordered by record number, not by invented urgency.</p></section>
    <section className="latest-stream"><SectionHeader number="00" title="All records" note="Published 14 September 2026. Expanded features updated 19 September 2026."/>
      {articles.map((article) => <article key={article.slug}>
        <time>#{article.recordId}</time><span className="stream-section">{article.section}</span>
        <div><span className="format-label">{getFeature(article.slug)?"Expanded feature":"Brief record"}</span><h2><Link href={`/article/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p></div>
        <span className="stream-reading">{getReadingLabel(article.slug)}</span>
      </article>)}
    </section><NewsletterCTA/><Footer/></main>;
}
