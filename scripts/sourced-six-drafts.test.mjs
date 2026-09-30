import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { readDraft, validateDraft } from './editorial-content.mjs';
import { getArticle } from '../lib/articles.ts';

const slugs = [
  'knight-capital-order-boundary',
  'equifax-inventory-of-responsibility',
  'macondo-barrier-under-pressure',
  'walkerton-when-results-stopped-short',
  'silver-bridge-hidden-fracture',
  'teton-dam-first-filling',
];
function substantive(body) {
  return body.split('## Sources')[0].split('\n').filter((line) => !line.startsWith('#')).join('\n')
    .replace(/\[\d+\]\(https:\/\/[^)]+\)/g, '')
    .replace(/\[\d+(?:, \d+)*\]/g, '').split(/\s+/).filter(Boolean);
}
for (const slug of slugs) {
  test(`${slug}: substantive sourced draft remains outside publication`, () => {
    const { metadata, body } = readDraft(`content/drafts/${slug}.md`);
    validateDraft(metadata, body);
    assert.ok(substantive(body).length >= 600, 'headings, metadata and references cannot satisfy body minimum');
    assert.equal(metadata.slug, slug);
    assert.equal(metadata.status, 'draft');
    assert.match(metadata.author, /Unassigned.*AI-assisted/);
    assert.equal(metadata.approvedBy, null);
    assert.equal(metadata.approvedAt, null);
    assert.deepEqual(metadata.completedChecks, []);
    assert.ok(metadata.sources.length >= 3);
    assert.equal(new Set(metadata.sources.map((s) => s.url)).size, metadata.sources.length);
    for (const source of metadata.sources) {
      assert.equal(source.status, 'inspected-ai-review-pending');
      assert.ok(source.supports.length > 30);
      assert.ok(body.includes(source.url), 'source appears in readable article');
    }
    assert.equal(getArticle(slug), undefined);
    const evidence = JSON.parse(fs.readFileSync(`content/research/${slug}/sources.json`, 'utf8'));
    assert.equal(evidence.slug, slug);
    assert.ok(fs.readFileSync(`content/research/${slug}/README.md`, 'utf8').length > 200);
  });
}
test('Knight diagram declares its nonquantitative scope and traceable nodes', () => {
  const folder = 'content/research/knight-capital-order-boundary/';
  const data = JSON.parse(fs.readFileSync(`${folder}diagram_data.json`, 'utf8'));
  assert.equal(data.quantitative_scale, null);
  assert.equal(data.simulation, false);
  assert.equal(data.nodes.length, 3);
  assert.ok(data.nodes.every((node) => node.source_url.startsWith('https://www.sec.gov/') && node.locator));
  const svg = fs.readFileSync(`${folder}diagram.svg`, 'utf8');
  assert.match(svg, /<svg\b/);
  assert.doesNotMatch(svg, /<script\b|<foreignObject\b|href=["']https?:/i);
  assert.ok(fs.statSync(`${folder}diagram.png`).size > 10000);
});
