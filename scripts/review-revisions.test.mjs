import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { readDraft, writeDraft } from './editorial-content.mjs';
import { assertReviewBodyMatchesRecord, reviewBodyHash, validateLocalReviewRevisions } from './review-revisions.mjs';

const snapshots = JSON.parse(fs.readFileSync('content/review-manuscripts.json', 'utf8'));
const localRevisions = JSON.parse(fs.readFileSync('content/review-local-revisions.json', 'utf8'));
const iraq = snapshots.find(row => row.slug === 'iraq-poison-grain');
const revision = localRevisions.find(row => row.slug === iraq.slug);
const current = readDraft(`content/drafts/${iraq.slug}.md`);

test('a local receipt permits only the exact recorded source and revised manuscript', () => {
  assert.doesNotThrow(() => assertReviewBodyMatchesRecord(iraq, iraq.body.trim()));
  assert.throws(() => assertReviewBodyMatchesRecord(iraq, current.body), /Unrecorded local manuscript change/);
  assert.doesNotThrow(() => assertReviewBodyMatchesRecord(iraq, current.body, revision));
  assert.throws(() => assertReviewBodyMatchesRecord(iraq, current.body + '\nUnrecorded edit.', revision), /hash mismatch/);
  assert.throws(() => assertReviewBodyMatchesRecord({ ...iraq, body: iraq.body + '\nChanged frozen source.' }, current.body, revision), /hash mismatch/);
  assert.throws(() => assertReviewBodyMatchesRecord(iraq, current.body, { ...revision, slug: 'different-record' }), /hash mismatch/);
});

test('revision receipts require explicit provenance, unique subjects and exact frozen source hashes', () => {
  assert.deepEqual([...validateLocalReviewRevisions(snapshots, localRevisions).keys()].sort(), localRevisions.map(item => item.slug).sort());
  for (const invalid of [
    { ...revision, sourceBodySha256: '0'.repeat(64) },
    { ...revision, revisedBodySha256: revision.sourceBodySha256 },
    { ...revision, revisedBodySha256: 'not-a-hash' },
    { ...revision, slug: 'unknown-record' },
    { ...revision, reason: '' },
    { ...revision, reviewKind: '' },
    { ...revision, evidence: '' },
    { ...revision, recordedAt: '2026-02-30' },
  ]) assert.throws(() => validateLocalReviewRevisions(snapshots, [invalid]));
  assert.throws(() => validateLocalReviewRevisions(snapshots, [revision, revision]), /duplicate/);
  assert.notEqual(reviewBodyHash(iraq.body), reviewBodyHash(current.body));
});

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'obscured-review-import-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'content/drafts'), { recursive: true });
  fs.copyFileSync('content/review-manuscripts.json', path.join(root, 'content/review-manuscripts.json'));
  // The local receipt is deliberately present. It records review work; it
  // never authorizes a frozen-source importer to overwrite that work.
  fs.copyFileSync('content/review-local-revisions.json', path.join(root, 'content/review-local-revisions.json'));
  for (const row of snapshots) {
    const { metadata } = readDraft(`content/drafts/${row.slug}.md`);
    writeDraft(path.join(root, `content/drafts/${row.slug}.md`), metadata, row.body);
  }
  const files = ['content/review-manuscripts.json', 'content/review-local-revisions.json', ...snapshots.map(row => `content/drafts/${row.slug}.md`)];
  const capture = () => new Map(files.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
  const run = () => spawnSync(process.execPath, ['--max-old-space-size=96', path.resolve('scripts/import-review-manuscripts.mjs')], { cwd: root, encoding: 'utf8', timeout: 30_000 });
  return { root, files, capture, run };
}

for (const scenario of ['unrecorded-last-record', 'recorded-local-revision']) {
  test(`import preflight preserves the entire batch when encountering ${scenario}`, t => {
    const { root, capture, run } = fixture(t);
    const row = scenario === 'recorded-local-revision' ? iraq : snapshots.at(-1);
    const file = path.join(root, `content/drafts/${row.slug}.md`);
    const { metadata } = readDraft(file);
    writeDraft(file, metadata, scenario === 'recorded-local-revision' ? current.body : row.body + '\n\nUnrecorded local editor addition.');
    // Make the first input genuinely importable so an implementation that
    // writes while scanning would change it before encountering the conflict.
    const firstFile = path.join(root, `content/drafts/${snapshots[0].slug}.md`);
    const first = readDraft(firstFile);
    delete first.metadata.reviewPage;
    first.metadata.status = 'draft';
    first.metadata.history = [];
    first.metadata.title = 'Synthetic draft awaiting its initial Page import';
    writeDraft(firstFile, first.metadata, first.body);
    fs.appendFileSync(firstFile, '\n\n');
    const before = capture();
    const result = run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Existing review manuscript differs from the frozen import/);
    assert.match(result.stderr, new RegExp(row.slug));
    for (const [name, bytes] of before) assert.equal(fs.readFileSync(path.join(root, name), 'utf8'), bytes, name);
    assert.ok(!fs.readdirSync(path.join(root, 'content/drafts')).some(name => name.includes('.tmp-')));
  });
}

test('an unchanged frozen import still succeeds without granting approval', t => {
  const { root, run, capture } = fixture(t);
  const before = capture();
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).imported, 0);
  assert.equal(JSON.parse(result.stdout).preserved, 42);
  for (const row of snapshots) {
    const { metadata, body } = readDraft(path.join(root, `content/drafts/${row.slug}.md`));
    assert.equal(body, row.body.trim());
    assert.equal(metadata.status, 'review');
    assert.equal(metadata.approvedBy, null);
    assert.equal(metadata.approvedAt, null);
    assert.deepEqual(metadata.completedChecks, []);
  }
  for (const [file, bytes] of before) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), bytes, file);
});

test('an initial import still updates a draft while preserving already imported records', t => {
  const { root, capture, run } = fixture(t);
  const firstFile = path.join(root, `content/drafts/${snapshots[0].slug}.md`);
  const first = readDraft(firstFile);
  delete first.metadata.reviewPage;
  first.metadata.status = 'draft';
  first.metadata.history = [];
  first.metadata.title = 'Synthetic initial draft title';
  writeDraft(firstFile, first.metadata, first.body);
  const before = capture();
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).imported, 1);
  assert.equal(JSON.parse(result.stdout).preserved, 41);
  const imported = readDraft(firstFile);
  assert.equal(imported.body, snapshots[0].body.trim());
  assert.equal(imported.metadata.title, snapshots[0].title);
  assert.equal(imported.metadata.reviewPage, snapshots[0].reviewPage);
  assert.equal(imported.metadata.status, 'review');
  assert.equal(imported.metadata.approvedBy, null);
  assert.equal(imported.metadata.approvedAt, null);
  for (const [name, bytes] of before) if (name !== `content/drafts/${snapshots[0].slug}.md`) assert.equal(fs.readFileSync(path.join(root, name), 'utf8'), bytes, name);
});

test('repeat import preserves metadata-only review progress and every existing byte', t => {
  const { root, capture, run } = fixture(t);
  const file = path.join(root, `content/drafts/${snapshots[0].slug}.md`);
  const { metadata, body } = readDraft(file);
  metadata.status = 'held';
  metadata.completedChecks = [metadata.reviewChecklist[0]];
  metadata.sources[0] = { ...metadata.sources[0], status: 'verified', checkedAt: '2026-10-16', supports: 'Synthetic fixture: retain a recorded source review.' };
  metadata.history.push({ from: 'review', to: 'held', at: '2026-10-16T12:00:00Z', reason: 'Synthetic fixture: retain the editorial hold.' });
  metadata.editNotes = [...metadata.editNotes ?? [], 'Synthetic fixture: do not reset local review metadata.'];
  writeDraft(file, metadata, body);
  fs.appendFileSync(file, '\n\n');
  const before = capture();
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).imported, 0);
  assert.equal(JSON.parse(result.stdout).preserved, 42);
  for (const [name, bytes] of before) assert.equal(fs.readFileSync(path.join(root, name), 'utf8'), bytes, name);
  const retained = readDraft(file).metadata;
  assert.equal(retained.status, 'held');
  assert.deepEqual(retained.completedChecks, metadata.completedChecks);
  assert.deepEqual(retained.sources, metadata.sources);
  assert.deepEqual(retained.history, metadata.history);
});
