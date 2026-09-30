import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getCatalog, getSeries, getTopics } from '../lib/catalog.ts';
import { filterCatalog, parseFilters, emptyFilters } from '../lib/catalog-filter.ts';
import { readSaved, readNotes } from '../lib/reader-storage.ts';
import { editorialInbox } from './editorial-inbox.mjs';
test('discovery projects only published stories and all series and topics resolve', () => {
  const stories = getCatalog();
  assert.equal(stories.length, 28);
  assert.equal(new Set(stories.map((s) => s.slug)).size, stories.length);
  for (const series of getSeries()) for (const slug of series.slugs) assert.ok(stories.some((s) => s.slug === slug));
  const topics = getTopics();
  assert.equal(new Set(topics.map((t) => t.slug)).size, topics.length);
  for (const topic of topics) assert.equal(topic.count, stories.filter((s) => s.tags.includes(topic.tag)).length);
  assert.ok(!JSON.stringify(stories).includes('triangle-exits-and-power'));
});
test('archive intersects filters, matches terms and handles repeated bounded queries', () => {
  const stories = getCatalog();
  const filters = parseFilters({ q: ['crew fedex', 'mercury'], format: 'feature', year: '2026', month: '09', author: 'ryan-gomez', topic: 'aviation', section: 'Underreported', series: 'in-the-air' });
  assert.deepEqual(filterCatalog(stories, filters).map((s) => s.slug), ['fedex-flight-705']);
  assert.equal(filterCatalog(stories, { ...filters, year: '2025' }).length, 0);
  assert.equal(filterCatalog(stories, emptyFilters).length, 28);
  assert.equal(parseFilters({ q: 'x'.repeat(500) }).q.length, 200);
  assert.equal(parseFilters({ q: { nested: 'bad' } }).q, '');
});
test('corrupt local storage cannot break the reader or introduce invalid reading states', () => {
  for (const raw of ['not json', '{}', 'null', '[null,1,"value",{}]']) { assert.deepEqual(readSaved(raw), []); assert.deepEqual(readNotes(raw), []); }
  assert.equal(readSaved(JSON.stringify([{ slug: 'fedex-flight-705', state: 'Unread', savedAt: '2026-09-27' }])).length, 1);
  assert.deepEqual(readSaved(JSON.stringify([{ slug: '../draft', state: 'Fake', savedAt: 'x' }])), []);
  assert.deepEqual(readNotes(JSON.stringify([{ id: 'a', slug: 'x', text: 'hello', note: '', anchor: 'javascript:alert(1)', createdAt: 'x' }])), []);
});
test('editorial inbox preserves pending work and does not imply approval', () => {
  const rows = editorialInbox();
  assert.equal(rows.length, 51);
  assert.ok(rows.every((row) => row.state !== 'published'));
  const triangle = rows.find((row) => row.slug === 'triangle-exits-and-power');
  assert.equal(triangle.reviewer, null);
  assert.ok(triangle.remainingChecks.length > 0);
  assert.ok(triangle.sourceReview.verified < triangle.sourceReview.total);
});
