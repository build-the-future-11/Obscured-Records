import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createNewsletterHandler } from '../lib/newsletter-handler.ts';
import { createNewsletterStore, saveNewsletterSubscriber } from '../lib/newsletter-store.ts';

function request(body, headers = {}) {
  return new Request('https://publication.example/api/newsletter', {
    method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body,
  });
}

async function expectResponse(body, expectedStatus, headers = {}) {
  const writes = [];
  const response = await createNewsletterHandler(async (email) => writes.push(email))(request(body, headers));
  assert.equal(response.status, expectedStatus);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(typeof (await response.json()).message, 'string');
  return writes;
}

for (const [name, body] of [
  ['malformed JSON', '{'], ['null', 'null'], ['array', '[]'], ['string', '"x"'],
  ['number', '42'], ['boolean', 'false'], ['missing email', '{}'],
  ['wrong email type', '{"email":42}'], ['invalid email', '{"email":"bad"}'],
  ['control characters', JSON.stringify({ email: 'a\u0000@example.com' })],
  ['oversized email', JSON.stringify({ email: 'a'.repeat(250) + '@example.com' })],
  ['wrong honeypot type', '{"email":"a@example.com","website":[]}' ],
]) {
  test(`rejects ${name} without storage`, async () => assert.deepEqual(await expectResponse(body, 400), []));
}

test('accepts JSON charset parameters and normalizes email', async () => {
  assert.deepEqual(await expectResponse('{"email":"  A@EXAMPLE.COM ","website":""}', 200,
    { 'content-type': 'Application/JSON; charset=utf-8', origin: 'https://publication.example' }), ['a@example.com']);
});

test('rejects a content-type prefix impostor', async () => {
  assert.deepEqual(await expectResponse('{}', 415, { 'content-type': 'application/json-invalid' }), []);
});

test('rejects another origin', async () => {
  assert.deepEqual(await expectResponse('{"email":"a@example.com"}', 403, { origin: 'https://other.example' }), []);
});

test('honeypot never writes', async () => {
  assert.deepEqual(await expectResponse('{"email":"a@example.com","website":"spam"}', 200), []);
});

test('rejects declared oversized requests before reading', async () => {
  assert.deepEqual(await expectResponse('{}', 413, { 'content-length': '4097' }), []);
});

test('rejects invalid content length', async () => {
  assert.deepEqual(await expectResponse('{}', 400, { 'content-length': '-1' }), []);
});

test('enforces byte limit even without content length', async () => {
  assert.deepEqual(await expectResponse(JSON.stringify({ email: 'a@example.com', padding: 'é'.repeat(2048) }), 413), []);
});

test('cancels an oversized chunked stream without reading the rest', async () => {
  let cancelled = false;
  let writes = 0;
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(4097)); },
    cancel() { cancelled = true; },
  });
  const response = await createNewsletterHandler(async () => { writes++; })(new Request('https://publication.example/api/newsletter', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: stream, duplex: 'half',
  }));
  assert.equal(response.status, 413);
  assert.equal(cancelled, true);
  assert.equal(writes, 0);
});

test('does not trust a forged small content length', async () => {
  assert.deepEqual(await expectResponse(' '.repeat(4097), 413, { 'content-length': '2' }), []);
});

test('accepts an exactly 4096-byte valid request', async () => {
  const body = JSON.stringify({ email: 'a@example.com' });
  assert.deepEqual(await expectResponse(body.padEnd(4096, ' '), 200), ['a@example.com']);
});

test('invalid UTF-8 is rejected', async () => {
  assert.deepEqual(await expectResponse(new Uint8Array([0xff, 0xfe]), 400), []);
});

test('storage failure returns 503 without exposing provider details', async () => {
  const response = await createNewsletterHandler(async () => { throw new Error('private@example.com secret-provider-detail'); })(request('{"email":"a@example.com"}'));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.doesNotMatch(await response.text(), /private|secret-provider-detail/);
});

test('success waits for persistence and makes no delivery promise', async () => {
  let complete;
  const persisted = new Promise((resolve) => { complete = resolve; });
  let settled = false;
  const pending = createNewsletterHandler(() => persisted)(request('{"email":"a@example.com"}')).then((response) => { settled = true; return response; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(settled, false);
  complete();
  assert.equal((await pending).status, 200);
});

test('importing the real store in Node does not load cloudflare:workers', () => {
  assert.equal(typeof saveNewsletterSubscriber, 'function');
});

test('real store fails closed outside Workers, rather than reporting success', async () => {
  await assert.rejects(saveNewsletterSubscriber('a@example.invalid'));
});

test('D1 writer binds values and checks the result', async () => {
  let sql, values;
  const store = createNewsletterStore(async () => ({ prepare(statement) {
    sql = statement;
    return { bind(...parameters) { values = parameters; return { async run() { return { success: true }; } }; } };
  } }));
  await store('a@example.com');
  assert.match(sql, /ON CONFLICT\(email\)/);
  assert.ok(!sql.includes('a@example.com'));
  assert.equal(values[0], 'a@example.com');
  assert.ok(Number.isFinite(Date.parse(values[1])));
});

test('missing D1 binding fails closed', async () => {
  await assert.rejects(createNewsletterStore(async () => undefined)('a@example.com'), /unavailable/);
});

test('negative D1 acknowledgment is not treated as success', async () => {
  const store = createNewsletterStore(async () => ({ prepare() { return { bind() { return { async run() { return { success: false }; } }; } }; } }));
  await assert.rejects(store('a@example.com'), /did not confirm/);
});
