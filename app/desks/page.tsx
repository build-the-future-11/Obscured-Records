import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { editorialDesks } from "@/lib/desks";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("/desks", "Editorial desks", "Explore the Editorial, Originals and Investigations divisions of the Obscured Records relaunch.");

export default function DesksPage() {
  return <main><Masthead /><section className="desks-page" id="main-content" tabIndex={-1}>
    <header className="desks-hero"><span className="eyebrow">The newsroom / Three divisions</span><h1>Different forms.<br />One standard.</h1><p>Every desk begins with the same obligation: find what is missing, follow the evidence and describe the result without claiming more than the reporting can support.</p></header>
    <section className="desks-directory" aria-label="Editorial desks">{editorialDesks.map((desk) => <Link key={desk.slug} href={`/desks/${desk.slug}`}><span>{desk.number}</span><div><small>{desk.label}</small><h2>{desk.name}</h2><p>{desk.thesis}</p></div><b aria-hidden="true">↗</b></Link>)}</section>
    <section className="desks-standard"><span className="eyebrow">Shared editorial standard</span><h2>The format changes.<br />The burden of proof does not.</h2><div><p>Stories move through sourcing, claim review, fairness, rights and human editorial approval before publication.</p><p>The current archive includes AI-assisted synthesis and is not represented as a body of completed original reporting. The relaunched desks define the standard for work going forward.</p><Link className="text-link" href="/standards">Read the editorial standards →</Link></div></section>
    <section className="desk-callout"><div><span className="eyebrow">The Stories We Miss</span><h2>A newsroom needs more than writers.</h2></div><div><p>Report, research, edit, verify, visualize or help us discover the next overlooked story.</p><Link className="relaunch-primary" href="/contribute">Find your role</Link></div></section>
  </section><Footer /></main>;
}
