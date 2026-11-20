import fs from 'node:fs';
import { readDraft, writeDraft, validateDraft, wordCount } from './editorial-content.mjs';

const records = JSON.parse(fs.readFileSync('content/review-manuscripts.json', 'utf8'));
if (records.length !== 42 || new Set(records.map(r => r.slug)).size !== 42) throw new Error('Expected 42 unique review manuscripts');
const byPage = new Map(records.map(r => [r.reviewPage, r.slug]));
const prepared = records.map(record => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) throw new Error('Unsafe slug');
  const file = `content/drafts/${record.slug}.md`;
  const { metadata: old, body: existingBody } = readDraft(file);
  if (old.approvedBy || old.approvedAt || old.status === 'approved') throw new Error(`Approved content requires separate reconciliation: ${record.slug}`);
  // Re-importing a frozen Page snapshot is not permission to discard later
  // review work. Preflight the complete batch before the first write, even if
  // a separate local revision receipt documents the difference.
  if (old.reviewPage && old.reviewPage !== record.reviewPage) throw new Error(`Imported review identity changed; reconcile before importing: ${record.slug}`);
  if ((old.reviewPage || old.status === 'review') && existingBody !== record.body.trim()) throw new Error(`Existing review manuscript differs from the frozen import; reconcile before importing: ${record.slug}`);
  if (old.reviewPage === record.reviewPage) {
    // A repeated import has nothing to add. Preserve the complete file, not
    // just its body: source review, completed checks, status and history may
    // have advanced since the Page snapshot was first imported.
    validateDraft(old, existingBody);
    return { file, metadata: old, body: existingBody, preserved: true };
  }
  const related = record.relatedReviewPages.map(url => byPage.get(url));
  if (related.some(slug => !slug || slug === record.slug)) throw new Error(`Invalid related review: ${record.slug}`);
  const sourceNote = 'See reviewSourceNotes for the exact prior source-pass scope and remaining evidence limits. This import performs no new source verification or human approval.';
  const sources = record.sourceLinks.length ? record.sourceLinks.map(source => ({ ...source, status: 'scoped-source-pass-recorded', checkedAt: record.preparedDate, supports: sourceNote })) : old.sources;
  const reviewChecklist = [...new Set([...old.reviewChecklist, ...(record.humanReviewAction ? [record.humanReviewAction] : []), 'Assign the real author and obtain named human editorial approval.', 'Approve final headline and search metadata, visuals and rights, and the reader-facing release.'])];
  const metadata = { ...old, title: record.title, seoTitle: record.seoTitle, description: record.description, socialPreview: record.description,
    ...(record.dek ? { dek: record.dek } : {}), status: 'review', updatedAt: record.preparedDate,
    readingTime: `${Math.max(1, Math.ceil(wordCount(record.body) / 210))} min`,
    sources, reviewSourceNotes: record.sourceNotes, reviewPage: record.reviewPage, relatedDrafts: related,
    reviewChecklist, completedChecks: [], approvedBy: null, approvedAt: null,
    history: old.status === 'review' ? old.history || [] : [...old.history || [], { from: old.status, to: 'review', at: new Date().toISOString(), reason: 'Imported the saved Space review manuscript; human approval remains pending' }],
  };
  validateDraft(metadata, record.body);
  return { file, metadata, body: record.body };
});
for (const draft of prepared) if (!draft.preserved) writeDraft(draft.file, draft.metadata, draft.body);
console.log(JSON.stringify({ imported: prepared.filter(draft => !draft.preserved).length, preserved: prepared.filter(draft => draft.preserved).length, wordsIncludingHeadings: prepared.reduce((n,d) => n + wordCount(d.body), 0), state: 'new imports enter review; existing states preserved', humanApprovals: 0, readerFacingPublications: 0 }));
