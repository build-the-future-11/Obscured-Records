import { Footer, Masthead } from "@/components/editorial";
import { ArchiveBrowser } from "@/components/archive-browser";
import { getCatalog, getSeries } from "@/lib/catalog";
import { parseFilters } from "@/lib/catalog-filter";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = { ...pageMetadata("/search", "Search the archive", "Find records by event, topic, author and source context."), robots: { index: false, follow: true } };
export default async function Search({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <main><Masthead /><section className="discovery-page" id="main-content" tabIndex={-1}><header className="discovery-heading"><span className="eyebrow">Follow the evidence</span><h1>Search the record</h1><p>A place, an event, a question. Start anywhere.</p></header><ArchiveBrowser stories={getCatalog()} initial={parseFilters(await searchParams)} series={getSeries()} search /></section><Footer /></main>;
}
