import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { deleteMemberRecord, importMemberReading, loadMemberSnapshot, memberRequest, removeLocalMemberCopy, saveReaderAnnotation, updateMemberReadingState } from "../lib/member-client.ts";
import { LIBRARY_KEY, NOTES_KEY } from "../lib/reader-storage.ts";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const story = { slug: "first-story", state: "Unread", savedAt: "2026-10-16T00:00:00.000Z" };
const note = { id: "note-1", slug: "first-story", text: "A saved passage", note: "Private context", anchor: "section-one", createdAt: "2026-10-16T00:00:00.000Z" };

test("member request bounds a stalled fetch and aborts its transport", async () => {
  let signal;
  globalThis.fetch = async (_path, init) => { signal = init.signal; return new Promise(() => {}); };
  await assert.rejects(memberRequest("/api/member/library", {}, 20), /timed out/);
  assert.equal(signal.aborted, true);
});

test("member request deadline also covers a stalled JSON body", async () => {
  let signal;
  globalThis.fetch = async (_path, init) => { signal = init.signal; return { ok: true, json: () => new Promise(() => {}) }; };
  await assert.rejects(memberRequest("/api/member/library", {}, 20), /timed out/);
  assert.equal(signal.aborted, true);
});

test("member request supports cancellation without starting an already-cancelled request", async () => {
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; return Response.json({ items: [] }); };
  const controller = new AbortController(); controller.abort();
  await assert.rejects(memberRequest("/api/member/library", { signal: controller.signal }), /cancelled/);
  assert.equal(requests, 0);
});

test("member request cancels pending work when the component leaves", async () => {
  let transport;
  globalThis.fetch = async (_path, init) => { transport = init.signal; return new Promise(() => {}); };
  const controller = new AbortController();
  const request = memberRequest("/api/member/library", { signal: controller.signal });
  await Promise.resolve(); controller.abort();
  await assert.rejects(request, /cancelled/);
  assert.equal(transport.aborted, true);
});

test("member errors retain server feedback and reject unreadable success bodies", async () => {
  globalThis.fetch = async () => Response.json({ error: "Sign in again." }, { status: 401 });
  await assert.rejects(memberRequest("/api/member/library"), /Sign in again/);
  globalThis.fetch = async () => new Response("<h1>Upstream error</h1>", { status: 502 });
  await assert.rejects(memberRequest("/api/member/library"), /unavailable/);
  globalThis.fetch = async () => new Response("not json");
  await assert.rejects(memberRequest("/api/member/library"), /unreadable/);
});

test("confirmed imports retain their receipt when refreshing the library fails", async () => {
  const writes = [];
  globalThis.fetch = async (path, init) => {
    if (init.method) { writes.push([path, JSON.parse(init.body)]); return Response.json({ ok: true }); }
    return Response.json({ error: "Read service unavailable." }, { status: 503 });
  };
  const result = await importMemberReading([story], [note]);
  assert.equal(result.stories, 1); assert.equal(result.notes, 1);
  assert.equal(result.snapshot, null);
  assert.match(result.refreshError, /Read service unavailable/);
  assert.deepEqual(writes, [["/api/member/library", story], ["/api/member/annotations", note]]);
});

test("partial import reports only confirmed writes and stops before later writes", async () => {
  const paths = [];
  globalThis.fetch = async (path) => {
    paths.push(path);
    return path.endsWith("library") ? Response.json({ ok: true }) : Response.json({ error: "Storage unavailable." }, { status: 503 });
  };
  await assert.rejects(importMemberReading([story], [note, { ...note, id: "note-2" }]), /1 saved stories and 0 notes were confirmed.*Storage unavailable/);
  assert.deepEqual(paths, ["/api/member/library", "/api/member/annotations"]);
});

test("an unconfirmed successful HTTP response cannot be counted as an import", async () => {
  globalThis.fetch = async () => Response.json({});
  await assert.rejects(importMemberReading([story], []), /0 saved stories and 0 notes were confirmed.*not confirmed/);
});

test("complete import supplies the refreshed account snapshot", async () => {
  const preferences = { textSize: "large", theme: "dark" };
  globalThis.fetch = async (path, init) => Response.json(init.method ? { ok: true } : path.endsWith("library") ? { items: [story] } : path.endsWith("annotations") ? { items: [note] } : { preferences });
  const result = await importMemberReading([story], [note]);
  assert.equal(result.refreshError, null);
  assert.deepEqual(result.snapshot, { library: [story], annotations: [note], preferences });
  assert.deepEqual(await loadMemberSnapshot(), result.snapshot);
});

test("incomplete snapshots produce a readable failure instead of unusable UI state", async () => {
  globalThis.fetch = async () => Response.json({});
  await assert.rejects(loadMemberSnapshot(), /response was incomplete/);
});

test("reading-state change returns the confirmed state and original save date", async () => {
  let sent;
  const stored = { ...story, state: "Finished", savedAt: "2026-10-14T00:00:00.000Z" };
  globalThis.fetch = async (path, init) => {
    assert.equal(path, "/api/member/library"); assert.equal(init.method, "PUT");
    sent = JSON.parse(init.body);
    return Response.json({ ok: true, item: stored });
  };
  assert.deepEqual(await updateMemberReadingState(story, "Finished"), stored);
  assert.deepEqual(sent, { ...story, state: "Finished" });
  assert.equal(story.state, "Unread");
});

test("failed or mismatched reading-state receipts leave the current record unchanged", async () => {
  globalThis.fetch = async () => Response.json({ error: "Storage unavailable." }, { status: 503 });
  await assert.rejects(updateMemberReadingState(story, "Finished"), /Storage unavailable/);
  globalThis.fetch = async () => Response.json({ ok: true, item: story });
  await assert.rejects(updateMemberReadingState(story, "Finished"), /did not confirm/);
  assert.equal(story.state, "Unread");
});

test("server-saved highlight remains successful when the device cache is full", async () => {
  globalThis.fetch = async () => Response.json({ ok: true, item: note });
  let cached;
  const result = await saveReaderAnnotation(note, true, (item) => { cached = item; throw new Error("Quota exceeded"); });
  assert.deepEqual(cached, note);
  assert.deepEqual(result, { accountSaved: true, deviceCached: false });
});

test("local-only cache failure is still a save failure and makes no network request", async () => {
  globalThis.fetch = async () => { throw new Error("Unexpected network request"); };
  await assert.rejects(saveReaderAnnotation(note, false, () => { throw new Error("Quota exceeded"); }), /Quota exceeded/);
});

test("annotation failure never caches an unconfirmed account note", async () => {
  let cached = false;
  globalThis.fetch = async () => Response.json({ error: "Not saved." }, { status: 503 });
  await assert.rejects(saveReaderAnnotation(note, true, () => { cached = true; }), /Not saved/);
  assert.equal(cached, false);
  globalThis.fetch = async () => Response.json({ ok: true, item: { ...note, id: "different-note" } });
  await assert.rejects(saveReaderAnnotation(note, true, () => { cached = true; }), /did not confirm/);
  assert.equal(cached, false);
});

test("annotation caching uses the server-confirmed record and retains retry identity", async () => {
  const sent = [];
  const stored = { ...note, createdAt: "2026-10-15T00:00:00.000Z" };
  globalThis.fetch = async (_path, init) => { sent.push(JSON.parse(init.body)); return Response.json({ ok: true, item: stored }); };
  const cached = [];
  for (let attempt = 0; attempt < 2; attempt += 1) assert.deepEqual(await saveReaderAnnotation(note, true, (item) => cached.push(item)), { accountSaved: true, deviceCached: true });
  assert.deepEqual(sent.map((item) => item.id), [note.id, note.id]);
  assert.deepEqual(cached, [stored, stored]);
});

test("deleting a local note or story removes only matching copies and preserves unrelated rows", () => {
  const oldNotes = Array.from({ length: 505 }, (_, id) => ({ ...note, id: `kept-${id}` }));
  const values = new Map([[NOTES_KEY, JSON.stringify([note, ...oldNotes, { legacy: "retain" }, null])], [LIBRARY_KEY, JSON.stringify([story, { ...story, slug: "other-story" }])]]);
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let events = 0;
  removeLocalMemberCopy("annotation", note.id, storage, () => { events += 1; });
  assert.deepEqual(JSON.parse(values.get(NOTES_KEY)), [...oldNotes, { legacy: "retain" }, null]);
  assert.equal(JSON.parse(values.get(LIBRARY_KEY)).length, 2);
  removeLocalMemberCopy("story", story.slug, storage, () => { events += 1; });
  assert.deepEqual(JSON.parse(values.get(LIBRARY_KEY)), [{ ...story, slug: "other-story" }]);
  assert.equal(events, 2);
});

test("missing local copies do not rewrite storage; corrupt data is not overwritten", () => {
  let writes = 0;
  for (const raw of [null, JSON.stringify([note])]) {
    removeLocalMemberCopy("annotation", "other-id", { getItem: () => raw, setItem: () => { writes += 1; } }, () => {});
  }
  for (const raw of ["not-json", "{}"])
    assert.throws(() => removeLocalMemberCopy("annotation", note.id, { getItem: () => raw, setItem: () => { writes += 1; } }, () => {}));
  assert.equal(writes, 0);
});

test("account deletion clears the matching local copy only after its successful receipt", async () => {
  const events = [];
  globalThis.fetch = async (path, init) => { events.push([path, init.method]); return Response.json({ ok: true }); };
  const result = await deleteMemberRecord("annotation", note.id, undefined, (kind, id) => { events.push([kind, id]); });
  assert.deepEqual(events, [["/api/member/annotations?id=note-1", "DELETE"], ["annotation", note.id]]);
  assert.deepEqual(result, { accountDeleted: true, deviceCleared: true });
  events.length = 0;
  await deleteMemberRecord("story", story.slug, undefined, (kind, id) => { events.push([kind, id]); });
  assert.deepEqual(events, [["/api/member/library?slug=first-story", "DELETE"], ["story", story.slug]]);
});

test("failed or unconfirmed account deletion keeps local copies", async () => {
  let cleanup = 0;
  globalThis.fetch = async () => Response.json({ error: "Storage unavailable." }, { status: 503 });
  await assert.rejects(deleteMemberRecord("annotation", note.id, undefined, () => { cleanup += 1; }), /Storage unavailable/);
  globalThis.fetch = async () => Response.json({});
  await assert.rejects(deleteMemberRecord("story", story.slug, undefined, () => { cleanup += 1; }), /did not confirm deletion/);
  assert.equal(cleanup, 0);
});

test("device cleanup failure preserves the successful account-deletion receipt", async () => {
  globalThis.fetch = async () => Response.json({ ok: true });
  assert.deepEqual(await deleteMemberRecord("annotation", note.id, undefined, () => { throw new Error("Device storage blocked"); }), { accountDeleted: true, deviceCleared: false });
  assert.deepEqual(await deleteMemberRecord("story", story.slug, undefined, () => { throw new Error("Device storage blocked"); }), { accountDeleted: true, deviceCleared: false });
});
