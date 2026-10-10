import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/membership", "Membership", "A private, cross-device reading library for Obscured Records.");

export default async function MembershipPage() {
  const user = await getChatGPTUser();
  return <main><Masthead /><section className="membership-hero" id="main-content" tabIndex={-1}><span className="eyebrow">Obscured Records membership</span><h1>Keep the record.<br/>Build your own trail.</h1><p>A useful signed-in reading space: saved records, reading states, highlights, private notes and preferences that can follow you across devices.</p><div>{user ? <Link className="member-primary" href="/member">Open your member space</Link> : <a className="member-primary" href={chatGPTSignInPath("/member")} target="_top">Sign in with ChatGPT</a>}<Link className="member-secondary" href="/archive">Browse before joining</Link></div></section><section className="membership-benefits"><article><span>01</span><h2>A durable library</h2><p>Save records and organize them as unread, reading, finished or archived.</p></article><article><span>02</span><h2>Private research notes</h2><p>Keep highlights and annotations tied to the exact record and passage.</p></article><article><span>03</span><h2>Reader-controlled settings</h2><p>Carry reading preferences between signed-in sessions without losing anonymous local storage.</p></article></section><section className="membership-honesty"><h2>Membership without invented promises</h2><p>This release is a signed-in reader service, not a paid subscription. It does not unlock fabricated exclusives, activate newsletter delivery or imply editorial approval. Any future paid tier, event or early briefing will be announced only after the entitlement and delivery systems exist.</p></section><Footer /></main>;
}
