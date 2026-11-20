import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { readDraft, validateDraft } from './editorial-content.mjs';
import { getPublicArticles, getArticle } from '../lib/articles.ts';
import { assertReviewBodyMatchesRecord, validateLocalReviewRevisions } from './review-revisions.mjs';

const snapshots = JSON.parse(fs.readFileSync('content/review-manuscripts.json', 'utf8'));
const bySlug = new Map(snapshots.map(row => [row.slug, row]));
const revisions = validateLocalReviewRevisions(snapshots, JSON.parse(fs.readFileSync('content/review-local-revisions.json', 'utf8')));
test('all 42 Page manuscripts match the frozen import or an exact recorded local revision without granting approval', () => {
  assert.equal(bySlug.size, 42);
  const descriptions = new Set();
  for (const row of snapshots) {
    const { metadata, body } = readDraft(`content/drafts/${row.slug}.md`);
    validateDraft(metadata, body);
    assertReviewBodyMatchesRecord(row, body, revisions.get(row.slug));
    assert.equal(metadata.status, 'review');
    assert.equal(metadata.approvedBy, null); assert.equal(metadata.approvedAt, null);
    assert.deepEqual(metadata.completedChecks, []);
    assert.equal(metadata.reviewPage, row.reviewPage);
    assert.equal(metadata.reviewSourceNotes, row.sourceNotes);
    assert.equal(metadata.seoTitle, row.seoTitle);
    assert.equal(metadata.description, row.description);
    assert.ok(metadata.reviewChecklist.length >= 2);
    assert.ok(metadata.relatedDrafts.length >= 2);
    for (const related of metadata.relatedDrafts) { assert.ok(bySlug.has(related)); assert.notEqual(related, row.slug); }
    assert.ok(!descriptions.has(metadata.description), `Repeated description: ${row.slug}`);
    descriptions.add(metadata.description);
  }
});
test('existing reader records remain separate and new review subjects are unavailable', () => {
  const existing = new Set(getPublicArticles().map(row => row.slug));
  assert.equal(existing.size, 31);
  for (const row of snapshots) if (!existing.has(row.slug)) assert.equal(getArticle(row.slug), undefined);
  for (const slug of ['mars-climate-orbiter-interface', 'challenger-warning-and-decision', 'columbia-evidence-not-requested']) {
    const { metadata } = readDraft(`content/drafts/${slug}.md`);
    assert.ok(metadata.visual); assert.ok(fs.existsSync(metadata.visual.path));
  }
});
