import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { archiveLocations, getArticle } from "@/lib/articles";
import { Footer, ArchiveTicker, Masthead, NewsletterCTA, RecordId, SectionHeader, StoryMeta } from "@/components/editorial";

const pick = (slug: string) => getArticle(slug)!;

export default function Home() {
  const lead = pick("fedex-flight-705");
  const evidence = [pick("goiania-blue-powder"), pick("wirecard-missing-billions"), pick("lake-nyos")];
  const dossiers = [pick("therac-25"), pick("minamata-food-chain"), pick("move-bombing"), pick("aral-sea")];
  const desk = [pick("1mdb-global-trail"), pick("banqiao-dam-failure"), pick("petrov-false-alarm"), pick("ss-eastland"), pick("iraq-poison-grain")];

  return <main>
    <ArchiveTicker /><Masthead />
    <section className="lead" aria-labelledby="lead-title">
      <div className="lead-copy">
        <StoryMeta article={lead} inverse />
        <h1 id="lead-title">THE HIJACKING<br />THAT BECAME<br /><span className="revealed-word">COMBAT</span></h1>
        <p>{lead.subtitle}</p>
        <Link className="arrow-link inverse" href={`/article/${lead.slug}`}>Read the full feature <ArrowUpRight /></Link>
        <div className="lead-index" aria-label="Publication promise"><strong>01</strong><span>Evidence</span><span>Context</span><span>Record</span></div>
      </div>
      <Link href={`/article/${lead.slug}`} className="lead-image image-sea" style={{backgroundImage:`linear-gradient(180deg,transparent,rgba(10,10,10,.58)),url('${lead.cover}')`}} aria-label={`Read ${lead.title}`}>
        <span className="image-caption">MCDONNELL DOUGLAS DC-10<br />REGISTRATION N306FE</span><span className="image-credit">{lead.coverCredit}</span>
      </Link>
      <aside className="now-rail"><p>FEATURE DOSSIERS</p>{dossiers.map((story) => <Link key={story.slug} href={`/article/${story.slug}`}><time>RECORD {story.recordId}</time><span>{story.title}</span></Link>)}</aside>
    </section>

    <section className="paper-section latest-section"><SectionHeader number="01" title="Evidence files" note="Three events reconstructed from official reports, public records and research." />
      <div className="evidence-grid">{evidence.map((story, index) => <article key={story.slug} className={index === 0 ? "evidence-lead" : ""}>
        <Link href={`/article/${story.slug}`} className={`evidence-image ${story.cover ? "has-cover" : `visual-${index + 1}`}`} style={story.cover ? {backgroundImage:`linear-gradient(180deg,transparent,rgba(10,10,10,.42)),url('${story.cover}')`} : undefined}><RecordId id={story.recordId} inverse /></Link>
        <StoryMeta article={story} /><h2><Link href={`/article/${story.slug}`}>{story.title}</Link></h2><p>{story.excerpt}</p>
      </article>)}</div>
    </section>

    <section className="dark-section underreported-section"><SectionHeader number="02" title="Deep record" note="Eight expanded features. Each one includes a timeline, multiple source types and a clear account of uncertainty." inverse />
      <div className="under-grid">{dossiers.map((story, index) => <article key={story.slug} className={`under-story under-${index + 1}`}>
        <Link href={`/article/${story.slug}`} className={`under-visual ${story.cover ? "has-cover" : `visual-${index + 1}`}`} style={story.cover ? {backgroundImage:`linear-gradient(180deg,transparent,rgba(20,8,10,.5)),url('${story.cover}')`} : undefined} aria-label={`Read ${story.title}`}><span>0{index + 1}</span></Link>
        <RecordId id={story.recordId} inverse /><h3><Link href={`/article/${story.slug}`}>{story.title}</Link></h3><p>{story.excerpt}</p><StoryMeta article={story} inverse />
      </article>)}</div>
      <Link href="/underreported" className="arrow-link inverse section-link">Browse the underreported archive <ArrowUpRight /></Link>
    </section>

    <section className="world-section dark-section"><SectionHeader number="03" title="Archive atlas" note="Five places where policy, infrastructure and human decisions changed the physical record." inverse />
      <div className="world-grid"><div className="world-map" aria-label="Archive locations map"><svg viewBox="0 0 900 470" role="img" aria-label="World map with five archive locations"><path d="M60 105l70-46 94 11 68 55-36 47-67 11-32 56-54-5-15-58-45-31zM250 264l49 19 34 65-18 94-41-26-26-86zM390 93l74-37 97 18 47-22 105 45 91 2 55 59-47 63-101-6-28 54-57-20-59 30-43-50-81-17-44-66zM582 285l51 24 30 66-27 59-60-15-22-75zM760 331l61-16 47 41-24 39-64-1-36-34z" />{[[170,150],[515,120],[612,205],[463,183],[278,350]].map(([cx,cy],i)=><g key={i}><circle cx={cx} cy={cy} r="5" className="map-dot"/><circle cx={cx} cy={cy} r="14" className="map-ring"/></g>)}</svg></div>
        <div className="updates">{archiveLocations.map((item) => <div className="update" key={item.city}><time>{item.event}</time><div><strong>{item.city}</strong><p>{item.text}</p></div></div>)}<Link href="/latest" className="arrow-link inverse">Open the full archive <ArrowUpRight /></Link></div>
      </div>
    </section>

    <section className="paper-section most-read"><SectionHeader number="04" title="Editor's desk" note="Five concise records selected for the strength of the question they leave behind." />
      <ol>{desk.map((story, index) => <li key={story.slug}><span className="rank">0{index + 1}</span><div><span className="kicker">{story.section} / Brief record</span><h3><Link href={`/article/${story.slug}`}>{story.title}</Link></h3></div><span className="read-time">2 min</span><span className={`thumb visual-${index + 1}`} /></li>)}</ol>
    </section>
    <NewsletterCTA /><Footer />
  </main>;
}
