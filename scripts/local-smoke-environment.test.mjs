import assert from 'node:assert/strict';
import test from 'node:test';
import { d1HttpConfig } from '../lib/intake-database.ts';
import { localSmokeEnvironment } from './local-smoke-environment.mjs';

test('local smoke cannot inherit a configured remote D1 writer', () => {
  const inherited = {
    PATH: '/synthetic/tools',
    CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32),
    CLOUDFLARE_D1_DATABASE_ID: '11111111-1111-1111-1111-111111111111',
    CLOUDFLARE_D1_API_TOKEN: 'synthetic-token',
  };
  assert.ok(d1HttpConfig(inherited));
  const isolated = localSmokeEnvironment(inherited, 'b'.repeat(40));
  assert.equal(d1HttpConfig(isolated), undefined);
  assert.equal(isolated.PATH, inherited.PATH);
  assert.equal(isolated.VERCEL_GIT_COMMIT_SHA, 'b'.repeat(40));
  assert.equal(inherited.CLOUDFLARE_D1_API_TOKEN, 'synthetic-token');
  // Explicitly present empty values win over dotenv defaults; deleting the
  // properties would let Next load production credentials back from disk.
  for (const key of ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_D1_DATABASE_ID', 'CLOUDFLARE_D1_API_TOKEN']) {
    assert.ok(Object.hasOwn(isolated, key));
    assert.equal(isolated[key], '');
  }
});
