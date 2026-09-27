import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifySourceResponse as classify } from './source-link-policy.mjs';
test('a successful redirect to a generic homepage does not verify the citation', () => {
  assert.equal(classify('https://cdc.gov/tuskegee/about/timeline.html', 'https://www.cdc.gov/index.html', 200), 'redirect-review');
  assert.equal(classify('https://example.org/report', 'https://elsewhere.org/report', 200), 'redirect-review');
});
test('canonical host and trailing-slash changes retain the same document', () => {
  assert.equal(classify('https://example.org/report', 'https://www.example.org/report/', 200), 'reachable-not-fact-checked');
});
test('challenge, denied and missing responses stay unverified or missing', () => {
  for (const status of [202, 403, 429, 500]) assert.equal(classify('https://example.org/report', 'https://example.org/report', status), 'access-unverified');
  for (const status of [404, 410]) assert.equal(classify('https://example.org/report', 'https://example.org/report', status), 'missing');
});
