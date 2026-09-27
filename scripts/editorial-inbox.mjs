import fs from 'node:fs';
import { readDraft, validateDraft, wordCount } from './editorial-content.mjs';
export function editorialInbox(directory = 'content/drafts') {
  return fs.readdirSync(directory).filter((file) => file.endsWith('.md')).map((file) => {
    const { metadata, body } = readDraft(`${directory}/${file}`);
    validateDraft(metadata, body);
    return {
      slug: metadata.slug, headline: metadata.title, author: metadata.author, section: metadata.section,
      state: metadata.status, createdAt: metadata.createdAt,
      lastTransition: metadata.history?.at(-1)?.at || null,
      reviewer: metadata.approvedBy || null,
      sourceReview: { verified: metadata.sources.filter((source) => source.status === 'verified').length, total: metadata.sources.length },
      remainingChecks: metadata.reviewChecklist.filter((check) => !metadata.completedChecks?.includes(check)),
      words: wordCount(body), description: metadata.description, socialPreview: metadata.socialPreview,
      history: metadata.history || [],
    };
  }).sort((a, b) => a.state.localeCompare(b.state) || a.headline.localeCompare(b.headline));
}
