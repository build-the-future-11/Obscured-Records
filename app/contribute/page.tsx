import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { SubmissionForm } from "@/components/submission-form";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("/contribute", "Contribute", "Bring an overlooked story or a skill to Obscured Records. Contributor introductions, roles and the editorial process.");
const roles = [
  ["Reporting & writing", "Find an overlooked question, build a source trail and write a clear, evidence-led account."],
  ["Research & verification", "Locate primary documents, check claims and dates, and distinguish evidence from inference."],
  ["Editing", "Strengthen the angle and structure, challenge unsupported claims and make the work readable."],
  ["Visual & data journalism", "Explain a story with an accessible timeline, chart, map or interactive experience."],
  ["Video & audio", "Adapt a sourced story for a different medium, with accurate credits and cleared material."],
  ["Web & audience", "Improve the reading experience and help useful stories reach the right communities."],
];
export default function Contribute() {
  return <main><Masthead /><section className="text-page contributor-page" id="main-content" tabIndex={-1}>
    <span className="eyebrow">Contribute / Open editorial desk</span><h1>Notice what<br />others miss.</h1>
    <p className="intro">You do not need a finished investigation or a polished portfolio. Start with a question, a skill and a willingness to follow the evidence.</p>
    <p>These are ways to contribute, not a claim that every desk is staffed or a promise of a place, payment or publication. Scope, credit, rights and any compensation must be agreed before an assignment begins.</p>
    <div className="newsroom-grid">{roles.map(([title, description]) => <section key={title}><h2>{title}</h2><p>{description}</p></section>)}</div>
    <section className="editorial-process" aria-labelledby="process-title"><span className="eyebrow">How a contribution moves forward</span><h2 id="process-title">A byline follows the work.</h2><ol className="editorial-steps"><li><h3>Introduce</h3><p>Tell us what you notice, what you can do and what time you have.</p></li><li><h3>Agree a scope</h3><p>An editor must explicitly accept the proposal and agree responsibilities.</p></li><li><h3>Research & review</h3><p>Build the source record, draft, edit and check the central claims.</p></li><li><h3>Decide & credit</h3><p>Human editorial approval and rights clearance come before publication.</p></li></ol></section>
    <p className="inline-links"><Link href="/standards">Read the standards →</Link><Link href="/authors">Meet the published authors →</Link><Link href="/submit">Send a correction or source tip →</Link></p>
    <SubmissionForm mode="contributor" />
    <p className="intake-alternative">A receipt confirms storage only, not acceptance or an editorial response. For an ordinary introduction you can also email <a href="mailto:ryangomez.hs@gmail.com?subject=Obscured%20Records%20contributor%20introduction">ryangomez.hs@gmail.com</a>. Neither route is a confidential-source channel.</p>
  </section><Footer /></main>;
}
