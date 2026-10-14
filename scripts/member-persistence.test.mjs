import test, { after, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/d1";

// Exercise the actual handlers, schema and pinned D1 driver. Only the hosting
// identity and D1 transport are replaced; SQL executes in an isolated SQLite DB.
const root = new URL("../", import.meta.url);
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/app/chatgpt-auth") {
      return { shortCircuit: true, url: "data:text/javascript,export async function getChatGPTUser(){return globalThis.__memberPersistenceUser}" };
    }
    if (specifier === "@/db") {
      return { shortCircuit: true, url: "data:text/javascript,export function getDb(){return globalThis.__memberPersistenceDb}" };
    }
    // Native Node needs the extension for the shared upload-reader re-export.
    if (specifier === "./member-request" && context.parentURL === new URL("lib/member-api.ts", root).href) {
      return nextResolve(new URL("lib/member-request.ts", root).href, context);
    }
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`${specifier.slice(2)}.ts`, root).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const annotations = await import("../app/api/member/annotations/route.ts");
const library = await import("../app/api/member/library/route.ts");

let sqlite;
let statements;
function member(userId = "member-a") {
  globalThis.__memberPersistenceUser = { userId, email: `${userId}@example.test`, displayName: userId, fullName: null };
}
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("drizzle/0002_ordinary_sentinels.sql", root), "utf8"));
  statements = [];
  globalThis.__memberPersistenceDb = drizzle({
    prepare(sql) {
      function statement(params = []) {
        async function execute(raw = false, run = false) {
          statements.push({ sql, params });
          const query = sqlite.prepare(sql);
          if (run) return { success: true, results: [], meta: query.run(...params) };
          const results = query.all(...params);
          return raw ? results.map((row) => Object.values(row)) : { success: true, results };
        }
        return { bind: (...params) => statement(params), run: () => execute(false, true), all: () => execute(), raw: () => execute(true) };
      }
      return statement();
    },
  });
  member();
});
afterEach(() => {
  sqlite.close();
  delete globalThis.__memberPersistenceDb;
  delete globalThis.__memberPersistenceUser;
});
after(() => hook.deregister());

const firstTimestamp = "2026-10-01T08:00:00.000Z";
const nextTimestamp = "2026-10-11T09:00:00.000Z";
function note(overrides = {}) {
  return { id: "note-1", slug: "first-story", text: "The original passage", note: "Private note", anchor: "section-one", createdAt: firstTimestamp, ...overrides };
}
function story(overrides = {}) {
  return { slug: "first-story", state: "Unread", savedAt: firstTimestamp, ...overrides };
}
function request(path, method, body) {
  return new Request(`https://obscured.example.test/api/member/${path}`, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
async function readAnnotations() {
  return (await (await annotations.GET(new Request("https://obscured.example.test/api/member/annotations"))).json()).items;
}
async function readLibrary() {
  return (await (await library.GET()).json()).items;
}
function storedAnnotationRows() {
  return sqlite.prepare("SELECT * FROM member_annotations ORDER BY id").all().map((row) => ({ ...row }));
}

test("new annotation receipt equals the private stored record", async () => {
  const response = await annotations.POST(request("annotations", "POST", note()));
  assert.equal(response.status, 201);
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  const payload = await response.json();
  assert.equal(payload.ok, true);
  assert.deepEqual(payload.item, note());
  assert.deepEqual(await readAnnotations(), [payload.item]);
  assert.equal(storedAnnotationRows()[0].id, "member-a:note-1");
});

test("annotation update acknowledges the retained creation timestamp", async () => {
  await annotations.POST(request("annotations", "POST", note()));
  const update = note({ text: "An edited passage", note: "Edited note", anchor: "section-two", createdAt: nextTimestamp });
  const response = await annotations.POST(request("annotations", "POST", update));
  assert.equal(response.status, 201);
  const payload = await response.json();
  assert.deepEqual(payload.item, { ...update, createdAt: firstTimestamp });
  assert.deepEqual(await readAnnotations(), [payload.item]);
});

test("another article cannot overwrite an existing annotation identity", async () => {
  await annotations.POST(request("annotations", "POST", note()));
  const before = storedAnnotationRows();
  const response = await annotations.POST(request("annotations", "POST", note({ slug: "second-story", text: "Other article passage", anchor: "other-section" })));
  assert.equal(response.status, 409);
  const payload = await response.json();
  assert.equal(payload.ok, undefined);
  assert.equal(payload.item, undefined);
  assert.equal(typeof payload.error, "string");
  assert.deepEqual(storedAnnotationRows(), before);
  assert.deepEqual(await readAnnotations(), [note()]);
});

test("competing articles with one note ID yield one stored winner", async () => {
  const left = note();
  const right = note({ slug: "second-story", text: "The other passage", anchor: "other-section" });
  const responses = await Promise.all([
    annotations.POST(request("annotations", "POST", left)),
    annotations.POST(request("annotations", "POST", right)),
  ]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409]);
  const winner = responses.find((response) => response.status === 201);
  const payload = await winner.json();
  assert.deepEqual(await readAnnotations(), [payload.item]);
  assert.equal(storedAnnotationRows().length, 1);
});

test("same note ID remains independent across authenticated members", async () => {
  await annotations.POST(request("annotations", "POST", note()));
  member("member-b");
  const other = note({ slug: "second-story", note: "Other account", userId: "member-a" });
  const response = await annotations.POST(request("annotations", "POST", other));
  assert.equal(response.status, 201);
  const payload = await response.json();
  assert.equal(payload.item.slug, "second-story");
  assert.deepEqual(await readAnnotations(), [payload.item]);
  member();
  assert.deepEqual(await readAnnotations(), [note()]);
  assert.equal(storedAnnotationRows().length, 2);
});

test("new saved-story receipt equals the private stored record", async () => {
  const response = await library.PUT(request("library", "PUT", story()));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.ok, true);
  assert.deepEqual(payload.item, story());
  assert.deepEqual(await readLibrary(), [payload.item]);
});

test("saved-story update acknowledges its retained original save timestamp", async () => {
  await library.PUT(request("library", "PUT", story()));
  const response = await library.PUT(request("library", "PUT", story({ state: "Finished", savedAt: nextTimestamp })));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.deepEqual(payload.item, story({ state: "Finished" }));
  assert.deepEqual(await readLibrary(), [payload.item]);
});

test("repeat imports confirm the same records without duplicates", async () => {
  for (let index = 0; index < 3; index += 1) {
    const annotation = await annotations.POST(request("annotations", "POST", note()));
    const saved = await library.PUT(request("library", "PUT", story()));
    assert.equal(annotation.status, 201);
    assert.equal(saved.status, 200);
    assert.deepEqual((await annotation.json()).item, note());
    assert.deepEqual((await saved.json()).item, story());
  }
  assert.deepEqual(await readAnnotations(), [note()]);
  assert.deepEqual(await readLibrary(), [story()]);
});

test("same story remains independent across authenticated members", async () => {
  await library.PUT(request("library", "PUT", story()));
  member("member-b");
  const response = await library.PUT(request("library", "PUT", story({ state: "Finished", savedAt: nextTimestamp, userId: "member-a" })));
  const payload = await response.json();
  assert.deepEqual(payload.item, story({ state: "Finished", savedAt: nextTimestamp }));
  assert.deepEqual(await readLibrary(), [payload.item]);
  member();
  assert.deepEqual(await readLibrary(), [story()]);
});

test("unauthenticated imports perform no database work", async () => {
  globalThis.__memberPersistenceUser = null;
  for (const [handler, path, method, value] of [[annotations.POST, "annotations", "POST", note()], [library.PUT, "library", "PUT", story()]]) {
    const response = await handler(request(path, method, value));
    assert.equal(response.status, 401);
  }
  assert.equal(statements.length, 0);
});

test("invalid imports perform no database work", async () => {
  const invalid = [
    [annotations.POST, "annotations", "POST", note({ id: "../other-member" })],
    [annotations.POST, "annotations", "POST", note({ slug: "../other-story" })],
    [library.PUT, "library", "PUT", story({ state: "Published" })],
  ];
  for (const [handler, path, method, value] of invalid) {
    assert.equal((await handler(request(path, method, value))).status, 400);
  }
  assert.equal(statements.length, 0);
});

test("a database write failure cannot produce a successful acknowledgement", async () => {
  sqlite.exec("CREATE TRIGGER reject_story BEFORE INSERT ON member_library BEGIN SELECT RAISE(ABORT, 'fixture write failure'); END");
  await assert.rejects(library.PUT(request("library", "PUT", story())));
  assert.deepEqual(await readLibrary(), []);
});

test("a write that returns no stored story cannot be acknowledged", async () => {
  sqlite.exec("CREATE TRIGGER ignore_story BEFORE INSERT ON member_library BEGIN SELECT RAISE(IGNORE); END");
  const response = await library.PUT(request("library", "PUT", story()));
  assert.equal(response.status, 503);
  const payload = await response.json();
  assert.equal(payload.ok, undefined);
  assert.equal(payload.item, undefined);
  assert.deepEqual(await readLibrary(), []);
});
