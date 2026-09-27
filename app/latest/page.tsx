import Link from "next/link";
import { DiscoveryShell } from "@/components/discovery";
import { StoryCard } from "@/components/story-card";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("/latest", "Latest records", "Published records ordered by publication date, with record number breaking ties.");
export default function Latest() { return <DiscoveryShell eyebrow="The publication file" title="Latest records" description="Every published entry, newest publication date first. Records published on the same day are ordered by record number."><p className="device-note">For subjects, authors and date filters, <Link href="/archive">explore the complete archive →</Link></p>{getCatalog().map((story) => <StoryCard key={story.slug} story={story} variant="latest" />)}</DiscoveryShell>; }
