import Link from "next/link";
import { Footer, Masthead } from "./editorial";
import { getSeries } from "@/lib/catalog";
export function DiscoveryShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <main><Masthead /><section className="discovery-page" id="main-content" tabIndex={-1}><header className="discovery-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>{children}</section><Footer /></main>;
}
export function SeriesLinks({ slugs }: { slugs?: string[] }) {
  const series = getSeries().filter((s) => !slugs || s.slugs.some((slug) => slugs.includes(slug)));
  if (!series.length) return null;
  return <section className="series-module"><div className="module-heading"><h2>Read a little further</h2><Link href="/series">All reading series ↗</Link></div><div className="series-list">{series.map((s, i) => <Link key={s.slug} href={`/series/${s.slug}`}><span className="eyebrow">Reading series / 0{i + 1}</span><h3>{s.title}</h3><p>{s.description}</p><small>{s.slugs.length} records →</small></Link>)}</div></section>;
}
