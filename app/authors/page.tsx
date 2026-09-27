import Link from "next/link";
import { DiscoveryShell } from "@/components/discovery";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("/authors", "Authors", "The people behind Obscured Records.");
export default function Authors() { const authors = [...new Map(getCatalog().map((s) => [s.authorSlug, s.author])).entries()]; return <DiscoveryShell eyebrow="Behind the byline" title="Authors" description="Read the work, understand the method, and get in touch."><div className="topic-directory">{authors.map(([slug, name]) => <Link key={slug} href={`/author/${slug}`}><h2>{name}</h2><p>View biography, editorial context and filed records.</p><span>Explore the work ↗</span></Link>)}</div></DiscoveryShell>; }
