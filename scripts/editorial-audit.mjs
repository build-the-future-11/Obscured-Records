import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { getPublicArticles } from '../lib/articles.ts';
import { features } from '../lib/features.ts';
import { mediaHolds } from '../lib/media-policy.ts';
import { readDraft, wordCount } from './editorial-content.mjs';

// A deterministic evidence snapshot, not an approval or a content generator.
// Existing prose and review fields are only read; manually recorded review work
// stays in the JSON input and cannot be inferred from machine heuristics.
const review = JSON.parse(fs.readFileSync('docs/EDITORIAL_REVIEW_2026-10-16.json', 'utf8'));
const now = Date.parse(`${review.asOf}T23:59:59Z`);
const articles = getPublicArticles(now);
const publicSlugs = new Set(articles.map(article => article.slug));
const draftFiles = fs.readdirSync('content/drafts').filter(file => file.endsWith('.md')).sort();
const companions = fs.readdirSync('content/articles').filter(file => file.endsWith('.mdx')).sort();
const rows = [];
const checksum = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const columns = ['kind', 'slug', 'title', 'status', 'author_state', 'section', 'authority', 'companion', 'route_relationship', 'review_depth', 'priority', 'disposition', 'sources', 'source_states', 'rights_gap', 'review_gap', 'known_subject_overlap', 'companion_sync', 'words', 'sha256'];
function frontmatter(text) {
  const raw = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  return Object.fromEntries(raw.split('\n').filter(line => line.includes(':')).map(line => {
    const split = line.indexOf(':'); const key = line.slice(0, split); const value = line.slice(split + 1).trim();
    try { return [key, JSON.parse(value)]; } catch { return [key, value]; }
  }));
}
for (const article of articles) {
  const assessment = review.readerReviews[article.slug];
  if (!assessment) throw new Error(`Missing recorded full-text review: ${article.slug}`);
  const companion = `content/articles/${article.slug}.mdx`;
  const raw = fs.readFileSync(companion, 'utf8'); const metadata = frontmatter(raw);
  const feature = features[article.slug];
  const fields = ['slug', 'title', 'subtitle', 'author', 'section', 'excerpt', 'recordId', 'eventDate', 'source', 'sourceUrl', 'status'];
  const differences = fields.filter(key => metadata[key] !== article[key]);
  for (const key of ['opening', 'context', 'significance']) if (!raw.includes(article[key])) differences.push(`body:${key}`);
  const sources = [article.sourceUrl, ...(article.additionalSources ?? []).map(source => source.url), ...(feature?.sources ?? []).map(source => source.url)];
  rows.push({kind: feature ? 'reader-feature' : 'reader-brief', slug: article.slug, title: article.title, status: article.status,
    author_state: `Inherited registry byline: ${article.author}; permission/approval not recertified`, section: article.section,
    authority: feature ? 'lib/articles.ts + lib/features.ts' : 'lib/articles.ts', companion,
    route_relationship: `/article/${article.slug}; eligible reader registry; site launch HOLD`, review_depth: 'full-text qualitative audit; selective claim verification',
    priority: assessment[0], disposition: assessment[1], sources: [...new Set(sources)].join(' | '), source_states: 'See claim ledger for inspected claims; remaining claims unverified this pass',
    rights_gap: mediaHolds[article.slug] ?? (article.cover ? 'Provenance evidence retained; no new rights clearance' : 'Text-only; no new media rights claim'),
    review_gap: assessment[2], known_subject_overlap: '', companion_sync: differences.length ? differences.join(' | ') : 'metadata and brief prose match',
    words: wordCount(feature ? [article.opening, feature.standfirst, ...feature.sections.flatMap(section => section.paragraphs)].join(' ') : [article.opening,article.context,article.significance].join(' ')), sha256: checksum(companion)});
}
const statusCounts = {};
let exactSlugOverlap = 0;
for (const file of draftFiles) {
  const authority = `content/drafts/${file}`;
  const { metadata, body } = readDraft(authority);
  statusCounts[metadata.status] = (statusCounts[metadata.status] ?? 0) + 1;
  const sameSlug = publicSlugs.has(metadata.slug); if (sameSlug) exactSlugOverlap++;
  const recorded = review.draftReviews[metadata.slug];
  const orientationOnly = metadata.sources.every(source => /orientation/.test(source.status));
  const riskWords = `${metadata.title} ${metadata.tags.join(' ')} ${metadata.reviewChecklist.join(' ')}`;
  const sensitive = /abduct|abuse|massacre|fraud|corrupt|torture|poison|radiation|murder|discrimin|allegation|terror/i.test(riskWords);
  const priority = recorded?.[0] ?? (sameSlug || metadata.status === 'review' ? 'P0' : sensitive ? 'P1' : 'P2');
  rows.push({kind: metadata.genre.includes('reporting plan') ? 'draft-reporting-plan' : 'draft-manuscript', slug: metadata.slug, title: metadata.title, status: metadata.status,
    author_state: metadata.author, section: metadata.section, authority, companion: '', route_relationship: sameSlug ? 'Same-slug expansion; never substitutes into reader route' : 'Excluded from reader routes',
    review_depth: recorded ? 'full-text qualitative audit; source scope recorded in notes' : 'machine metadata triage only; body not editorially read',
    priority, disposition: recorded?.[1] ?? (orientationOnly ? 'substantial revision' : 'verification needed'),
    sources: metadata.sources.map(source => source.url).join(' | '), source_states: metadata.sources.map(source => source.status).join(' | '),
    rights_gap: 'Named author, fairness and rights review not completed by this inventory',
    review_gap: recorded?.[2] ?? `${orientationOnly ? 'Discovery sources only; obtain primary and independent evidence. ' : ''}${metadata.reviewChecklist.filter(item => !(metadata.completedChecks ?? []).includes(item)).length} review checks outstanding. ${sensitive ? 'Machine risk terms flagged; inspect allegations and affected people first.' : 'Assign subject-specific chronology and evidence review.'}`,
    known_subject_overlap: sameSlug ? metadata.slug : (review.knownSubjectOverlaps[metadata.slug] ?? ''), companion_sync: 'Not a reader companion; no publication change', words: wordCount(body), sha256: checksum(authority)});
}
const csv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
const csvPath = 'docs/ARTICLE_AUDIT_2026-10-16.csv';
fs.writeFileSync(csvPath, columns.join(',') + '\n' + rows.map(row => columns.map(column => csv(row[column])).join(',')).join('\n') + '\n');
const summary = {
  asOf: review.asOf, basisRevision: review.basisRevision, readerRecords: articles.length, expandedFeatures: Object.keys(features).length,
  briefs: articles.length - Object.keys(features).length, companions: companions.length, drafts: draftFiles.length, draftStatuses: statusCounts,
  fullTextReaderAudits: Object.keys(review.readerReviews).length, fullTextDraftAudits: Object.keys(review.draftReviews).length,
  machineOnlyDrafts: draftFiles.length - Object.keys(review.draftReviews).length, exactSlugExpansionPairs: exactSlugOverlap,
  uniqueSlugKeys: new Set(rows.map(row => row.slug)).size, knownAdditionalSubjectOverlaps: Object.keys(review.knownSubjectOverlaps).length,
  distinctSubjects: null, distinctSubjectBoundary: 'Slug identifiers are not semantic subjects. Known differently-slugged overlaps are retained for editorial consolidation; exhaustive subject deduplication remains open.',
  companionDiscrepancies: rows.filter(row => row.kind.startsWith('reader') && row.companion_sync !== 'metadata and brief prose match').map(row => ({slug: row.slug, differences: row.companion_sync})),
  substantiveReaderRevisions: ['wirecard-missing-billions','goiania-blue-powder','therac-25','iraq-poison-grain','yodogo-hijacking'],
  clarityOnlyDraftRevisions: ['iraq-poison-grain'],
  revisedDrafts: review.revisedDrafts ?? ['iraq-poison-grain'],
  draftReviewReceipts: review.draftReviewReceipts ?? [],
  approvalChanges: 0, publicationChanges: 0,
  csv: csvPath, csvSha256: checksum(csvPath), method: 'Manually recorded full-text dispositions joined to deterministic metadata inventory; priorities for unread drafts are heuristics, never claim verification.'
};
fs.writeFileSync('docs/ARTICLE_AUDIT_2026-10-16.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
