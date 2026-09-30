import Link from "next/link";
import { Footer, Masthead, NewsletterCTA } from "@/components/editorial";
import { authorProfiles } from "@/lib/authors";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("/about", "About", "The purpose, people and editorial process behind Obscured Records.");
export default function About() {
  const founder = authorProfiles["ryan-gomez"];
  return <main><Masthead /><section className="text-page" id="main-content" tabIndex={-1}>
    <span className="eyebrow">About / O.R</span><h1>History leaves<br />things out.</h1>
    <div className="text-columns"><p>Obscured Records is an independent publication founded by Ryan Gomez for real events that were overlooked, reduced to trivia or never explained with the depth they deserved.</p><p>A permanent, searchable record has room for sources, uncertainty, context and updates that a post or reel cannot hold.</p><p>Follow the documents. Name what is known. Separate evidence from inference. Make the forgotten story readable without making it less true.</p></div>
    <div className="newsroom-grid"><section><span className="eyebrow">Coverage</span><h2>Look beyond the headline.</h2><p>Explore science, technology, business, world events, culture and underreported stories. Our archive connects individual events to the systems and decisions around them.</p><Link className="text-link" href="/topics">Explore the subjects →</Link></section><section><span className="eyebrow">Method</span><h2>Show the source trail.</h2><p>Each record explains its method and links its sources. The existing archive includes AI-assisted synthesis, not a blanket claim of original reporting or completed independent fact-checking. Corrections remain visible.</p><Link className="text-link" href="/standards">Read our standards →</Link></section></div>
    <section className="editorial-process" aria-labelledby="people-title"><span className="eyebrow">People / Editorial contact</span><h2 id="people-title">{founder.name}</h2><p>{founder.role}. {founder.biography}</p><p className="inline-links"><Link href="/author/ryan-gomez">Read Ryan’s records →</Link><Link href="/authors">All published authors →</Link><Link href="/contribute">Contribute to the publication →</Link></p></section>
    <section className="editorial-process" aria-labelledby="reader-title"><h2 id="reader-title">The record stays open.</h2><p>Read the archive, follow a subject, inspect the documents or tell us what is missing. Source tips and corrections go to a private editorial intake, not a public comments feed.</p><p className="inline-links"><Link href="/archive">Browse the archive →</Link><Link href="/corrections">Corrections →</Link><a href="/rss.xml">Follow RSS →</a></p></section>
  </section><NewsletterCTA /><Footer /></main>;
}
