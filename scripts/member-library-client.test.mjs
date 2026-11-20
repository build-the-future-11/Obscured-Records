import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { updateMemberReadingState } from "../lib/member-library-client.ts";

const original = { slug: "first-story", state: "Unread", savedAt: "2026-10-01T08:00:00.000Z" };

test("member state changes write through to the account and preserve the original save timestamp", async () => {
  let request;
  const result = await updateMemberReadingState(original, "Finished", async (input, init) => {
    request = { input, init };
    return Response.json({ ok: true, item: { ...original, state: "Finished" } });
  });
  assert.equal(request.input, "/api/member/library");
  assert.equal(request.init.method, "PUT");
  assert.deepEqual(JSON.parse(request.init.body), { ...original, state: "Finished" });
  assert.deepEqual(result, { ...original, state: "Finished" });
});

test("member state changes fail without a confirmed server record", async () => {
  await assert.rejects(
    updateMemberReadingState(original, "Reading", async () => Response.json({ error: "Storage unavailable." }, { status: 503 })),
    /Storage unavailable/,
  );
  await assert.rejects(
    updateMemberReadingState(original, "Reading", async () => Response.json({ ok: true }, { status: 200 })),
    /could not be confirmed/,
  );
});

test("account reading-state controls are wired to the write-through action", () => {
  const dashboard = readFileSync(new URL("../components/member-dashboard.tsx", import.meta.url), "utf8");
  assert.match(dashboard, /await updateMemberReadingState\(item, state, controller\.signal\)/);
  assert.match(dashboard, /Reading state<select[^>]+disabled=\{busy\}/);
});
