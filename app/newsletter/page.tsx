import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { NewsletterForm } from "@/components/publication-client";
import { newsletterDeliveryConfigured } from "@/lib/newsletter-delivery";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("/newsletter", "Newsletter", "Subscribe to The Obscured Brief or join the waitlist while email delivery is disabled.");

export default function Newsletter() {
  const deliveryEnabled = newsletterDeliveryConfigured(process.env);
  return <main><Masthead/><section className="brief-page newsletter-page" id="main-content" tabIndex={-1}><div><span>{deliveryEnabled ? "Newsletter / Double opt-in" : "Newsletter waitlist / Delivery disabled"}</span><h1>One record.<br/><em>Read properly.</em></h1><p>The Obscured Brief is designed to bring one documented event, its source trail and the context most summaries leave out. {deliveryEnabled ? "Enter your address and confirm the email we send before the subscription becomes active." : "Email delivery is disabled in this deployment. Joining records a consented pending request without activating a subscription."}</p></div><aside><span>{deliveryEnabled ? "Subscribe" : "Join the waitlist"}</span><NewsletterForm deliveryEnabled={deliveryEnabled}/><p className="newsletter-privacy">Your address is used only for the publication list. <Link href="/privacy">Read the privacy note.</Link> You can also <a href="/rss.xml">follow the RSS feed</a>.</p></aside></section><section className="brief-manifesto"><span>Each brief is designed to contain</span><ol><li><b>01</b><h2>The record</h2><p>A concise, readable account of what happened.</p></li><li><b>02</b><h2>The evidence</h2><p>Direct links to the reports and research underneath it.</p></li><li><b>03</b><h2>The missing context</h2><p>Why the story was overlooked, simplified or remembered incorrectly.</p></li></ol></section><Footer/></main>;
}
