import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { readDraft, validateDraft } from './editorial-content.mjs';
import { articles, getArticle } from '../lib/articles.ts';

test('every new draft stays out of public lookup and every draft has usable metadata', () => {
  const existing = new Set(articles.map((a) => a.slug));
  let newCount = 0;
  for (const file of fs.readdirSync('content/drafts')) {
    const { metadata, body } = readDraft(`content/drafts/${file}`);
    validateDraft(metadata, body);
    assert.notEqual(metadata.status, 'published');
    if (!existing.has(metadata.slug)) { newCount++; assert.equal(getArticle(metadata.slug), undefined); }
  }
  assert.equal(newCount, 22);
});
test('review cannot be turned into approval without actual reviewer and source/checklist fields', () => {
  const { metadata, body } = readDraft('content/drafts/triangle-exits-and-power.md');
  assert.throws(() => validateDraft({ ...metadata, status: 'approved' }, body), /Approval/);
  assert.throws(() => validateDraft({ ...metadata, status: 'published' }, body), /cannot directly publish/);
  assert.throws(() => validateDraft({ ...metadata, status: 'approved', approvedBy: 'test fixture', approvedAt: '2026-09-27', completedChecks: ['unrelated', 'unrelated'] }, body), /Approval/);
});
test('draft body imports never enter application or library sources', () => {
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = `${directory}/${entry.name}`;
      if (entry.isDirectory()) walk(file);
      else if (/\.(ts|tsx)$/.test(file)) assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /content\/drafts/, `${file}: draft import or read`);
    }
  }
  for (const directory of ['app', 'lib', 'components']) walk(directory);
});
