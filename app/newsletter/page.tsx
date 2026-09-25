import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { NewsletterForm } from "@/components/publication-client";

export const metadata = { title: "Newsletter", description: "Join the list for The Obscured Brief." };

export default function Newsletter() {
  return <main><Masthead/><section className="brief-page newsletter-page"><div><span>A quiet email brief</span><h1>One record.<br/><em>Read properly.</em></h1><p>The Obscured Brief is designed to bring one documented event, its source trail and the context most summaries leave out. No manufactured urgency and no daily inbox noise.</p></div><aside><span>Join the list</span><NewsletterForm/><p className="newsletter-privacy">Your address is used only for the publication list. <Link href="/privacy">Read the privacy note.</Link></p></aside></section><section className="brief-manifesto"><span>Each brief is designed to contain</span><ol><li><b>01</b><h2>The record</h2><p>A concise, readable account of what happened.</p></li><li><b>02</b><h2>The evidence</h2><p>Direct links to the reports and research underneath it.</p></li><li><b>03</b><h2>The missing context</h2><p>Why the story was overlooked, simplified or remembered incorrectly.</p></li></ol></section><Footer/></main>;
}
