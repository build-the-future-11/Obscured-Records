import { Footer, Masthead } from "@/components/editorial";

export const metadata = { title: "Editorial standards", description: "How Obscured Records researches, labels and updates its work." };

const standards = [
  { n:"01", h:"Evidence before atmosphere", p:"Every central factual claim must be traceable to a primary document, official report, research publication or clearly identified secondary source. Design and narrative never substitute for evidence." },
  { n:"02", h:"Features and briefs are different", p:"Expanded features contain a timeline, multiple source types and deeper context. Brief records are verified starting points. Their labels and reading times make that distinction visible." },
  { n:"03", h:"Uncertainty stays in the record", p:"Where sources conflict, the disagreement is described. Inference is identified as inference. An unknown trigger or disputed count is not converted into a cleaner story for dramatic effect." },
  { n:"04", h:"Primary documents need context", p:"Official records can be incomplete, self-protective or written for a narrow purpose. We use them as evidence, not as neutral narrators, and compare them with research and later investigations." },
  { n:"05", h:"Corrections are part of publishing", p:"Substantive corrections are added promptly and described on the relevant record. Small typographical fixes may be made without a formal note when they do not change meaning." },
  { n:"06", h:"No synthetic reporting", p:"Obscured Records does not invent quotations, witnesses, scenes, statistics, popularity rankings or live-news signals. Archival images are credited and their licensing status is recorded." },
];

export default function Standards() { return <main><Masthead/><section className="policy-hero"><span>Publication policy / Version 1.0</span><h1>Evidence is the<br/>editorial style.</h1><p>Obscured Records is written and edited by Ryan Gomez. These rules describe what readers should be able to expect from every filed record.</p></section><section className="policy-list">{standards.map((item) => <article key={item.n}><span>{item.n}</span><h2>{item.h}</h2><p>{item.p}</p></article>)}<div className="policy-contact"><h2>Questions about a source or decision?</h2><a href="mailto:ryangomez.hsl@gmail.com?subject=Editorial%20standards%20question">ryangomez.hsl@gmail.com</a></div></section><Footer/></main>; }
