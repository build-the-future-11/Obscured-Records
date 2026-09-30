import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { selectHomepage } from '../lib/homepage.ts';
import { authorInitials, getAuthorProfile } from '../lib/authors.ts';
import { resolveSiteOrigin, existingSitesOrigin } from '../lib/site-origin.ts';
import { analyticsToken, analyticsAllowed } from '../lib/analytics-config.ts';
import { displayCover, mediaHolds } from '../lib/media-policy.ts';
import { d1HttpConfig, createD1HttpDatabase } from '../lib/intake-database.ts';
import { createNewsletterHandler } from '../lib/newsletter-handler.ts';
import { createNewsletterStore } from '../lib/newsletter-store.ts';
import { createSubmissionHandler } from '../lib/submission-handler.ts';
import { createSubmissionStore } from '../lib/submission-store.ts';
import { enforceIntakeLimit, IntakeRateLimit } from '../lib/intake-policy.ts';
import { getCatalog } from '../lib/catalog.ts';
import { getArticle } from '../lib/articles.ts';

const catalog = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((slug, i) => ({ slug, format: i % 2 ? 'brief' : 'feature' }));
test('homepage uses editable published selections and never duplicates editorial slots', () => {
  const before = structuredClone(catalog);
  const result = selectHomepage(catalog, { lead: 'c', feature: 'a', secondary: ['b', 'e'] });
  assert.equal(result.lead.slug, 'c'); assert.equal(result.feature.slug, 'a');
  assert.deepEqual(result.secondary.map((s) => s.slug), ['b', 'e']);
  assert.deepEqual(result.latest.map((s) => s.slug), ['d', 'f', 'g']);
  assert.deepEqual(catalog, before);
});
test('homepage ignores draft/nonexistent picks, resolves only eligible features and remains unique', () => {
  const result = selectHomepage(catalog, { lead: 'draft', feature: 'b', secondary: ['a', 'a'] });
  assert.equal(result.lead.slug, 'a'); assert.equal(result.feature.format, 'feature');
  const slugs = [result.lead, result.feature, ...result.secondary, ...result.latest].map((s) => s.slug);
  assert.equal(new Set(slugs).size, slugs.length); assert.ok(!slugs.includes('draft'));
});
test('empty and small homepage inventories have safe fallbacks', () => {
  assert.deepEqual(selectHomepage([]), { lead: undefined, feature: undefined, secondary: [], latest: [] });
  const single = selectHomepage([{ slug: 'brief-only', format: 'brief' }]);
  assert.equal(single.lead.slug, 'brief-only'); assert.equal(single.feature, undefined); assert.deepEqual(single.secondary, []);
});
test('real homepage uses the published registry, never the review-draft directory', () => {
  const result = selectHomepage(getCatalog());
  assert.equal(result.lead.slug, 'fedex-flight-705');
  assert.equal(result.feature.slug, 'therac-25');
  assert.ok(result.latest.every((s) => getArticle(s.slug)?.status === 'published'));
});
test('author identity never grants another contributor the founder role or contact address', () => {
  assert.equal(getAuthorProfile('ryan-gomez', 'Ryan Gomez').role, 'Founder & editor');
  for (const [slug, name] of [['new-contributor', 'New Contributor'], ['ryan-gomez', 'Different Person'], ['__proto__', 'Someone']]) {
    const profile = getAuthorProfile(slug, name);
    assert.equal(profile.name, name); assert.equal(profile.role, 'Contributor'); assert.equal(profile.contact, undefined);
  }
  assert.equal(authorInitials('  New Contributor '), 'NC'); assert.equal(authorInitials('Élodie'), 'É'); assert.equal(authorInitials(''), 'OR');
});
test('site origins prefer explicit configuration then production Vercel origin, never request or preview URL', () => {
  assert.equal(resolveSiteOrigin({}), existingSitesOrigin);
  assert.equal(resolveSiteOrigin({ VERCEL: '1', VERCEL_URL: 'preview.example', HOST: 'attacker.example' }), existingSitesOrigin);
  assert.equal(resolveSiteOrigin({ VERCEL: '1', VERCEL_PROJECT_PRODUCTION_URL: 'production.example' }), 'https://production.example');
  assert.equal(resolveSiteOrigin({ SITE_URL: 'https://chosen.example', VERCEL: '1', VERCEL_PROJECT_PRODUCTION_URL: 'production.example' }), 'https://chosen.example');
  assert.equal(resolveSiteOrigin({ NEXT_PUBLIC_SITE_URL: 'https://public.example/', SITE_URL: 'https://chosen.example' }), 'https://public.example');
});
for (const origin of ['javascript:alert(1)', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com?x=1', 'https://example.com#x', 'http://example.com']) {
  test(`canonical origin rejects unsafe configuration: ${origin}`, () => assert.throws(() => resolveSiteOrigin({ SITE_URL: origin })));
}
test('analytics requires an explicit approval flag and a valid token, with privacy opt-outs', () => {
  const token = 'a'.repeat(32);
  for (const flag of [undefined, '', 'false', '1', 'TRUE']) assert.equal(analyticsToken(flag, token), undefined);
  for (const invalid of [undefined, '', 'x'.repeat(32), '../beacon', token + ' ']) assert.equal(analyticsToken('true', invalid), undefined);
  assert.equal(analyticsToken('true', token), token);
  assert.equal(analyticsAllowed({}), true);
  for (const preferences of [{ doNotTrack: '1' }, { doNotTrack: 'yes' }, { globalPrivacyControl: true }]) assert.equal(analyticsAllowed(preferences), false);
});
test('media holds suppress reader cover projections without altering the source inventory or article status', () => {
  for (const slug of Object.keys(mediaHolds)) {
    const original = getArticle(slug); assert.ok(original.cover); assert.equal(original.status, 'published');
    assert.equal(displayCover(original), undefined); assert.equal(getCatalog().find((s) => s.slug === slug).cover, undefined);
    assert.equal(getArticle(slug), original);
  }
  assert.equal(displayCover(getArticle('fedex-flight-705')), '/fedex-705.webp');
});
test('branded share image is a real 1200x630 PNG, not a missing or mislabelled asset', () => {
  const png = readFileSync('public/share-card.png');
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
});

const config = { accountId: 'a'.repeat(32), databaseId: '00000000-0000-0000-0000-000000000000', token: 'fixture-token-not-a-real-secret' };
const envConfig = { CLOUDFLARE_ACCOUNT_ID: config.accountId, CLOUDFLARE_D1_DATABASE_ID: config.databaseId, CLOUDFLARE_D1_API_TOKEN: config.token };
test('D1 REST configuration is optional but partial or malformed configuration fails closed', () => {
  assert.equal(d1HttpConfig({}), undefined); assert.deepEqual(d1HttpConfig(envConfig), config);
  for (const env of [{ CLOUDFLARE_D1_API_TOKEN: 'token' }, { ...envConfig, CLOUDFLARE_ACCOUNT_ID: '../other' }, { ...envConfig, CLOUDFLARE_D1_DATABASE_ID: 'db/path' }, { ...envConfig, CLOUDFLARE_D1_API_TOKEN: 'token\ninjection' }]) {
    assert.throws(() => d1HttpConfig(env), /^Error: Intake storage is unavailable\.$/);
  }
});
test('D1 REST binds values as parameters and locks the destination and redirect policy', async () => {
  let calls = 0;
  const database = createD1HttpDatabase(config, async (url, init) => {
    calls++; assert.equal(url, `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`);
    assert.equal(init.method, 'POST'); assert.equal(init.redirect, 'error'); assert.equal(init.cache, 'no-store');
    assert.equal(init.headers.authorization, `Bearer ${config.token}`); assert.ok(init.signal instanceof AbortSignal);
    assert.deepEqual(JSON.parse(init.body), { sql: 'INSERT INTO fixture VALUES (?, ?)', params: ["untrusted'); --", '42'] });
    return Response.json({ success: true, errors: [], result: [{ success: true, meta: { changes: 1 } }] });
  });
  assert.deepEqual(await database.prepare('INSERT INTO fixture VALUES (?, ?)').bind("untrusted'); --", 42).run(), { success: true, meta: { changes: 1 } });
  assert.equal(calls, 1);
  for (const invalid of [undefined, null, {}, [], NaN, Infinity]) assert.throws(() => database.prepare('SELECT ?').bind(invalid));
});
for (const payload of [{ success: false }, { success: true, result: [] }, { success: true, result: [{ success: false }] }, { success: true, result: [{ success: true, meta: {} }] }, { success: true, result: [{ success: true, meta: { changes: -1 } }] }, { success: true, errors: ['sensitive-provider-error'], result: [{ success: true, meta: { changes: 1 } }] }]) {
  test(`D1 REST does not confirm malformed provider result ${JSON.stringify(payload)}`, async () => {
    const db = createD1HttpDatabase(config, async () => Response.json(payload));
    await assert.rejects(db.prepare('INSERT INTO fixture VALUES (?)').bind('email@example.invalid').run(), /^Error: Intake storage is unavailable\.$/);
  });
}
for (const status of [401, 403, 429, 500, 503]) {
  test(`D1 REST ${status} response fails without exposing provider body or credentials`, async () => {
    const db = createD1HttpDatabase(config, async () => new Response('sensitive-provider-body ' + config.token, { status }));
    await assert.rejects(db.prepare('SELECT 1').bind().run(), /^Error: Intake storage is unavailable\.$/);
  });
}
test('D1 REST transport exceptions, bad JSON and exhausted request budget fail closed', async () => {
  for (const send of [async () => { throw new Error('private transport details'); }, async () => new Response('<html>upstream failed</html>')]) {
    const db = createD1HttpDatabase(config, send);
    await assert.rejects(db.prepare('SELECT 1').bind().run(), /^Error: Intake storage is unavailable\.$/);
  }
  let clock = 0, requests = 0;
  const db = createD1HttpDatabase(config, async () => { requests++; throw new Error('should not run'); }, () => clock);
  clock = 8001; await assert.rejects(db.prepare('SELECT 1').bind().run()); assert.equal(requests, 0);
});
function sqliteRest() {
  const sqlite = new DatabaseSync(':memory:');
  for (const name of readdirSync('drizzle').filter((s) => s.endsWith('.sql')).sort()) sqlite.exec(readFileSync(`drizzle/${name}`, 'utf8'));
  const db = createD1HttpDatabase(config, async (_url, init) => {
    const { sql, params } = JSON.parse(init.body);
    assert.ok(params.every((value) => typeof value === 'string'));
    const result = sqlite.prepare(sql).run(...params);
    return Response.json({ success: true, errors: [], result: [{ success: true, meta: { changes: Number(result.changes) } }] });
  });
  return { sqlite, db };
}
test('D1 REST contract against real SQLite persists contributor intake privately and enforces durable limits', async () => {
  const { sqlite, db } = sqliteRest();
  try {
    const submission = { email: 'writer@example.invalid', kind: 'Contributor', title: "Test'); DROP TABLE editorial_submissions; --", message: 'A test beginner introduction with enough detail to describe an interest in source verification and editorial writing.', sourceUrl: '' };
    const store = createSubmissionStore(async () => db);
    const id = await store(submission);
    const row = sqlite.prepare('SELECT * FROM editorial_submissions WHERE id = ?').get(id);
    assert.equal(row.title, submission.title); assert.equal(row.kind, 'Contributor'); assert.equal(row.status, 'received'); assert.equal(row.source_url, '');
    await store(submission); await store(submission); await assert.rejects(store(submission), IntakeRateLimit);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM editorial_submissions').get().n, 3);
  } finally { sqlite.close(); }
});
test('D1 REST contract preserves pending status, suppression and expiry with string-bound numeric parameters', async () => {
  const { sqlite, db } = sqliteRest();
  try {
    const save = createNewsletterStore(async () => db);
    await save('pending@example.invalid');
    assert.equal(sqlite.prepare('SELECT status FROM newsletter_subscribers').get().status, 'pending_confirmation');
    sqlite.prepare("UPDATE newsletter_subscribers SET status = 'unsubscribed'").run();
    await save('pending@example.invalid');
    assert.equal(sqlite.prepare('SELECT status FROM newsletter_subscribers').get().status, 'unsubscribed');
    for (let i = 0; i < 3; i++) await enforceIntakeLimit(db, 'limited@example.invalid', 'newsletter', 1000);
    await assert.rejects(enforceIntakeLimit(db, 'limited@example.invalid', 'newsletter', 1001), IntakeRateLimit);
    await enforceIntakeLimit(db, 'limited@example.invalid', 'newsletter', 3601000);
  } finally { sqlite.close(); }
});
const request = (path, value) => new Request(`https://publication.example/api/${path}`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://publication.example' }, body: JSON.stringify(value) });
for (const consent of [undefined, false, 'true', 1, null]) {
  test(`newsletter requires explicit boolean consent, not ${JSON.stringify(consent)}`, async () => {
    let writes = 0; const response = await createNewsletterHandler(async () => { writes++; })(request('newsletter', { email: 'person@example.invalid', consent }));
    assert.equal(response.status, 400); assert.equal(writes, 0);
  });
}
test('contributor introduction accepts no portfolio but validates any provided sample URL', async () => {
  let writes = 0;
  const valid = { email: 'person@example.invalid', kind: 'Contributor', title: 'New contributor — writing', message: 'An introduction with an interest in writing and reviewing source documents, with availability for a limited first assignment.', sourceUrl: '', consent: true };
  const handler = createSubmissionHandler(async () => { writes++; return 'fixture'; });
  assert.equal((await handler(request('submissions', valid))).status, 201);
  for (const sourceUrl of ['javascript:alert(1)', 'http://example.invalid', 'https://user:pass@example.invalid']) assert.equal((await handler(request('submissions', { ...valid, sourceUrl }))).status, 400);
  for (const kind of ['Pitch', 'Source', 'Correction', 'Rights']) assert.equal((await handler(request('submissions', { ...valid, kind }))).status, 400);
  assert.equal(writes, 1);
});
