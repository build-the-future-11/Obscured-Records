import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/membership", "Membership", "A private reading, research participation and collaboration workspace for Obscured Records.");

export default async function MembershipPage() {
  const user = await getChatGPTUser();
  return <main><Masthead /><section className="membership-hero" id="main-content" tabIndex={-1}><span className="eyebrow">Obscured Records membership</span><h1>Keep the record.<br/>Build the trail.</h1><p>A useful signed-in space for private reading, responsibly joining editor-published research work, collaborating on projects and tracking genuine participation.</p><div>{user ? <Link className="member-primary" href="/member">Open your member space</Link> : <a className="member-primary" href={chatGPTSignInPath("/member")} target="_top">Sign in with ChatGPT</a>}<Link className="member-secondary" href="/saved">Open saved stories</Link><Link className="member-secondary" href="/archive">Browse before joining</Link></div></section><section className="membership-benefits"><article><span>01</span><h2>A durable library</h2><p>Save records, notes and reading states across devices.</p></article><article><span>02</span><h2>Research participation</h2><p>Apply to genuine editor-published opportunities and track the actual review outcome.</p></article><article><span>03</span><h2>Member-led work</h2><p>Form a project, request collaborators and keep milestones visible to the people doing the work.</p></article></section><section className="membership-honesty"><h2>Membership without invented promises</h2><div><p>This is not a paid subscription or a promise of publication, placement, certificates, email delivery or access to fictitious programs. Opportunities, events and programs appear only after an authorized editor publishes a real workflow for them.</p><p><Link className="text-link" href="/privacy">Read how member and local reading data are handled →</Link></p></div></section><Footer /></main>;
}
