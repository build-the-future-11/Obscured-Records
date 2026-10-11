import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Masthead } from "@/components/editorial";
import { editorialDrafts } from "@/lib/editorial-drafts.generated";
import { requireEditorialOwner } from "@/lib/editorial-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Private draft", robots: { index: false, follow: false } };

export default async function EditorialDraftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireEditorialOwner(`/editorial/draft/${slug}`);
  const draft = editorialDrafts.find((candidate) => candidate.slug === slug);
  if (!draft) notFound();
  const incomplete = draft.reviewChecklist.filter((check) => !draft.completedChecks.includes(check));
  return <main><Masthead /><article className="editorial-draft" id="main-content" tabIndex={-1}>
    <Link className="editorial-back" href="/editorial">← Private editorial desk</Link>
    <header><span>PRIVATE DRAFT / NOT PUBLISHED / {draft.status}</span><h1>{draft.title}</h1><p>{draft.dek}</p><small>{draft.author} · {draft.createdAt} · {draft.readingTime} · {draft.words} words</small></header>
    <section className="editorial-review-box"><h2>Release state</h2><p>{draft.publishedInArchive ? "A separate archive record with this slug is already published. This manuscript remains a private draft." : "No published archive record exists for this manuscript."}</p><p>{draft.sources.filter((source) => source.status === "verified").length} of {draft.sources.length} sources are marked verified; {incomplete.length} review checks remain.</p></section>
    <div className="editorial-draft-body">{draft.body.split(/\n{2,}/).map((block, index) => block.startsWith("## ") ? <h2 key={index}>{block.slice(3)}</h2> : block.startsWith("### ") ? <h3 key={index}>{block.slice(4)}</h3> : <p key={index}>{block}</p>)}</div>
    <section className="editorial-review"><h2>Source trail</h2><ol>{draft.sources.map((source) => <li key={source.url}><span>{source.status}</span><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.supports}</p></li>)}</ol><h2>Review checklist</h2><ul>{draft.reviewChecklist.map((check) => <li key={check} className={draft.completedChecks.includes(check) ? "complete" : "incomplete"}>{draft.completedChecks.includes(check) ? "Complete" : "Open"}: {check}</li>)}</ul></section>
  </article><Footer /></main>;
}
