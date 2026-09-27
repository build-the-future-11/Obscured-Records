import Link from "next/link";
import { DiscoveryShell } from "@/components/discovery";
import { getSeries } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("/series", "Reading series", "Ordered reading paths through published records, connected by a question.");
export default function Series() { return <DiscoveryShell eyebrow="Stay with a question" title="Reading series" description="Thematic paths through existing records. Each sequence is a suggested reading order, not the chronology of a new investigation."><div className="series-directory">{getSeries().map((series, i) => <Link href={`/series/${series.slug}`} key={series.slug}><span className="card-number">0{i + 1}</span><div><h2>{series.title}</h2><p>{series.description}</p><small>{series.slugs.length} records · Start reading →</small></div></Link>)}</div></DiscoveryShell>; }
