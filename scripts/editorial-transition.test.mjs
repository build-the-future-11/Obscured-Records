import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readDraft, writeDraft } from './editorial-content.mjs';

const command = fileURLToPath(new URL('./editorial-workflow.mjs', import.meta.url));
const body = Array.from({ length: 360 }, (_, index) => `fixture${index}`).join(' ');
const metadata = {
  slug: 'transition-fixture', title: 'Transition fixture', dek: 'Synthetic test only',
  author: 'Fixture', createdAt: '2026-09-30', status: 'approved', section: 'Technology',
  description: 'Synthetic test only', socialPreview: 'Fixture', readingTime: '2 min',
  tags: ['fixture', 'test'], sources: [{ title: 'Fixture source', url: 'https://example.invalid/source',
    supports: 'Synthetic test', status: 'verified' }],
  reviewChecklist: ['Read primary source'], completedChecks: ['Read primary source'],
  approvedBy: 'Synthetic reviewer', approvedAt: '2026-10-01',
  history: [
    { from: 'draft', to: 'review', at: '2026-09-30T12:00:00Z' },
    { from: 'review', to: 'approved', at: '2026-10-01T12:00:00Z' },
  ],
};
function fixture(run) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'obscured-transition-'));
  const file = path.join(directory, 'content/drafts/transition-fixture.md');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  writeDraft(file, metadata, body);
  const transition = (destination) => spawnSync(process.execPath,
    ['--max-old-space-size=96', command, 'transition', 'transition-fixture', destination],
    { cwd: directory, encoding: 'utf8' });
  try { run({ file, transition }); }
  finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

for (const destination of ['review', 'held']) {
  test(`approved -> ${destination} clears active approval and preserves its historical evidence`, () => fixture(({ file, transition }) => {
    const result = transition(destination);
    assert.equal(result.status, 0, result.stderr);
    const actual = readDraft(file);
    assert.equal(actual.body, body);
    assert.equal(actual.metadata.status, destination);
    assert.equal(actual.metadata.approvedBy, null);
    assert.equal(actual.metadata.approvedAt, null);
    assert.deepEqual(actual.metadata.completedChecks, metadata.completedChecks);
    assert.deepEqual(actual.metadata.history.slice(0, -1), metadata.history);
    assert.match(actual.metadata.history.at(-1).reason, /Synthetic reviewer.*2026-10-01/);
  }));
}
test('revoked approval cannot be reused to return to approved', () => fixture(({ file, transition }) => {
  assert.equal(transition('review').status, 0);
  const prior = fs.readFileSync(file, 'utf8');
  const result = transition('approved');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Approval/);
  assert.equal(fs.readFileSync(file, 'utf8'), prior);
}));
test('review can record an explicit approval only after its reviewer evidence is supplied', () => fixture(({ file, transition }) => {
  writeDraft(file, { ...metadata, status: 'review', history: metadata.history.slice(0, 1) }, body);
  const result = transition('approved');
  assert.equal(result.status, 0, result.stderr);
  const actual = readDraft(file);
  assert.equal(actual.metadata.status, 'approved');
  assert.equal(actual.metadata.approvedBy, metadata.approvedBy);
  assert.equal(actual.metadata.approvedAt, metadata.approvedAt);
  assert.equal(actual.metadata.history.at(-1).from, 'review');
  assert.equal(actual.metadata.history.at(-1).to, 'approved');
}));
test('malformed history and mismatched filename are rejected before mutation', () => fixture(({ file, transition }) => {
  for (const overrides of [{ history: 'not an array' }, { slug: 'different-fixture' }]) {
    writeDraft(file, { ...metadata, ...overrides }, body);
    const original = fs.readFileSync(file, 'utf8');
    const result = transition('review');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /history|filename/);
    assert.equal(fs.readFileSync(file, 'utf8'), original);
  }
}));
