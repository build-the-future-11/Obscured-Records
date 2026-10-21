import type { EditorialDraft } from "@/lib/editorial-types";

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
  kind: "reporting-plan" | "manuscript";
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
    approvedBy: draft.status === "approved" ? draft.approvedBy : null,
    kind: draft.genre.includes("reporting plan") ? "reporting-plan" : "manuscript",
  };
}

export function editorialOpenWork(item: EditorialQueueItem) {
  return (item.sourceCount - item.verifiedSources) + (item.totalChecks - item.completedChecks) + (hasEditorialApproval(item) ? 0 : 1);
}

function hasEditorialApproval(item: EditorialQueueItem) {
  return item.status === "approved" && Boolean(item.approvedBy);
}

export function editorialProgress(item: EditorialQueueItem) {
  const total = item.sourceCount + item.totalChecks + 1;
  const complete = item.verifiedSources + item.completedChecks + (hasEditorialApproval(item) ? 1 : 0);
  return total === 0 ? 0 : Math.round((complete / total) * 100);
}

export function editorialStage(item: EditorialQueueItem) {
  if (item.status === "held") return "On hold";
  if (item.verifiedSources < item.sourceCount) return "Evidence review open";
  if (item.completedChecks < item.totalChecks) return "Checklist open";
  if (!hasEditorialApproval(item)) return "Human approval open";
  return "Approval recorded";
}

export function compareEditorialPriority(a: EditorialQueueItem, b: EditorialQueueItem) {
  const holdDelta = Number(a.status === "held") - Number(b.status === "held");
  if (holdDelta) return holdDelta;
  const publicationDelta = Number(a.publishedInArchive) - Number(b.publishedInArchive);
  if (publicationDelta) return publicationDelta;
  const openDelta = editorialOpenWork(a) - editorialOpenWork(b);
  if (openDelta) return openDelta;
  return a.title.localeCompare(b.title);
}

export const EDITORIAL_PAGE_SIZE = 36;

export function paginateEditorialQueue<T>(items: T[], requestedPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / EDITORIAL_PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
  const offset = (page - 1) * EDITORIAL_PAGE_SIZE;
  return { page, totalPages, start: items.length ? offset + 1 : 0, end: Math.min(offset + EDITORIAL_PAGE_SIZE, items.length), items: items.slice(offset, offset + EDITORIAL_PAGE_SIZE) };
}
