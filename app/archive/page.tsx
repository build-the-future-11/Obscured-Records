import { Footer, Masthead } from "@/components/editorial";
import { ArchiveBrowser } from "@/components/archive-browser";
import { getCatalog, getSeries } from "@/lib/catalog";
import { parseFilters } from "@/lib/catalog-filter";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("/archive", "The archive", "Browse every published record by subject, author, publication date and reading series.");
export default async function Archive({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initial = parseFilters(await searchParams);
  return <main><Masthead /><section className="discovery-page" id="main-content" tabIndex={-1}><header className="discovery-heading"><span className="eyebrow">The complete record</span><h1>The archive</h1><p>Follow a question across events, institutions and time.</p><small>Dates below are publication dates. Historical event dates are searchable.</small></header><ArchiveBrowser key={JSON.stringify(initial)} stories={getCatalog()} initial={initial} series={getSeries()} /></section><Footer /></main>;
}
