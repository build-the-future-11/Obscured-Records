import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("/newsletter/confirmed", "Newsletter confirmed", "Your Obscured Records newsletter subscription has been confirmed.");

export default function NewsletterConfirmed() {
  return <main><Masthead/><section className="policy-hero" id="main-content" tabIndex={-1}><span>Newsletter / Confirmed</span><h1>You&apos;re confirmed.</h1><p>Your address is now eligible to receive The Obscured Brief when newsletter delivery is active.</p><p><Link href="/">Return to Obscured Records</Link> or <a href="/rss.xml">follow the RSS feed</a>.</p></section><Footer/></main>;
}
