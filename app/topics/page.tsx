import Link from "next/link";
import { DiscoveryShell } from "@/components/discovery";
import { getTopics } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("/topics", "Topics", "Follow the subjects that connect the Obscured Records archive.");
export default function Topics() { return <DiscoveryShell eyebrow="Threads through the archive" title="Follow a subject" description="Different events can leave us with the same question. Explore the connections."><div className="topic-directory">{getTopics().map((topic) => <Link key={topic.slug} href={`/topic/${topic.slug}`}><h2>{topic.name}</h2><p>{topic.description}</p><span>{topic.count} {topic.count === 1 ? "record" : "records"} ↗</span></Link>)}</div></DiscoveryShell>; }
