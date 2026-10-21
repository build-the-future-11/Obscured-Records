import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { readDraft } from './editorial-content.mjs';
import { reviewBodyHash, validateLocalReviewRevisions } from './review-revisions.mjs';

const files = ['AEROSPACE', 'FINANCIAL', 'HEALTH', 'INCIDENTS'].map(kind => `docs/DRAFT_REVIEW_${kind}_2026-10-16.json`);
const receipts = files.map(file => ({ file, ...JSON.parse(fs.readFileSync(file, 'utf8')) }));
const records = receipts.flatMap(receipt => receipt.reviews.map(review => ({ ...review, receipt })));
const expectedSlugs = ['1mdb-global-trail', 'bhopal-where-the-shift-ends', 'challenger-warning-and-decision', 'columbia-evidence-not-requested', 'dhahran-running-clock', 'ethiopian-airlines-961', 'great-molasses-flood', 'parmalat-fictional-cash', 'seveso-boundary-of-the-factory', 'toshiba-impossible-targets', 'tuskegee-observation-is-intervention', 'vela-incident'];
const snapshots = JSON.parse(fs.readFileSync('content/review-manuscripts.json', 'utf8'));
const originals = new Map(snapshots.map(record => [record.slug, record]));
const revisions = validateLocalReviewRevisions(snapshots, JSON.parse(fs.readFileSync('content/review-local-revisions.json', 'utf8')));
const hash = value => createHash('sha256').update(value).digest('hex');

test('additional draft reviews bind exact manuscripts, unchanged frontmatter and frozen-source provenance', () => {
  assert.deepEqual(records.map(record => record.slug).sort(), expectedSlugs);
  for (const record of records) {
    const file = `content/drafts/${record.slug}.md`;
    const raw = fs.readFileSync(file, 'utf8');
    const frontmatter = raw.match(/^---\n[\s\S]*?\n---\n/)?.[0];
    const { metadata, body } = readDraft(file);
    assert.ok(frontmatter, record.slug);
    assert.equal(hash(frontmatter), record.frontmatterSha256, `${record.slug}: preserved metadata hash`);
    assert.equal(record.frontmatterPreserved, true, record.slug);
    assert.equal(hash(raw), record.revisedFileSha256, record.slug);
    assert.equal(reviewBodyHash(body), record.revisedBodySha256, record.slug);
    assert.equal(reviewBodyHash(originals.get(record.slug).body), record.sourceBodySha256, `${record.slug}: frozen import`);
    assert.equal(metadata.status, 'review', record.slug);
    assert.equal(metadata.approvedBy, null, record.slug);
    assert.equal(metadata.approvedAt, null, record.slug);
    assert.deepEqual(metadata.completedChecks, [], record.slug);
    const revision = revisions.get(record.slug);
    assert.ok(revision, `${record.slug}: explicit local revision required`);
    assert.equal(revision.sourceBodySha256, record.sourceBodySha256, record.slug);
    assert.equal(revision.revisedBodySha256, record.revisedBodySha256, record.slug);
    assert.equal(revision.evidence, record.receipt.file, record.slug);
  }
});

test('draft claim maps identify exact current passages and supporting source scope', () => {
  const ids = new Set();
  for (const record of records) {
    const { body } = readDraft(`content/drafts/${record.slug}.md`);
    assert.ok(record.claims.length > 0, record.slug);
    for (const claim of record.claims) {
      assert.ok(!ids.has(claim.id), `Duplicate claim ID: ${claim.id}`);
      ids.add(claim.id);
      assert.ok(body.includes(claim.passage), `${claim.id}: exact recorded passage`);
      for (const field of ['id', 'passage', 'locator', 'support', 'uncertainty', 'followup']) assert.ok(typeof claim[field] === 'string' && claim[field].trim(), `${claim.id}: ${field}`);
      assert.ok(claim.sourceIds.length > 0, claim.id);
      for (const sourceId of claim.sourceIds) {
        const source = record.receipt.sources[sourceId];
        assert.ok(source, `${claim.id}: ${sourceId}`);
        assert.equal(typeof source.url, 'string', `${sourceId}: source URL required`);
        assert.equal(new URL(source.url).protocol, 'https:', sourceId);
        assert.equal(source.accessDate, '2026-10-16', sourceId);
        assert.ok(source.inspected || source.inspection, `${sourceId}: inspected scope required`);
        assert.doesNotMatch(source.sourceType ?? '', /incomplete inspection/i, `${sourceId}: failed retrieval cannot support a claim`);
      }
    }
  }
});

test('recorded review coverage and generated inventory agree without claiming unread drafts reviewed', () => {
  const review = JSON.parse(fs.readFileSync('docs/EDITORIAL_REVIEW_2026-10-16.json', 'utf8'));
  const summary = JSON.parse(fs.readFileSync('docs/ARTICLE_AUDIT_2026-10-16.json', 'utf8'));
  for (const record of records) {
    assert.ok(review.draftReviews[record.slug], record.slug);
    assert.ok(review.draftReviewReceipts.includes(record.receipt.file), record.receipt.file);
    assert.ok(summary.revisedDrafts.includes(record.slug), record.slug);
  }
  assert.equal(summary.fullTextDraftAudits, Object.keys(review.draftReviews).length);
  assert.equal(summary.machineOnlyDrafts + summary.fullTextDraftAudits, summary.drafts);
  assert.equal(summary.csvSha256, hash(fs.readFileSync(summary.csv)));
  assert.equal(summary.approvalChanges, 0);
  assert.equal(summary.publicationChanges, 0);
});
