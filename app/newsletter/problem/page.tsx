import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("/newsletter/problem", "Newsletter link unavailable", "The newsletter preference link could not be processed.");

export default function NewsletterProblem() {
  return <main><Masthead/><section className="policy-hero" id="main-content" tabIndex={-1}><span>Newsletter / Link unavailable</span><h1>That link could not be processed.</h1><p>It may be invalid, expired, or temporarily unavailable. No new subscription is confirmed by this page.</p><p><Link href="/newsletter">Return to the newsletter page</Link> or <a href="mailto:ryangomez.hs@gmail.com?subject=Newsletter%20preference%20help">contact the editor</a>.</p></section><Footer/></main>;
}
