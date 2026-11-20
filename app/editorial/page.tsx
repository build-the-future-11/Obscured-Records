import type { Metadata } from "next";
import { Footer, Masthead } from "@/components/editorial";
import { EditorialDesk } from "@/components/editorial-desk";
import { editorialQueue } from "@/lib/editorial-drafts.generated";
import { requireEditorialOwner } from "@/lib/editorial-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Private editorial desk",
  description: "Owner-only draft review for Obscured Records.",
  robots: { index: false, follow: false },
};

export default async function EditorialDeskPage() {
  await requireEditorialOwner("/editorial");
  const unpublished = editorialQueue.filter((draft) => !draft.publishedInArchive);
  const archival = editorialQueue.filter((draft) => draft.publishedInArchive);
  const verified = editorialQueue.reduce((total, draft) => total + draft.verifiedSources, 0);
  const reportingPlans = editorialQueue.filter((draft) => draft.kind === "reporting-plan").length;
  const items = editorialQueue;

  return <main><Masthead /><section className="editorial-desk" id="main-content" tabIndex={-1}>
    <header className="editorial-desk-heading"><span className="eyebrow">Private / Owner editorial desk</span><h1>Drafts stay drafts<br />until review is real.</h1><p>The queue contains {reportingPlans.toLocaleString()} reporting plans alongside {editorialQueue.length - reportingPlans} manuscripts. Reporting plans outline work still to do; they are not finished articles. This route is excluded from indexing, feeds, search and the public archive. Opening a draft does not approve or publish it.</p><div className="editorial-desk-stats"><span><strong>{editorialQueue.length}</strong> total manuscripts</span><span><strong>{unpublished.length}</strong> new records</span><span><strong>{archival.length}</strong> archival counterparts</span><span><strong>{verified}</strong> sources marked verified</span></div></header>
    <EditorialDesk items={items} />
  </section><Footer /></main>;
}
