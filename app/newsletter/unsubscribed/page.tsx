import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("/newsletter/unsubscribed", "Newsletter unsubscribed", "Your Obscured Records newsletter preference has been updated.");

export default function NewsletterUnsubscribed() {
  return <main><Masthead/><section className="policy-hero" id="main-content" tabIndex={-1}><span>Newsletter / Preference saved</span><h1>You&apos;re unsubscribed.</h1><p>This address will not be reactivated by submitting the signup form again.</p><p><Link href="/">Return to Obscured Records</Link> or <a href="/rss.xml">follow the RSS feed</a>.</p></section><Footer/></main>;
}
