import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MAX_SEARCH_QUERY_LENGTH, normalizeSearchQuery } from '../lib/search-query.ts';

for (const value of [undefined, null, [], {}, 42, true, [42]]) {
  test(`handles non-string query ${JSON.stringify(value)}`, () => assert.equal(normalizeSearchQuery(value), ''));
}
test('trims normal searches without changing display case', () => assert.equal(normalizeSearchQuery(' Aviation '), 'Aviation'));
test('repeated q parameters use the first value', () => assert.equal(normalizeSearchQuery(['aviation', 'mercury']), 'aviation'));
test('empty first duplicate is deterministic', () => assert.equal(normalizeSearchQuery(['', 'mercury']), ''));
test('caps untrusted query length', () => assert.equal(normalizeSearchQuery('a'.repeat(10000)).length, MAX_SEARCH_QUERY_LENGTH));
test('keeps Unicode search text', () => assert.equal(normalizeSearchQuery('  東京  '), '東京'));
