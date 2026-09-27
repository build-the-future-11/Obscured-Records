import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPublicRecord } from '../lib/publication.ts';
import { articles, getArticle } from '../lib/articles.ts';
for (const status of [undefined, 'draft', 'review', 'held', 'scheduled', 'Published', 'rejected']) {
  test(`public registry rejects state ${status}`, () => assert.equal(isPublicRecord({ status, date: '2026-09-14' }), false));
}
test('publication requires past valid date', () => {
  assert.equal(isPublicRecord({ status: 'published', date: 'garbage' }), false);
  assert.equal(isPublicRecord({ status: 'published', date: '2026-02-30' }), false);
  assert.equal(isPublicRecord({ status: 'published', date: '2026-10-01' }, Date.parse('2026-09-27')), false);
  assert.equal(isPublicRecord({ status: 'published', date: '2026-09-14' }, Date.parse('2026-09-27')), true);
});
test('existing public records resolve canonically, have unique identifiers and explicit states', () => {
  assert.equal(new Set(articles.map((a) => a.slug)).size, articles.length);
  for (const article of articles) { assert.equal(article.status, 'published'); assert.equal(getArticle(article.slug), article); }
  assert.equal(getArticle('triangle-exits-and-power'), undefined);
});
