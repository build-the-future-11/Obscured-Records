import { RecordImage } from "./record-image";
import Link from "next/link";
import type { CatalogStory } from "@/lib/catalog";
export function MatchText({ text, query = "" }: { text: string; query?: string }) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return <>{text}</>;
  const expression = new RegExp(`(${terms.join("|")})`, "gi");
  return <>{text.split(expression).map((part, index) => index % 2 ? <mark key={index}>{part}</mark> : part)}</>;
}
export function StoryCard({ story, variant = "horizontal", query = "", number }: { story: CatalogStory; variant?: "lead" | "feature" | "standard" | "compact" | "text" | "horizontal" | "latest"; query?: string; number?: number }) {
  return <article className={`record-card card-${variant}`} data-story-slug={story.slug}>
    {number !== undefined && <span className="card-number">{String(number).padStart(2, "0")}</span>}
    {story.cover && ["lead", "feature", "standard", "horizontal"].includes(variant) && <Link href={`/article/${story.slug}`} tabIndex={-1} aria-hidden="true" className="card-media"><RecordImage src={story.cover} alt="" priority={variant === "lead"} sizes={variant === "horizontal" ? "(max-width: 760px) 90px, 220px" : "(max-width: 760px) 90vw, 50vw"} /></Link>}
    <div className="card-copy"><p className="eyebrow">{story.section} <span> / {story.format === "feature" ? "Feature" : "Brief"}</span></p><h2><Link href={`/article/${story.slug}`}><MatchText text={story.title} query={query} /></Link></h2>
      {!["compact", "latest"].includes(variant) && <p className="card-dek"><MatchText text={story.excerpt} query={query} /></p>}
      <p className="card-meta"><Link href={`/author/${story.authorSlug}`}>{story.author}</Link><time dateTime={story.isoDate}>{story.date}</time></p>
    </div>
  </article>;
}
