import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPublicRecord } from '../lib/publication.ts';
import { getPublicArticles, getArticle } from '../lib/articles.ts';
test('a Worker initialized at epoch zero reads published records at request time', async () => {
  const original = Date.now;
  try {
    Date.now = () => 0;
    const cold = await import('../lib/articles.ts?epoch-zero-initialization');
    assert.equal(cold.getPublicArticles().length, 0);
    Date.now = () => Date.parse('2026-09-27T12:00:00Z');
    assert.equal(cold.getPublicArticles().length, 28);
    assert.equal(cold.getArticle('fedex-flight-705').cover, '/fedex-705.webp');
    assert.equal(cold.getArticle('triangle-exits-and-power'), undefined);
    assert.equal(cold.getPublicArticles(Date.parse('2026-09-01')).length, 0);
  } finally { Date.now = original; }
});
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
  assert.equal(new Set(getPublicArticles().map((a) => a.slug)).size, getPublicArticles().length);
  for (const article of getPublicArticles()) { assert.equal(article.status, 'published'); assert.equal(getArticle(article.slug), article); }
  assert.equal(getArticle('triangle-exits-and-power'), undefined);
});
