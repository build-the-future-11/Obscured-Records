import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readDraft, writeDraft, validateDraft, wordCount } from './editorial-content.mjs';

// Synthetic validation fixtures; these do not approve any real editorial content.
const body = Array.from({ length: 360 }, (_, index) => `fixture${index}`).join(' ');
function draft(overrides = {}) {
  return {
    slug: 'validation-fixture', title: 'Validation fixture', dek: 'Fixture only',
    author: 'Test fixture', createdAt: '2026-09-30', status: 'draft',
    section: 'Technology', description: 'Validation fixture, not an article',
    socialPreview: 'Test fixture', readingTime: '2 min', tags: ['fixture', 'test'],
    sources: [{ title: 'Synthetic source', url: 'https://example.invalid/source',
      supports: 'Fixture only', status: 'located' }],
    reviewChecklist: ['Read primary source'], completedChecks: [],
    approvedBy: null, approvedAt: null, ...overrides,
  };
}
function approved(overrides = {}) {
  return draft({ status: 'approved', approvedBy: 'Named test reviewer',
    approvedAt: '2026-09-30', completedChecks: ['Read primary source'],
    sources: [{ title: 'Synthetic source', url: 'https://example.invalid/source',
      supports: 'Fixture only', status: 'verified' }], ...overrides });
}

test('well-formed draft and approval fixtures remain valid', () => {
  assert.doesNotThrow(() => validateDraft(draft(), body));
  assert.doesNotThrow(() => validateDraft(approved(), body));
});
test('approval rejects whitespace-only reviewer identity', () => {
  assert.throws(() => validateDraft(approved({ approvedBy: ' \t\n ' }), body), /Approval/);
});
test('approval rejects a non-string reviewer identity', () => {
  assert.throws(() => validateDraft(approved({ approvedBy: { name: 'fixture' } }), body), /Approval/);
});
test('approval requires a checklist array rather than substring membership', () => {
  assert.throws(() => validateDraft(approved({ completedChecks: 'Did NOT Read primary source' }), body), /Approval/);
});
test('approval requires exact checklist entries', () => {
  assert.throws(() => validateDraft(approved({ completedChecks: ['Did NOT Read primary source'] }), body), /Approval/);
});
test('approval rejects incomplete or malformed completion arrays', () => {
  for (const completedChecks of [[], null, undefined, {}, [true], ['Read primary source', ' ']]) {
    assert.throws(() => validateDraft(approved({ completedChecks }), body), /Approval/);
  }
});
test('approval requires a nonempty string date', () => {
  for (const approvedAt of [null, '', ' ', 'not-a-date', 1, ['2026-09-30']]) {
    assert.throws(() => validateDraft(approved({ approvedAt }), body), /Approval/);
  }
});
test('approval still requires all sources verified', () => {
  assert.throws(() => validateDraft(approved({ sources: draft().sources }), body), /Approval/);
});
test('direct publication remains forbidden', () => {
  assert.throws(() => validateDraft(draft({ status: 'published' }), body), /cannot directly publish/);
});
test('metadata must be a non-null record', () => {
  for (const metadata of [null, undefined, [], 'not metadata', 7]) {
    assert.throws(() => validateDraft(metadata, body), /Metadata/);
  }
});
test('draft body must be text', () => {
  for (const invalid of [null, undefined, [], 3]) {
    assert.throws(() => validateDraft(draft(), invalid), /body.*text/i);
  }
});
test('all required fields must be nonempty strings', () => {
  for (const field of ['slug', 'title', 'dek', 'author', 'createdAt', 'status', 'section', 'description', 'socialPreview', 'readingTime']) {
    assert.throws(() => validateDraft(draft({ [field]: ' ' }), body), /Missing/);
  }
});
test('tags require at least two meaningful strings', () => {
  for (const tags of [[], ['only'], [1, 2], ['valid', ' '], ['valid', null]]) {
    assert.throws(() => validateDraft(draft({ tags }), body), /tags/);
  }
});
test('review work must be an array of nonempty strings', () => {
  for (const reviewChecklist of [[], 'Read primary source', [' '], [true], null]) {
    assert.throws(() => validateDraft(draft({ reviewChecklist }), body), /editorial review/);
  }
});
test('source records need meaningful text fields', () => {
  for (const field of ['title', 'supports', 'status', 'url']) {
    for (const value of [' ', true, [], {}]) {
      const source = { ...draft().sources[0], [field]: value };
      assert.throws(() => validateDraft(draft({ sources: [source] }), body), /source record/);
    }
  }
});
test('malformed source records fail closed with useful errors', () => {
  for (const source of [null, [], 1, 'not a record']) {
    assert.throws(() => validateDraft(draft({ sources: [source] }), body), /source record/);
  }
});
test('source trail remains mandatory', () => {
  for (const sources of [null, [], 'source']) {
    assert.throws(() => validateDraft(draft({ sources }), body), /Source trail/);
  }
});
test('unsafe source URLs remain rejected', () => {
  for (const url of ['http://example.invalid', 'javascript:alert(1)', 'https://user:password@example.invalid', 'not-a-url']) {
    assert.throws(() => validateDraft(draft({ sources: [{ ...draft().sources[0], url }] }), body), /source record/);
  }
});
test('word count and reading time remain enforced', () => {
  assert.equal(wordCount(' one\n two\tthree '), 3);
  assert.throws(() => validateDraft(draft(), 'too short'), /350 words/);
  assert.throws(() => validateDraft(draft({ readingTime: '3 min' }), body), /Reading time/);
});
test('slug and section checks remain enforced', () => {
  assert.throws(() => validateDraft(draft({ slug: '../bad' }), body), /Invalid slug/);
  assert.throws(() => validateDraft(draft({ section: 'Invalid' }), body), /Unknown section/);
});
test('draft serialization round-trips LF, CRLF and a UTF-8 BOM', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'obscured-editorial-'));
  try {
    const file = path.join(directory, 'fixture.md');
    writeDraft(file, draft(), body);
    const raw = fs.readFileSync(file, 'utf8');
    for (const serialized of [raw, raw.replaceAll('\n', '\r\n'), `\uFEFF${raw}`, `\uFEFF${raw.replaceAll('\n', '\r\n')}`]) {
      fs.writeFileSync(file, serialized);
      assert.deepEqual(readDraft(file), { metadata: draft(), body });
    }
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
test('missing or invalid JSON frontmatter remains rejected', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'obscured-editorial-'));
  try {
    const file = path.join(directory, 'fixture.md');
    fs.writeFileSync(file, 'No frontmatter');
    assert.throws(() => readDraft(file), /missing JSON frontmatter/);
    fs.writeFileSync(file, '---\nnot json\n---\nbody\n');
    assert.throws(() => readDraft(file), SyntaxError);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('unapproved states reject malformed completion data before the inbox reports progress', () => {
  for (const status of ['draft', 'review', 'held']) {
    for (const completedChecks of ['NOT COMPLETED: Read primary source', null, {}, [true], [' ']]) {
      assert.throws(() => validateDraft(draft({ status, completedChecks }), body), /completed checks/);
    }
  }
});
test('unapproved states may have omitted, empty or well-formed completion arrays', () => {
  for (const status of ['draft', 'review', 'held']) {
    for (const completedChecks of [undefined, [], ['Read primary source']]) {
      assert.doesNotThrow(() => validateDraft(draft({ status, completedChecks }), body));
    }
  }
});
