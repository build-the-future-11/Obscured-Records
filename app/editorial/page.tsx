import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { editorialDrafts } from "@/lib/editorial-drafts.generated";
import { requireEditorialOwner } from "@/lib/editorial-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Private editorial desk",
  description: "Owner-only draft review for Obscured Records.",
  robots: { index: false, follow: false },
};

export default async function EditorialDeskPage() {
  await requireEditorialOwner("/editorial");
  const unpublished = editorialDrafts.filter((draft) => !draft.publishedInArchive);
  const archival = editorialDrafts.filter((draft) => draft.publishedInArchive);
  const reachable = editorialDrafts.flatMap((draft) => draft.sources).filter((source) => source.status === "verified").length;

  return <main><Masthead /><section className="editorial-desk" id="main-content" tabIndex={-1}>
    <header className="editorial-desk-heading"><span className="eyebrow">Private / Owner editorial desk</span><h1>Drafts stay drafts<br />until review is real.</h1><p>All imported manuscripts are available here for review. This route is excluded from indexing, feeds, search and the public archive. Opening a draft does not approve or publish it.</p><div className="editorial-desk-stats"><span><strong>{editorialDrafts.length}</strong> total manuscripts</span><span><strong>{unpublished.length}</strong> new records</span><span><strong>{archival.length}</strong> archival counterparts</span><span><strong>{reachable}</strong> sources marked verified</span></div></header>
    <EditorialGroup title="New manuscripts awaiting review" note="These records do not yet have a published article." drafts={unpublished} />
    <EditorialGroup title="Drafts with an existing archive counterpart" note="These manuscripts remain private review material; the linked archive record is already published separately." drafts={archival} />
  </section><Footer /></main>;
}

function EditorialGroup({ title, note, drafts }: { title: string; note: string; drafts: typeof editorialDrafts }) {
  return <section className="editorial-group"><header><h2>{title}</h2><p>{note}</p></header><div className="editorial-grid">{drafts.map((draft) => {
    const verified = draft.sources.filter((source) => source.status === "verified").length;
    const remaining = draft.reviewChecklist.filter((check) => !draft.completedChecks.includes(check)).length;
    return <article key={draft.slug}><span>{draft.section} / {draft.status}</span><h3><Link href={`/editorial/draft/${draft.slug}`}>{draft.title}</Link></h3><p>{draft.dek}</p><dl><div><dt>Sources verified</dt><dd>{verified}/{draft.sources.length}</dd></div><div><dt>Checks remaining</dt><dd>{remaining}</dd></div><div><dt>Length</dt><dd>{draft.words} words</dd></div></dl>{draft.publishedInArchive && <Link className="editorial-archive-link" href={`/article/${draft.slug}`}>Open published counterpart →</Link>}</article>;
  })}</div></section>;
}
