import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { loadMemberSnapshot, saveMemberPreferences, saveMemberProfile } from "../lib/member-client.ts";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const profile = { displayName: "Member", email: "member@example.test", bio: "", digestFrequency: "none" };
const preferences = { textSize: "standard", theme: "system" };
const respond = payload => { globalThis.fetch = async () => Response.json(payload); };

test("profile save sends the submitted draft and returns a complete canonical receipt", async () => {
  const draft = { ...profile, displayName: "  Member  ", bio: "  About me  ", digestFrequency: "weekly" };
  const canonical = { ...profile, bio: "About me", digestFrequency: "weekly", revision: "optional metadata" };
  let request;
  globalThis.fetch = async (path, init) => {
    request = { path, init };
    return Response.json({ ok: true, profile: canonical });
  };
  assert.deepEqual(await saveMemberProfile(draft), canonical);
  assert.equal(request.path, "/api/member/profile");
  assert.equal(request.init.method, "PATCH");
  assert.deepEqual(JSON.parse(request.init.body), draft);
  assert.equal(draft.displayName, "  Member  ", "Canonical receipts must not mutate the submitted draft");
});

test("profile receipts accept all supported digest values and valid text boundaries", async () => {
  for (const digestFrequency of ["none", "weekly", "monthly"]) {
    const canonical = { ...profile, displayName: "a".repeat(80), bio: "b".repeat(500), digestFrequency };
    respond({ ok: true, profile: canonical });
    assert.deepEqual(await saveMemberProfile(profile), canonical);
  }
});

test("profile saves require an explicit positive acknowledgement", async () => {
  for (const ok of [undefined, false, null, 1, "true"]) {
    respond({ ok, profile });
    await assert.rejects(saveMemberProfile(profile), /could not confirm your profile save/);
  }
});

test("profile receipts reject missing, incomplete and unsupported account fields", async () => {
  const invalid = [
    undefined, null, [], "profile", {},
    { ...profile, displayName: undefined }, { ...profile, displayName: 42 },
    { ...profile, displayName: "   " }, { ...profile, displayName: "a".repeat(81) },
    { ...profile, email: undefined }, { ...profile, email: false }, { ...profile, email: " " },
    { ...profile, bio: undefined }, { ...profile, bio: [] }, { ...profile, bio: "b".repeat(501) },
    { ...profile, digestFrequency: undefined }, { ...profile, digestFrequency: "daily" },
  ];
  for (const value of invalid) {
    respond({ ok: true, profile: value });
    await assert.rejects(saveMemberProfile(profile), /could not confirm your profile save/);
  }
});

test("profile saves reject array and empty success envelopes", async () => {
  for (const payload of [[], [{}], {}, { ok: true }]) {
    respond(payload);
    await assert.rejects(saveMemberProfile(profile), /could not confirm your profile save/);
  }
});

test("settings save preserves the submitted payload and accepts every supported canonical combination", async () => {
  for (const textSize of ["standard", "large", "larger"]) {
    for (const theme of ["system", "light", "dark"]) {
      const canonical = { textSize, theme };
      globalThis.fetch = async (path, init) => {
        assert.equal(path, "/api/member/preferences");
        assert.equal(init.method, "PUT");
        assert.deepEqual(JSON.parse(init.body), preferences);
        return Response.json({ ok: true, preferences: canonical });
      };
      assert.deepEqual(await saveMemberPreferences(preferences), canonical);
    }
  }
});

test("settings saves require an explicit positive acknowledgement", async () => {
  for (const ok of [undefined, false, null, 1, "true"]) {
    respond({ ok, preferences });
    await assert.rejects(saveMemberPreferences(preferences), /could not confirm your reading settings save/);
  }
});

test("settings receipts reject missing fields, invalid enums and unexpected containers", async () => {
  const invalid = [
    undefined, null, [], "settings", {},
    { textSize: "standard" }, { theme: "dark" },
    { ...preferences, textSize: 1 }, { ...preferences, textSize: "huge" },
    { ...preferences, theme: false }, { ...preferences, theme: "unsupported" },
  ];
  for (const value of invalid) {
    respond({ ok: true, preferences: value });
    await assert.rejects(saveMemberPreferences(preferences), /could not confirm your reading settings save/);
  }
});

test("snapshot hydration rejects invalid settings before returning account data", async () => {
  for (const invalid of [
    { textSize: "huge", theme: "dark" },
    { textSize: "large", theme: "unsupported" },
    { textSize: "standard" }, null, [],
  ]) {
    globalThis.fetch = async path => Response.json(path.endsWith("preferences") ? { preferences: invalid } : { items: [] });
    await assert.rejects(loadMemberSnapshot(), /library response was incomplete/);
  }
});

test("snapshot hydration accepts valid read responses without a write acknowledgement", async () => {
  globalThis.fetch = async path => Response.json(path.endsWith("preferences") ? { preferences } : { items: [] });
  assert.deepEqual(await loadMemberSnapshot(), { library: [], annotations: [], preferences });
});

test("a cancelled account save does not fetch or treat a later receipt as confirmed", async () => {
  const controller = new AbortController(); controller.abort();
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; return Response.json({ ok: true, profile, preferences }); };
  await assert.rejects(saveMemberProfile(profile, controller.signal), /cancelled/);
  await assert.rejects(saveMemberPreferences(preferences, controller.signal), /cancelled/);
  assert.equal(requests, 0);
});
