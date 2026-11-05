import assert from 'node:assert/strict';
import test from 'node:test';
import { createNewsletterHandler, readBody, RequestTooLarge } from '../lib/newsletter-handler.ts';
import { createSubmissionHandler } from '../lib/submission-handler.ts';

const encode = (value) => new TextEncoder().encode(value);
const request = (body, extra = {}) => new Request('https://publication.example/api/newsletter', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body, duplex: 'half', ...extra,
});
const validSignup = { email: 'reader@example.invalid', consent: true };
const validSubmission = {
  ...validSignup, kind: 'Source', title: 'A source for editorial review', sourceUrl: 'https://example.invalid/source',
  message: 'This clearly labeled fixture provides enough context for an editor to review the source and its relevance.',
};

async function within(operation, milliseconds = 300) {
  let timer;
  try {
    return await Promise.race([
      operation,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Intake reader did not settle.')), milliseconds); }),
    ]);
  } finally { clearTimeout(timer); }
}

function openBody(firstChunk, cancel = () => {}) {
  let controller, cancellations = 0;
  const stream = new ReadableStream({
    start(value) { controller = value; if (firstChunk !== undefined) value.enqueue(firstChunk); },
    cancel() { cancellations++; return cancel(); },
  });
  return {
    stream,
    get cancellations() { return cancellations; },
    close() { try { controller.close(); } catch { /* Cancellation has already closed the source. */ } },
  };
}

for (const [name, createHandler, value] of [
  ['newsletter', createNewsletterHandler, validSignup],
  ['submission', createSubmissionHandler, validSubmission],
]) {
  test(`${name} never persists an already-aborted complete request`, async () => {
    const abort = new AbortController(); abort.abort();
    let writes = 0;
    const response = await createHandler(async () => { writes++; return 'receipt'; })(request(JSON.stringify(value), { signal: abort.signal }));
    assert.equal(response.status, 400);
    assert.equal(writes, 0);
  });

  test(`${name} aborts a pending upload without waiting for cancellation or writing`, async () => {
    const abort = new AbortController(), body = openBody(encode('{"email":"'), () => new Promise(() => {}));
    const input = request(body.stream, { signal: abort.signal });
    let writes = 0;
    try {
      const pending = createHandler(async () => { writes++; return 'receipt'; })(input);
      abort.abort();
      assert.equal((await within(pending)).status, 400);
      assert.equal(writes, 0);
      assert.equal(body.cancellations, 1);
      assert.equal(input.body.locked, false);
    } finally { body.close(); }
  });
}

test('a public intake upload has one five-second deadline even if cancellation stalls', async () => {
  const body = openBody(encode('{"email":"'), () => new Promise(() => {}));
  const input = request(body.stream), started = performance.now();
  try {
    await assert.rejects(within(readBody(input), 5750), /Request body is unavailable/);
    const elapsed = performance.now() - started;
    assert.ok(elapsed >= 4500 && elapsed < 5750, `elapsed ${elapsed} ms`);
    assert.equal(body.cancellations, 1);
    assert.equal(input.body.locked, false);
  } finally { body.close(); }
});

test('immediately fulfilled empty chunks yield so abort can interrupt the reader', async () => {
  const abort = new AbortController();
  let chunks = 0, cancelled = false;
  const stream = new ReadableStream({
    pull(controller) {
      if (++chunks <= 1000) controller.enqueue(new Uint8Array());
      else controller.close();
    },
    cancel() { cancelled = true; },
  });
  const timer = setTimeout(() => abort.abort(), 10);
  try {
    await assert.rejects(within(readBody(request(stream, { signal: abort.signal }))), /Request body is unavailable/);
    assert.equal(cancelled, true);
    assert.ok(chunks < 1000);
  } finally { clearTimeout(timer); abort.abort(); }
});

test('the intake reader owns its received bytes when a producer reuses a buffer', async () => {
  const bytes = encode('café 🌍'), scratch = new Uint8Array(bytes.length);
  let part = 0;
  const stream = new ReadableStream({
    pull(controller) {
      const chunk = part++ === 0 ? bytes.subarray(0, 4) : bytes.subarray(4);
      scratch.set(chunk);
      controller.enqueue(scratch.subarray(0, chunk.length));
      if (part === 2) controller.close();
    },
  }, { highWaterMark: 0 });
  assert.equal(await readBody(request(stream)), 'café 🌍');
});

test('a multibyte code point split across chunks retains the exact byte ceiling', async () => {
  const bytes = encode('café 🌍');
  const makeBody = () => new ReadableStream({
    start(controller) { for (const byte of bytes) controller.enqueue(Uint8Array.of(byte)); controller.close(); },
  });
  assert.equal(await readBody(request(makeBody()), bytes.length), 'café 🌍');
  await assert.rejects(readBody(request(makeBody()), bytes.length - 1), RequestTooLarge);
});

test('an oversized stream releases its lock even if cancellation rejects', async () => {
  const body = openBody(new Uint8Array(4097), () => Promise.reject(new Error('Private upload detail')));
  const input = request(body.stream);
  try {
    await assert.rejects(within(readBody(input)), RequestTooLarge);
    assert.equal(body.cancellations, 1);
    assert.equal(input.body.locked, false);
  } finally { body.close(); }
});
