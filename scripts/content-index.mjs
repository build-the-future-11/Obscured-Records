import fs from 'node:fs';
import { articles } from '../lib/articles.ts';
import { getFeature } from '../lib/features.ts';
import { readDraft, wordCount } from './editorial-content.mjs';

const drafts = fs.readdirSync('content/drafts').filter((file) => file.endsWith('.md')).map((file) => readDraft(`content/drafts/${file}`));
const publicSlugs = new Set(articles.map((article) => article.slug));
const entries = new Map(articles.map((a) => [a.slug, { title: a.title, section: a.section, state: getFeature(a.slug) ? 'Existing public feature; not independently recertified' : 'Existing public brief', words: getFeature(a.slug) ? wordCount([a.opening, ...getFeature(a.slug).sections.flatMap((s) => s.paragraphs)].join(' ')) : wordCount([a.opening, a.context, a.significance].join(' ')), file: `../content/articles/${a.slug}.mdx` }]));
for (const { metadata: d, body } of drafts) entries.set(d.slug, { title: d.title, section: d.section, state: `${d.status.toUpperCase()}${publicSlugs.has(d.slug) ? '; expansion of public brief' : '; new subject'}`, words: wordCount(body), file: `../content/drafts/${d.slug}.md` });
const header = `# Editorial inventory — 27 September 2026\n\n${entries.size} distinct subjects: ${articles.length} existing public records, ${drafts.length} private-to-the-site draft files (${drafts.filter((d) => !publicSlugs.has(d.metadata.slug)).length} new subjects; the rest expand existing briefs). Draft files are plain Markdown with JSON frontmatter and are not imported by the application. Repository access is not private hosting: do not put confidential submissions in this tree.\n\nNo draft is approved or attributed to Ryan. New-source status is located; inherited-source status is unverified. Review tasks and provenance are attached to each draft. Word counts measure copy, not factual completeness or journalistic quality. Existing feature prose lives in lib/features.ts; its MDX is a shorter companion record.\n\n| Subject | Section | State | Words | Copy |\n|---|---|---|---:|---|\n`;
const rows = [...entries.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([slug, a]) => `| ${a.title.replaceAll('|', '/')} | ${a.section} | ${a.state} | ${a.words} | [${slug}](${a.file}) |`).join('\n');
fs.writeFileSync('docs/EDITORIAL_INVENTORY_2026-09-27.md', header + rows + '\n');
console.log(`${entries.size} subjects; ${drafts.length} drafts; ${drafts.reduce((sum, d) => sum + wordCount(d.body), 0)} draft words`);
