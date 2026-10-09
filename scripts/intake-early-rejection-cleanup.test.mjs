import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createNewsletterHandler } from '../lib/newsletter-handler.ts';
import { createSubmissionHandler } from '../lib/submission-handler.ts';

const encoder = new TextEncoder();

function openUpload({ contentType = 'application/json', origin, contentLength } = {}) {
  let cancelled = 0;
  let source;
  const body = new ReadableStream({
    start(controller) {
      source = controller;
      controller.enqueue(encoder.encode('{"partial":'));
    },
    cancel() {
      cancelled += 1;
      return new Promise(() => {});
    },
  });
  const headers = { 'content-type': contentType };
  if (origin !== undefined) headers.origin = origin;
  if (contentLength !== undefined) headers['content-length'] = contentLength;
  const request = new Request('https://publication.example/api/intake', {
    method: 'POST',
    headers,
    body,
    duplex: 'half',
  });
  return { request, source, cancelled: () => cancelled };
}

for (const [name, createHandler] of [
  ['newsletter', createNewsletterHandler],
  ['submission', createSubmissionHandler],
]) {
  test(`${name} cancels an open upload rejected for media type`, async () => {
    const fixture = openUpload({ contentType: 'text/plain' });
    const response = await createHandler(async () => assert.fail('must not persist'))(fixture.request);
    assert.equal(response.status, 415);
    assert.equal(fixture.cancelled(), 1);
    assert.throws(() => fixture.source.enqueue(encoder.encode('}')), TypeError);
  });

  test(`${name} cancels an open upload rejected for cross-origin origin`, async () => {
    const fixture = openUpload({ origin: 'https://attacker.example' });
    const response = await createHandler(async () => assert.fail('must not persist'))(fixture.request);
    assert.equal(response.status, 403);
    assert.equal(fixture.cancelled(), 1);
    assert.throws(() => fixture.source.enqueue(encoder.encode('}')), TypeError);
  });
}

test('newsletter cancels an open upload rejected by declared length', async () => {
  const fixture = openUpload({ contentLength: '4097' });
  const response = await createNewsletterHandler(async () => assert.fail('must not persist'))(fixture.request);
  assert.equal(response.status, 413);
  assert.equal(fixture.cancelled(), 1);
  assert.throws(() => fixture.source.enqueue(encoder.encode('}')), TypeError);
});

test('newsletter cancels an open upload with an invalid declared length', async () => {
  const fixture = openUpload({ contentLength: '4096, 4096' });
  const response = await createNewsletterHandler(async () => assert.fail('must not persist'))(fixture.request);
  assert.equal(response.status, 400);
  assert.equal(fixture.cancelled(), 1);
  assert.throws(() => fixture.source.enqueue(encoder.encode('}')), TypeError);
});

test('submission cancels an open upload rejected by declared length', async () => {
  const fixture = openUpload({ contentLength: '16385' });
  const response = await createSubmissionHandler(async () => assert.fail('must not persist'))(fixture.request);
  assert.equal(response.status, 413);
  assert.equal(fixture.cancelled(), 1);
  assert.throws(() => fixture.source.enqueue(encoder.encode('}')), TypeError);
});

test('submission cancels an open upload with an invalid declared length', async () => {
  const fixture = openUpload({ contentLength: '16384, 16384' });
  const response = await createSubmissionHandler(async () => assert.fail('must not persist'))(fixture.request);
  assert.equal(response.status, 400);
  assert.equal(fixture.cancelled(), 1);
  assert.throws(() => fixture.source.enqueue(encoder.encode('}')), TypeError);
});
