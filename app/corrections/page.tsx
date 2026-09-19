import { Footer, Masthead } from "@/components/editorial";

export const metadata = { title: "Corrections", description: "Corrections and update policy for Obscured Records." };

export default async function Corrections({ searchParams }: { searchParams: Promise<{ record?: string }> }) {
  const { record } = await searchParams;
  const subject = encodeURIComponent(`Correction${record ? ` — Record ${record}` : ""}`);
  return <main><Masthead/><section className="policy-hero corrections-hero"><span>Corrections / Open desk</span><h1>The record can<br/>be corrected.</h1><p>If a claim is wrong, a source has been misread or relevant evidence is missing, send the exact passage and the document that supports the correction.</p></section><section className="correction-process"><div><span>01</span><h2>Identify it</h2><p>Include the record number, headline and exact claim. Screenshots help, but a link to the underlying source is better.</p></div><div><span>02</span><h2>We review it</h2><p>The original source trail is checked alongside the material you provide. Disagreement alone is not removed; demonstrable error is corrected.</p></div><div><span>03</span><h2>We disclose it</h2><p>Substantive changes receive a dated correction note on the article. The corrected language replaces the error without erasing that a change occurred.</p></div><a className="correction-email" href={`mailto:ryangomez.hsl@gmail.com?subject=${subject}`}>Send a correction →</a></section><Footer/></main>;
}
