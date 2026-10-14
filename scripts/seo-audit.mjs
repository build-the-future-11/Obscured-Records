import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getPublicArticles } from '../lib/articles.ts';
import { getFeature } from '../lib/features.ts';
import { getTopics, getSeries } from '../lib/catalog.ts';
import { buildRss, buildNewsSitemap } from '../lib/discovery.ts';
import { toIsoEditorialDate } from '../lib/editorial-dates.ts';
import { readDraft, wordCount } from './editorial-content.mjs';

const origin = 'https://obscured-records.ryangomez-hs.chatgpt.site';
const records = getPublicArticles();
const publicSlugs = new Set(records.map(row => row.slug));
assert.equal(publicSlugs.size, records.length);
const publicTitles = new Set(), publicDescriptions = new Set();
for (const record of records) {
  assert.ok(record.title.trim() && record.excerpt.trim());
  assert.ok(!publicTitles.has(record.title)); assert.ok(!publicDescriptions.has(record.excerpt));
  publicTitles.add(record.title); publicDescriptions.add(record.excerpt);
  assert.ok(new URL(`/article/${record.slug}`, origin).href.startsWith(origin));
  assert.ok(toIsoEditorialDate(record.date)); assert.ok(toIsoEditorialDate(record.updated));
}
for (const series of getSeries()) for (const slug of series.slugs) assert.ok(publicSlugs.has(slug));
assert.ok(getTopics().length);
const feedRecords = records.map(row => ({ ...row, publishedIso: toIsoEditorialDate(row.date) }));
const rss = buildRss(origin, feedRecords), news = buildNewsSitemap(origin, feedRecords, Date.now());
assert.equal((rss.match(/<item>/g) || []).length, records.length);
const drafts = fs.readdirSync('content/drafts').filter(name => name.endsWith('.md')).map(name => readDraft(`content/drafts/${name}`));
assert.ok(drafts.length >= 42, 'The review corpus must preserve the original 42 imported manuscripts');
for (const draft of drafts) if (!publicSlugs.has(draft.metadata.slug)) {
  assert.ok(!rss.includes(`/article/${draft.metadata.slug}<`));
  assert.ok(!news.includes(`/article/${draft.metadata.slug}<`));
}
const application = ['app', 'lib', 'components'];
function inspect(directory) { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
  const file = `${directory}/${entry.name}`;
  if (entry.isDirectory()) inspect(file);
  else if (/\.(ts|tsx)$/.test(file)) assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /content\/(drafts|review-manuscripts)/, `Review content exposed in ${file}`);
} }
application.forEach(inspect);
const inventory = `# Article preparation and SEO audit — updated 14 October 2026\n\n${drafts.length} saved review manuscripts are present in website editorial source. Their source-pass notes, approval gaps and metadata are retained. All remain unpublished; no new reader-facing article was published. Word counts below include manuscript headings and Markdown link text. This file retains its original 2 October path as a continuously generated audit artifact.\n\nPrivate launch remains on HOLD and has a noindex directive. Canonical origin and existing route canonicals are preserved. Archival pieces use Article structured data. RSS and news-sitemap records are limited to the existing publication registry. This audit does not prove indexing, ranking, readership, Search Console setup or human fact checking.\n\n| Article | Search title | Words | State | Review copy |\n|---|---|---:|---|---|\n`;
fs.writeFileSync('docs/ARTICLE_SEO_AUDIT_2026-10-02.md', inventory + drafts.map(({ metadata:m, body }) => {
  const searchTitle = (m.seoTitle || m.title).replaceAll('|', '/');
  const reviewCopy = m.reviewPage ? `[Open](${m.reviewPage})` : 'Repository draft';
  return `| ${m.title.replaceAll('|','/')} | ${searchTitle} | ${wordCount(body)} | ${m.status}; approval pending | ${reviewCopy} |`;
}).join('\n') + '\n\nReferences: [Google article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).\n');
console.log(JSON.stringify({ reviewManuscripts: drafts.length, readerRecords: records.length, rssItems: feedRecords.length, topics: getTopics().length, series: getSeries().length, uniqueReaderTitlesAndDescriptions: true, draftIsolation: true }));
