export type EditorialDraft = {
  slug: string; title: string; dek: string; author: string; createdAt: string;
  status: "draft" | "review" | "approved" | "held"; section: string;
  tags: string[]; description: string; socialPreview: string; readingTime: string; genre: string;
  sources: Array<{ title: string; url: string; status: string; checkedAt?: string; supports: string }>;
  reviewChecklist: string[]; completedChecks: string[]; approvedBy: string | null; approvedAt: string | null;
  history: Array<{ from: string; to: string; at: string; reason?: string }>;
  words: number; publishedInArchive: boolean; body: string;
};
