import { Footer, Masthead } from "@/components/editorial";
import { ReadingLibrary } from "@/components/reader-library";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = { ...pageMetadata("/saved", "Your saved stories", "A quiet place to return to your reading."), robots: { index: false, follow: true } };
export default function Saved() { return <main><Masthead /><section className="discovery-page" id="main-content" tabIndex={-1}><header className="discovery-heading"><span className="eyebrow">Your reading, at your pace</span><h1>Saved stories</h1></header><ReadingLibrary stories={getCatalog()} /></section><Footer /></main>; }
