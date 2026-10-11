import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('footer links to the canonical portfolio network', () => {
  const source = readFileSync(new URL('../components/editorial.tsx', import.meta.url), 'utf8');
  assert.match(source, /https:\/\/thebu1ld\.com\/network/);
});
