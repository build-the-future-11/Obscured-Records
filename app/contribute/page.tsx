import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { SubmissionForm } from "@/components/submission-form";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("/contribute", "The Stories We Miss", "Join the Obscured Records open call for writers, reporters, researchers, editors and visual storytellers.");
const roles = [
  ["01", "Writers & reporters", "Find an overlooked question, build a source trail and turn it into a clear, evidence-led story."],
  ["02", "Researchers", "Locate primary documents, check claims and dates, and distinguish evidence from inference."],
  ["03", "Editors", "Strengthen the angle and structure, challenge unsupported claims and help the work become publishable."],
  ["04", "Visual storytellers", "Use photography, illustration, data, maps, video or interactive media to make the evidence visible."],
];
export default function Contribute() {
  return <main><Masthead /><section className="contributor-page" id="main-content" tabIndex={-1}>
    <header className="contributor-hero"><span className="eyebrow">The Stories We Miss / Open call</span><div><h1>What is everyone<br />else overlooking?</h1><p>We are recruiting young writers, journalists, researchers, editors and visual storytellers to produce reporting that starts where the news cycle stops.</p></div><aside><span>Bring one of three things</span><ol><li>A story nobody is following</li><li>A source trail worth opening</li><li>A skill that makes reporting stronger</li></ol><a href="#apply">Introduce yourself ↓</a></aside></header>
    <section className="contributor-intro" aria-labelledby="contributor-intro-title"><span className="eyebrow">The assignment</span><h2 id="contributor-intro-title">Find the gap.<br />Build the record.</h2><div><p>You do not need a finished investigation or a polished portfolio. Start with a question, a skill and a willingness to follow the evidence.</p><p>We care about why the story is missing, who is affected and what reporting could add that the existing coverage does not.</p></div></section>
    <section className="contributor-roles" aria-labelledby="roles-title"><header><span className="eyebrow">Ways to contribute</span><h2 id="roles-title">There is more than one way into a story.</h2></header><div>{roles.map(([number, title, description]) => <article key={title}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="pitch-test" aria-labelledby="pitch-test-title"><header><span className="eyebrow">Before you pitch</span><h2 id="pitch-test-title">Three questions<br />we will ask.</h2></header><ol><li><span>01</span><h3>What is being missed?</h3><p>Name the gap in existing coverage, not just the broad subject.</p></li><li><span>02</span><h3>Who can help us know?</h3><p>Identify documents, data, witnesses, specialists or communities that could ground the work.</p></li><li><span>03</span><h3>Why does it matter now?</h3><p>Explain the consequence for people, institutions or public understanding.</p></li></ol></section>
    <section className="editorial-process" aria-labelledby="process-title"><span className="eyebrow">How a contribution moves forward</span><h2 id="process-title">A byline follows the work.</h2><ol className="editorial-steps"><li><h3>Introduce</h3><p>Tell us what you notice, what you can do and what time you have.</p></li><li><h3>Agree a scope</h3><p>An editor must explicitly accept the proposal and agree responsibilities.</p></li><li><h3>Research & review</h3><p>Build the source record, draft, edit and check the central claims.</p></li><li><h3>Decide & credit</h3><p>Human editorial approval and rights clearance come before publication.</p></li></ol></section>
    <aside className="contributor-terms"><span className="eyebrow">Clear expectations</span><p>An introduction is not an assignment or a promise of publication. Scope, credit, rights, deadlines and any compensation must be agreed before work begins. We will never describe outreach as a staffed desk or partnership before it exists.</p></aside>
    <p className="inline-links"><Link href="/standards">Read the standards →</Link><Link href="/authors">Meet the published authors →</Link><Link href="/submit">Send a correction or source tip →</Link></p>
    <div id="apply"><SubmissionForm mode="contributor" /></div>
    <p className="intake-alternative">A receipt confirms storage only, not acceptance or an editorial response. For an ordinary introduction you can also email <a href="mailto:ryangomez.hs@gmail.com?subject=Obscured%20Records%20contributor%20introduction">ryangomez.hs@gmail.com</a>. Neither route is a confidential-source channel.</p>
  </section><Footer /></main>;
}
