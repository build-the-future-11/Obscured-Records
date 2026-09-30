import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { NewsletterForm } from "@/components/publication-client";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("/newsletter", "Newsletter waitlist", "Join the waitlist for The Obscured Brief. Email delivery is not yet active.");
export default function Newsletter() {
  return <main><Masthead/><section className="brief-page newsletter-page" id="main-content" tabIndex={-1}><div><span>Newsletter waitlist / Not yet sending</span><h1>One record.<br/><em>Read properly.</em></h1><p>The Obscured Brief is designed to bring one documented event, its source trail and the context most summaries leave out. Email delivery is not active. Joining records your interest only; it does not confirm email ownership or enroll you in an active subscription.</p></div><aside><span>Join the waitlist</span><NewsletterForm/><p className="newsletter-privacy">Your address is used only for the publication list. <Link href="/privacy">Read the privacy note.</Link> You can also <a href="/rss.xml">follow the RSS feed</a>.</p></aside></section><section className="brief-manifesto"><span>Each brief is designed to contain</span><ol><li><b>01</b><h2>The record</h2><p>A concise, readable account of what happened.</p></li><li><b>02</b><h2>The evidence</h2><p>Direct links to the reports and research underneath it.</p></li><li><b>03</b><h2>The missing context</h2><p>Why the story was overlooked, simplified or remembered incorrectly.</p></li></ol></section><Footer/></main>;
}
