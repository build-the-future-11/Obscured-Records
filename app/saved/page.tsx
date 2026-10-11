import { Footer, Masthead } from "@/components/editorial";
import { ReadingLibrary } from "@/components/reader-library";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-metadata";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import Link from "next/link";
export const metadata = { ...pageMetadata("/saved", "Your saved stories", "A quiet place to return to your reading."), robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";
export default async function Saved() { const user = await getChatGPTUser(); return <main><Masthead /><section className="discovery-page" id="main-content" tabIndex={-1}><header className="discovery-heading"><span className="eyebrow">Your reading, at your pace</span><h1>Saved stories</h1>{user && <p>Your account library is available in <Link className="text-link" href="/member">your member space →</Link></p>}</header><ReadingLibrary stories={getCatalog()} /></section><Footer /></main>; }
