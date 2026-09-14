import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { articles, worldUpdates } from "@/lib/articles";
import { Footer, LiveTicker, Masthead, NewsletterCTA, RecordId, SectionHeader, StoryMeta } from "@/components/editorial";

export default function Home() {
  const lead = articles[0];
  return <main>
    <LiveTicker /><Masthead />
    <section className="lead" aria-labelledby="lead-title">
      <div className="lead-copy"><StoryMeta article={lead} inverse /><h1 id="lead-title">THE ROUTE<br />EVERYONE<br /><span className="revealed-word">MISSED</span></h1><p>{lead.subtitle}</p><Link className="arrow-link inverse" href={`/article/${lead.slug}`}>Read the record <ArrowUpRight /></Link><div className="lead-index" aria-label="Story position"><strong>01</strong><span>02</span><span>03</span><span>04</span></div></div>
      <Link href={`/article/${lead.slug}`} className="lead-image image-sea" aria-label={`Read ${lead.title}`}><span className="image-caption">THE MOZAMBIQUE CHANNEL<br />15° 37′ S, 41° 44′ E</span><span className="image-credit">FIELD IMAGE / O.R ARCHIVE</span></Link>
      <aside className="now-rail"><p>NOW / LIVE DESK</p>{articles.slice(1,5).map((story,i)=><Link key={story.slug} href={`/article/${story.slug}`}><time>{["11:24","10:17","08:53","07:41"][i]}</time><span>{story.title}</span></Link>)}</aside>
    </section>

    <section className="paper-section latest-section"><SectionHeader number="01" title="Latest" note="Dispatches, signals and the context behind them." /><div className="latest-grid">
      <article className="latest-feature"><Link href={`/article/${articles[1].slug}`} className="story-image image-grid"><span>RECORD 0197</span></Link><StoryMeta article={articles[1]} /><h2><Link href={`/article/${articles[1].slug}`}>{articles[1].title}</Link></h2><p>{articles[1].excerpt}</p></article>
      <article className="type-story"><RecordId id={articles[2].recordId} /><p className="kicker">{articles[2].section} / Analysis</p><h2><Link href={`/article/${articles[2].slug}`}>{articles[2].title}</Link></h2><StoryMeta article={articles[2]} /></article>
      <div className="compact-stack">{articles.slice(3,6).map(story=><article className="compact-story" key={story.slug}><StoryMeta article={story} /><h3><Link href={`/article/${story.slug}`}>{story.title}</Link></h3><p>{story.excerpt}</p></article>)}</div>
    </div></section>

    <section className="dark-section underreported-section"><SectionHeader number="02" title="Underreported" note="The overlooked stories. The missing context. The records that still matter." inverse /><div className="under-grid">{articles.filter(a=>a.underreported).slice(0,4).map((story,i)=><article key={story.slug} className={`under-story under-${i+1}`}><div className={`under-visual visual-${i+1}`} aria-hidden="true"><span>0{i+1}</span></div><RecordId id={story.recordId} inverse /><h3><Link href={`/article/${story.slug}`}>{story.title}</Link></h3><p>{story.excerpt}</p><StoryMeta article={story} inverse /></article>)}</div><Link href="/underreported" className="arrow-link inverse section-link">All underreported stories <ArrowUpRight /></Link></section>

    <section className="world-section dark-section"><SectionHeader number="03" title="The world right now" note="Five places. Five signals. One moving record." inverse /><div className="world-grid"><div className="world-map" aria-label="Stylized world activity map"><svg viewBox="0 0 900 470" role="img" aria-label="World map with five active story locations"><path d="M60 105l70-46 94 11 68 55-36 47-67 11-32 56-54-5-15-58-45-31zM250 264l49 19 34 65-18 94-41-26-26-86zM390 93l74-37 97 18 47-22 105 45 91 2 55 59-47 63-101-6-28 54-57-20-59 30-43-50-81-17-44-66zM582 285l51 24 30 66-27 59-60-15-22-75zM760 331l61-16 47 41-24 39-64-1-36-34z" />{[[170,150],[515,120],[612,205],[463,183],[278,350]].map(([cx,cy],i)=><g key={i}><circle cx={cx} cy={cy} r="5" className="map-dot"/><circle cx={cx} cy={cy} r="14" className="map-ring"/></g>)}</svg></div><div className="updates">{worldUpdates.map(update=><div className="update" key={update.city}><time>{update.time}</time><div><strong>{update.city}</strong><p>{update.text}</p></div></div>)}<Link href="/latest" className="arrow-link inverse">View live desk <ArrowUpRight /></Link></div></div></section>

    <section className="paper-section most-read"><SectionHeader number="04" title="Most read" note="The records readers are returning to." /><ol>{articles.slice(1,6).map((story,i)=><li key={story.slug}><span className="rank">0{i+1}</span><div><span className="kicker">{story.section}</span><h3><Link href={`/article/${story.slug}`}>{story.title}</Link></h3></div><span className="read-time">{story.readingTime}</span><span className={`thumb visual-${i+1}`} /></li>)}</ol></section>
    <NewsletterCTA /><Footer />
  </main>;
}
