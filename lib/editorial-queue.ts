import type { EditorialDraft } from "@/lib/editorial-drafts.generated";

export type EditorialQueueItem = {
  slug: string;
  title: string;
  dek: string;
  section: string;
  status: EditorialDraft["status"];
  tags: string[];
  words: number;
  publishedInArchive: boolean;
  sourceCount: number;
  verifiedSources: number;
  totalChecks: number;
  completedChecks: number;
  approvedBy: string | null;
};

export function summarizeEditorialDraft(draft: EditorialDraft): EditorialQueueItem {
  return {
    slug: draft.slug,
    title: draft.title,
    dek: draft.dek,
    section: draft.section,
    status: draft.status,
    tags: draft.tags,
    words: draft.words,
    publishedInArchive: draft.publishedInArchive,
    sourceCount: draft.sources.length,
    verifiedSources: draft.sources.filter((source) => source.status === "verified").length,
    totalChecks: draft.reviewChecklist.length,
    completedChecks: draft.reviewChecklist.filter((check) => draft.completedChecks.includes(check)).length,
    approvedBy: draft.approvedBy,
  };
}

export function editorialOpenWork(item: EditorialQueueItem) {
  return (item.sourceCount - item.verifiedSources) + (item.totalChecks - item.completedChecks) + (item.approvedBy ? 0 : 1);
}

export function editorialProgress(item: EditorialQueueItem) {
  const total = item.sourceCount + item.totalChecks + 1;
  const complete = item.verifiedSources + item.completedChecks + (item.approvedBy ? 1 : 0);
  return total === 0 ? 0 : Math.round((complete / total) * 100);
}

export function editorialStage(item: EditorialQueueItem) {
  if (item.verifiedSources < item.sourceCount) return "Evidence review open";
  if (item.completedChecks < item.totalChecks) return "Checklist open";
  if (!item.approvedBy) return "Human approval open";
  return "Approval recorded";
}

export function compareEditorialPriority(a: EditorialQueueItem, b: EditorialQueueItem) {
  const publicationDelta = Number(a.publishedInArchive) - Number(b.publishedInArchive);
  if (publicationDelta) return publicationDelta;
  const openDelta = editorialOpenWork(a) - editorialOpenWork(b);
  if (openDelta) return openDelta;
  return a.title.localeCompare(b.title);
}
