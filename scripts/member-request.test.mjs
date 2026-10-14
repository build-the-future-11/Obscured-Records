import test from "node:test";
import assert from "node:assert/strict";
import { readMemberJson } from "../lib/member-request.ts";

const encode = (value) => new TextEncoder().encode(value);
const makeRequest = (body, extra = {}) => new Request("https://publication.example/api/member/annotations", {
  method: "POST", body, duplex: "half", ...extra,
});

async function within(operation, milliseconds = 300) {
  let timer;
  try {
    return await Promise.race([
      operation,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Reader did not settle within the independent watchdog.")), milliseconds); }),
    ]);
  } finally { clearTimeout(timer); }
}

function openBody(firstChunk, cancellation = () => {}) {
  let controller, cancellations = 0;
  const stream = new ReadableStream({
    start(value) { controller = value; if (firstChunk !== undefined) value.enqueue(firstChunk); },
    cancel() { cancellations++; return cancellation(); },
  });
  return {
    stream,
    get cancellations() { return cancellations; },
    close() { try { controller.close(); } catch { /* Already closed by reader cancellation. */ } },
  };
}

test("member JSON preserves valid JSON values and exact UTF-8 byte boundaries", async () => {
  for (const value of [{ note: "Private café 🌍" }, [], "text", 0, false, null]) {
    const text = JSON.stringify(value);
    assert.deepEqual(await readMemberJson(makeRequest(text), encode(text).length), value);
    if (text.length > 1) assert.equal(await readMemberJson(makeRequest(text), encode(text).length - 1), null);
  }
});

test("member JSON accepts a multibyte codepoint split between chunks", async () => {
  const value = { note: "🌍" }, bytes = encode(JSON.stringify(value));
  const body = new ReadableStream({ start(controller) { for (const byte of bytes) controller.enqueue(Uint8Array.of(byte)); controller.close(); } });
  assert.deepEqual(await readMemberJson(makeRequest(body)), value);
});

test("the default 12,000-byte ceiling allows the boundary and rejects the next byte", async () => {
  assert.equal((await readMemberJson(makeRequest(JSON.stringify("a".repeat(11998))))).length, 11998);
  assert.equal(await readMemberJson(makeRequest(JSON.stringify("a".repeat(11999)))), null);
});

test("streamed excess returns before upload completion and releases the body", async () => {
  const body = openBody(encode("x".repeat(12001)));
  const request = makeRequest(body.stream);
  try {
    assert.equal(await within(readMemberJson(request)), null);
    assert.equal(body.cancellations, 1);
    assert.equal(request.body.locked, false);
  } finally { body.close(); }
});

test("streamed excess is bounded even when cancellation never settles", async () => {
  const body = openBody(encode("x".repeat(12001)), () => new Promise(() => {}));
  const request = makeRequest(body.stream);
  try {
    assert.equal(await within(readMemberJson(request)), null);
    assert.equal(body.cancellations, 1);
    assert.equal(request.body.locked, false);
  } finally { body.close(); }
});

test("streamed excess ignores a rejecting cancellation hook", async () => {
  const body = openBody(encode("x".repeat(12001)), () => Promise.reject(new Error("Private source failure")));
  try {
    assert.equal(await within(readMemberJson(makeRequest(body.stream))), null);
    assert.equal(body.cancellations, 1);
  } finally { body.close(); }
});

test("oversized declared uploads are cancelled before reading", async () => {
  const body = openBody(undefined, () => new Promise(() => {}));
  try {
    assert.equal(await within(readMemberJson(makeRequest(body.stream, { headers: { "content-length": "12001" } }))), null);
    assert.equal(body.cancellations, 1);
  } finally { body.close(); }
});

test("declared sizes must be nonnegative safe decimal integers", async () => {
  for (const length of ["1.5", "-1", "NaN", "Infinity", "1e3", "9007199254740993"]) {
    const body = openBody(encode("{}"));
    try {
      assert.equal(await within(readMemberJson(makeRequest(body.stream, { headers: { "content-length": length } }))), null, length);
      assert.equal(body.cancellations, 1, length);
    } finally { body.close(); }
  }
});

test("a small declared size cannot bypass actual streamed-byte accounting", async () => {
  const body = openBody(encode("x".repeat(12001)));
  try {
    assert.equal(await within(readMemberJson(makeRequest(body.stream, { headers: { "content-length": "1" } }))), null);
    assert.equal(body.cancellations, 1);
  } finally { body.close(); }
});

test("a body stream error is rejected as invalid input without exposing the exception", async () => {
  const body = new ReadableStream({ start(controller) { controller.error(new Error("Private upload details")); } });
  assert.equal(await readMemberJson(makeRequest(body)), null);
});

test("an already-aborted request is not accepted even if its body is complete", async () => {
  const abort = new AbortController(); abort.abort();
  assert.equal(await readMemberJson(makeRequest("{}", { signal: abort.signal })), null);
});

test("abort while waiting for an upload returns promptly and releases the reader", async () => {
  const abort = new AbortController(), body = openBody(encode('{"note":"'));
  const request = makeRequest(body.stream, { signal: abort.signal });
  try {
    const operation = readMemberJson(request);
    abort.abort();
    assert.equal(await within(operation), null);
    assert.equal(body.cancellations, 1);
    assert.equal(request.body.locked, false);
  } finally { body.close(); }
});

test("abort does not wait for a stalled source cancellation", async () => {
  const abort = new AbortController(), body = openBody(undefined, () => new Promise(() => {}));
  try {
    const operation = readMemberJson(makeRequest(body.stream, { signal: abort.signal }));
    abort.abort();
    assert.equal(await within(operation), null);
    assert.equal(body.cancellations, 1);
  } finally { body.close(); }
});

test("a consumed body returns invalid input instead of rejecting the handler", async () => {
  const request = makeRequest("{}"); await request.text();
  assert.equal(await readMemberJson(request), null);
});

test("a locked body returns invalid input without disturbing another reader", async () => {
  const request = makeRequest("{}"), reader = request.body.getReader();
  try { assert.equal(await readMemberJson(request), null); }
  finally { reader.releaseLock(); }
  assert.equal(await request.text(), "{}");
});

test("malformed or empty JSON returns invalid input", async () => {
  for (const value of ["", "{", "undefined", "[1,]", "null trailing"]) assert.equal(await readMemberJson(makeRequest(value)), null);
});

test("invalid configured byte limits fail closed and cancel unread input", async () => {
  for (const maximum of [NaN, Infinity, -1, 0.5]) {
    const body = openBody(encode("{}"));
    try {
      assert.equal(await within(readMemberJson(makeRequest(body.stream), maximum)), null);
      assert.equal(body.cancellations, 1);
    } finally { body.close(); }
  }
});

test("a partial body has one five-second read deadline", async () => {
  const body = openBody(encode('{"note":"'));
  const request = makeRequest(body.stream), started = performance.now();
  try {
    assert.equal(await within(readMemberJson(request), 5750), null);
    const elapsed = performance.now() - started;
    assert.ok(elapsed >= 4500 && elapsed < 5750, `elapsed ${elapsed} ms`);
    assert.equal(body.cancellations, 1);
    assert.equal(request.body.locked, false);
  } finally { body.close(); }
});

test("empty chunks cannot reset the complete-body deadline", async () => {
  let ended = false, chunks = 0;
  const body = new ReadableStream({
    async pull(controller) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (!ended) { controller.enqueue(new Uint8Array()); chunks++; }
      else { try { controller.close(); } catch {} }
    },
    cancel() { ended = true; },
  });
  const started = performance.now();
  try {
    assert.equal(await within(readMemberJson(makeRequest(body)), 5750), null);
    const elapsed = performance.now() - started;
    assert.ok(chunks > 2);
    assert.ok(elapsed >= 4500 && elapsed < 5750, `elapsed ${elapsed} ms`);
    assert.equal(ended, true);
  } finally { ended = true; }
});
