import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createNewsletterHandler, readBody } from '../lib/newsletter-handler.ts';
import { createSubmissionHandler } from '../lib/submission-handler.ts';

const valid = {
  email: 'writer@example.invalid', kind: 'Source', title: 'A documented source lead',
  message: 'A constructed source submission with enough context to exercise request handling without using any real contributor data.',
  sourceUrl: 'https://example.invalid/document', consent: true,
};
const encoder = new TextEncoder();
const turn = () => new Promise((resolve) => setImmediate(resolve));

function upload({ signal, cancel = () => {}, body = '{"email":' } = {}) {
  let source;
  const stream = new ReadableStream({
    start(controller) { source = controller; if (body) controller.enqueue(encoder.encode(body)); },
    cancel,
  });
  return {
    request: new Request('https://publication.example/api/intake', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: stream, signal, duplex: 'half',
    }),
    source,
  };
}

for (const [name, createHandler] of [
  ['newsletter', createNewsletterHandler], ['submission', createSubmissionHandler],
]) {
  test(`${name} stops a partial upload when the request aborts`, { timeout: 1500 }, async () => {
    const abort = new AbortController();
    let cancelled = 0, writes = 0;
    const { request } = upload({ signal: abort.signal, cancel() { cancelled++; } });
    const pending = createHandler(async () => { writes++; return 'fixture'; })(request);
    await turn();
    abort.abort(new Error('private-provider-reason@example.invalid'));
    const response = await pending;
    assert.equal(response.status, 400);
    assert.equal(cancelled, 1);
    assert.equal(writes, 0);
    assert.equal(request.body.locked, false);
    assert.doesNotMatch(await response.text(), /private-provider-reason/);
  });

  test(`${name} rejects an already aborted upload before persistence`, { timeout: 1500 }, async () => {
    const abort = new AbortController();
    abort.abort();
    let cancelled = 0, writes = 0;
    const { request, source } = upload({ signal: abort.signal, body: JSON.stringify(valid), cancel() { cancelled++; } });
    const pending = createHandler(async () => { writes++; return 'fixture'; })(request);
    // Leave the stream open: valid-looking bytes do not override the abort.
    const response = await pending;
    assert.equal(response.status, 400);
    assert.equal(cancelled, 1);
    assert.equal(writes, 0);
    assert.equal(request.body.locked, false);
    assert.throws(() => source.enqueue(encoder.encode(' ')), TypeError);
  });

  test(`${name} returns 408 at one absolute upload deadline even if chunks keep arriving`, { timeout: 1500 }, async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
    let cancelled = 0, writes = 0, settled = false;
    const { request, source } = upload({ cancel() { cancelled++; } });
    const pending = createHandler(async () => { writes++; return 'fixture'; })(request).then((response) => { settled = true; return response; });
    await turn();
    for (let i = 0; i < 4; i++) {
      t.mock.timers.tick(1000);
      source.enqueue(encoder.encode(' '));
      await turn();
      assert.equal(settled, false);
    }
    t.mock.timers.tick(1000);
    const response = await pending;
    assert.equal(response.status, 408);
    assert.match((await response.json()).message, /timed out/i);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(cancelled, 1);
    assert.equal(writes, 0);
    assert.equal(request.body.locked, false);
  });
}

test('a stalled cancellation hook cannot hold up the upload timeout response', { timeout: 1500 }, async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
  let cancelled = 0;
  const { request } = upload({ cancel() { cancelled++; return new Promise(() => {}); } });
  const pending = createNewsletterHandler(async () => assert.fail('must not persist'))(request);
  await turn();
  t.mock.timers.tick(5000);
  assert.equal((await pending).status, 408);
  assert.equal(cancelled, 1);
  assert.equal(request.body.locked, false);
});

test('a rejecting cancellation hook does not replace the timeout response', { timeout: 1500 }, async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
  const { request } = upload({ cancel() { return Promise.reject(new Error('cancel failure')); } });
  const pending = createNewsletterHandler(async () => assert.fail('must not persist'))(request);
  await turn();
  t.mock.timers.tick(5000);
  assert.equal((await pending).status, 408);
  await turn();
});

test('an endless stream of empty chunks cannot keep the upload alive past its deadline', { timeout: 1500 }, async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 0 });
  let cancelled = 0;
  const stream = new ReadableStream({
    pull(controller) {
      // Advance the clock without running a timer callback, as a synchronous
      // stream can monopolize the microtask queue.
      t.mock.timers.setTime(Date.now() + 1000);
      controller.enqueue(new Uint8Array());
    },
    cancel() { cancelled++; },
  });
  const request = new Request('https://publication.example/api/newsletter', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: stream, duplex: 'half',
  });
  const response = await createNewsletterHandler(async () => assert.fail('must not persist'))(request);
  assert.equal(response.status, 408);
  assert.equal(cancelled, 1);
  assert.equal(request.body.locked, false);
});

test('completed multibyte chunks preserve the body and release its stream', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
  let cancelled = 0;
  const { request, source } = upload({ body: '', cancel() { cancelled++; } });
  const text = JSON.stringify({ ...valid, title: 'A documented café source' });
  const bytes = encoder.encode(text);
  const pending = readBody(request);
  for (const byte of bytes) source.enqueue(new Uint8Array([byte]));
  source.close();
  assert.equal(await pending, text);
  t.mock.timers.tick(10000);
  assert.equal(cancelled, 0);
  assert.equal(request.body.locked, false);
});

test('a stream that errors during upload fails without persistence', async () => {
  let writes = 0;
  const { request, source } = upload();
  const pending = createSubmissionHandler(async () => { writes++; return 'fixture'; })(request);
  source.error(new Error('private stream failure'));
  const response = await pending;
  assert.equal(response.status, 400);
  assert.equal(writes, 0);
  assert.equal(request.body.locked, false);
  assert.doesNotMatch(await response.text(), /private stream failure/);
});
