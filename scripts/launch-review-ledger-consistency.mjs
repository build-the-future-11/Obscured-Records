import fs from 'node:fs';
import path from 'node:path';

function frontmatterValue(raw, field) {
  return raw.match(new RegExp(`^${field}:\\s*"([^"]+)"`, 'm'))?.[1] ?? null;
}

export function articleSourceIdentities(articlesDirectory) {
  return fs.readdirSync(articlesDirectory)
    .filter((name) => name.endsWith('.mdx'))
    .sort()
    .map((name) => {
      const raw = fs.readFileSync(path.join(articlesDirectory, name), 'utf8');
      return {
        file: name,
        recordId: frontmatterValue(raw, 'recordId'),
        slug: frontmatterValue(raw, 'slug'),
        sourceUrl: frontmatterValue(raw, 'sourceUrl'),
      };
    });
}

export function launchReviewSections(ledger) {
  const sections = new Map();
  for (const chunk of ledger.split('\n## ').slice(1)) {
    const recordId = chunk.match(/^(\d{4}):/)?.[1];
    if (!recordId) continue;
    if (sections.has(recordId)) throw new Error(`duplicate launch-review section ${recordId}`);
    sections.set(recordId, `## ${chunk}`);
  }
  return sections;
}

export function launchReviewLedgerIssues({ articles, ledger }) {
  const issues = [];
  let sections;
  try {
    sections = launchReviewSections(ledger);
  } catch (error) {
    return [error.message];
  }

  for (const article of articles) {
    if (!article.recordId || !article.slug || !article.sourceUrl) {
      issues.push(`${article.file}: incomplete canonical source identity`);
      continue;
    }
    const section = sections.get(article.recordId);
    if (!section) {
      issues.push(`${article.recordId}: missing launch-review section`);
      continue;
    }
    if (!section.includes(`- Slug: \`${article.slug}\``)) {
      issues.push(`${article.recordId}: launch-review slug differs from ${article.slug}`);
    }
    if (!section.includes(`](${article.sourceUrl})`)) {
      issues.push(`${article.recordId}: launch-review source differs from ${article.sourceUrl}`);
    }
  }

  const articleIds = new Set(articles.map(({ recordId }) => recordId));
  for (const recordId of sections.keys()) {
    if (!articleIds.has(recordId)) issues.push(`${recordId}: launch-review section has no canonical article`);
  }
  return issues;
}

export function validateLaunchReviewLedger({ articlesDirectory, ledgerPath }) {
  const articles = articleSourceIdentities(articlesDirectory);
  const ledger = fs.readFileSync(ledgerPath, 'utf8');
  const issues = launchReviewLedgerIssues({ articles, ledger });
  if (issues.length) throw new Error(issues.join('\n'));
  return { articleCount: articles.length, sectionCount: launchReviewSections(ledger).size };
}
