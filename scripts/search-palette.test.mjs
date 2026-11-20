import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { fetchSearchIndex, nextSearchResult } from "../lib/search-palette.ts";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const index = {
  stories: [{ slug: "first-story", title: "First story", excerpt: "An excerpt", author: "Editor", section: "Science", date: "16 Oct 2026", tags: ["Research"] }],
  topics: [{ slug: "research", name: "Research", count: 1 }],
  series: [{ slug: "discovery", title: "Discovery", description: "A reading trail" }],
  authors: [{ slug: "editor", name: "Editor" }],
};

test("keyboard movement enters at first or last result and wraps in both directions", () => {
  assert.equal(nextSearchResult(-1, 5, "ArrowDown"), 0);
  assert.equal(nextSearchResult(-1, 5, "ArrowUp"), 4);
  assert.equal(nextSearchResult(0, 5, "ArrowUp"), 4);
  assert.equal(nextSearchResult(4, 5, "ArrowDown"), 0);
  assert.equal(nextSearchResult(2, 5, "ArrowUp"), 1);
  assert.equal(nextSearchResult(2, 5, "ArrowDown"), 3);
  assert.equal(nextSearchResult(0, 0, "ArrowUp"), -1);
  assert.equal(nextSearchResult(-1, 1, "ArrowUp"), 0);
});

test("instant search loads the complete index used by local query filtering", async () => {
  globalThis.fetch = async (path, init) => {
    assert.equal(path, "/api/search"); assert.equal(init.signal.aborted, false);
    return Response.json(index);
  };
  assert.deepEqual(await fetchSearchIndex(new AbortController().signal), index);
});

test("a stalled search request reaches its deadline and aborts the transport", async () => {
  let signal;
  globalThis.fetch = async (_path, init) => { signal = init.signal; return new Promise(() => {}); };
  await assert.rejects(fetchSearchIndex(new AbortController().signal, 20), /timed out/);
  assert.equal(signal.aborted, true);
});

test("search deadline also bounds a stalled response body", async () => {
  globalThis.fetch = async () => ({ ok: true, json: () => new Promise(() => {}) });
  await assert.rejects(fetchSearchIndex(new AbortController().signal, 20), /timed out/);
});

test("closing search cancels the old request while a reopened request can succeed", async () => {
  let signal;
  globalThis.fetch = async (_path, init) => { signal = init.signal; return new Promise(() => {}); };
  const controller = new AbortController();
  const previous = fetchSearchIndex(controller.signal);
  await Promise.resolve(); controller.abort();
  await assert.rejects(previous, /Search closed/);
  assert.equal(signal.aborted, true);
  globalThis.fetch = async () => Response.json(index);
  assert.deepEqual(await fetchSearchIndex(new AbortController().signal), index);
});

test("a cancelled opening performs no fetch", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return Response.json(index); };
  const controller = new AbortController(); controller.abort();
  await assert.rejects(fetchSearchIndex(controller.signal), /Search closed/);
  assert.equal(calls, 0);
});

test("HTTP errors and malformed index rows use the search fallback", async () => {
  globalThis.fetch = async () => new Response("Unavailable", { status: 503 });
  await assert.rejects(fetchSearchIndex(new AbortController().signal), /unavailable/);
  for (const invalid of [{}, { ...index, stories: [null] }, { ...index, stories: [{ ...index.stories[0], tags: null }] }, { ...index, topics: [{ slug: "x", name: "X", count: "many" }] }]) {
    globalThis.fetch = async () => Response.json(invalid);
    await assert.rejects(fetchSearchIndex(new AbortController().signal), /incomplete/);
  }
});
