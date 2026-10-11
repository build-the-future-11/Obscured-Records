import type { Metadata } from "next";
import { Footer, Masthead } from "@/components/editorial";
import { EditorialDesk } from "@/components/editorial-desk";
import { editorialDrafts } from "@/lib/editorial-drafts.generated";
import { summarizeEditorialDraft } from "@/lib/editorial-queue";
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
  const items = editorialDrafts.map(summarizeEditorialDraft);

  return <main><Masthead /><section className="editorial-desk" id="main-content" tabIndex={-1}>
    <header className="editorial-desk-heading"><span className="eyebrow">Private / Owner editorial desk</span><h1>Drafts stay drafts<br />until review is real.</h1><p>All imported manuscripts are available here for review. This route is excluded from indexing, feeds, search and the public archive. Opening a draft does not approve or publish it.</p><div className="editorial-desk-stats"><span><strong>{editorialDrafts.length}</strong> total manuscripts</span><span><strong>{unpublished.length}</strong> new records</span><span><strong>{archival.length}</strong> archival counterparts</span><span><strong>{reachable}</strong> sources marked verified</span></div></header>
    <EditorialDesk items={items} />
  </section><Footer /></main>;
}
