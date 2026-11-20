import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Masthead } from "@/components/editorial";
import { editorialQueue } from "@/lib/editorial-drafts.generated";
import { compareEditorialPriority, editorialProgress, editorialStage, summarizeEditorialDraft } from "@/lib/editorial-queue";
import { loadEditorialDraft } from "@/lib/editorial-draft-loader.generated";
import { requireEditorialOwner } from "@/lib/editorial-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Private draft", robots: { index: false, follow: false } };

export default async function EditorialDraftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireEditorialOwner(`/editorial/draft/${slug}`);
  const draft = await loadEditorialDraft(slug);
  if (!draft) notFound();
  const incomplete = draft.reviewChecklist.filter((check) => !draft.completedChecks.includes(check));
  const summary = summarizeEditorialDraft(draft);
  const queue = [...editorialQueue].sort(compareEditorialPriority);
  const queueIndex = queue.findIndex((candidate) => candidate.slug === slug);
  const previous = queue[queueIndex - 1];
  const next = queue[queueIndex + 1];
  return <main><Masthead /><article className="editorial-draft" id="main-content" tabIndex={-1}>
    <nav className="editorial-draft-nav" aria-label="Editorial queue navigation"><Link className="editorial-back" href="/editorial">← Private editorial desk</Link><span>Priority queue {queueIndex + 1} of {queue.length}</span></nav>
    <header><span>PRIVATE DRAFT / NOT PUBLISHED / {draft.status}</span><h1>{draft.title}</h1><p>{draft.dek}</p><small>{draft.genre} · {draft.author} · {draft.createdAt} · {draft.readingTime} · {draft.words} words</small></header>
    <section className="editorial-review-box"><div><span className="eyebrow">Current stage</span><h2>{editorialStage(summary)}</h2></div><strong>{editorialProgress(summary)}%</strong><div className="editorial-progress" aria-label={`${editorialProgress(summary)}% of recorded review signals complete`}><span style={{ width: `${editorialProgress(summary)}%` }} /></div><p>{draft.publishedInArchive ? "A separate archive record with this slug is already published. This manuscript remains a private draft." : "No published archive record exists for this manuscript."}</p><p>{summary.verifiedSources} of {draft.sources.length} sources are marked verified; {incomplete.length} review checks remain; {summary.approvedBy ? `approval is recorded for ${summary.approvedBy}.` : "named human approval is not recorded."}</p></section>
    <div className="editorial-draft-body">{draft.body.split(/\n{2,}/).map((block, index) => block.startsWith("## ") ? <h2 key={index}>{block.slice(3)}</h2> : block.startsWith("### ") ? <h3 key={index}>{block.slice(4)}</h3> : <p key={index}>{block}</p>)}</div>
    <section className="editorial-review"><h2>Source trail</h2><p className="editorial-review-intro">Status labels report only what the source record says. A scoped source pass is not counted as independent verification.</p><ol>{draft.sources.map((source) => <li key={source.url}><span>{source.status}</span><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.supports}</p>{source.checkedAt && <small>Recorded check: {source.checkedAt}</small>}</li>)}</ol><h2>Review checklist</h2><ul>{draft.reviewChecklist.map((check) => <li key={check} className={draft.completedChecks.includes(check) ? "complete" : "incomplete"}>{draft.completedChecks.includes(check) ? "Complete" : "Open"}: {check}</li>)}</ul></section>
    <nav className="editorial-next" aria-label="Previous and next manuscripts"><div>{previous && <><span>Higher priority</span><Link href={`/editorial/draft/${previous.slug}`}>← {previous.title}</Link></>}</div><div>{next && <><span>Next in queue</span><Link href={`/editorial/draft/${next.slug}`}>{next.title} →</Link></>}</div></nav>
  </article><Footer /></main>;
}
