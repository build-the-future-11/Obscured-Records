import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { portalDate } from "../lib/portal-contract.ts";

const client = new URL("../lib/portal-client.ts", import.meta.url).href;
function inZone(zone, expression) {
  const result = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e",
    `import { localPortalDateTime, preparePortalPayload } from ${JSON.stringify(client)}; console.log(JSON.stringify(${expression}));`],
  { env: { ...process.env, TZ: zone }, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("portal form times preserve the member's instant across browser time zones", () => {
  const expected = {
    "Asia/Kolkata": "2026-11-05T14:00:00.000Z",
    "America/New_York": "2026-11-06T00:30:00.000Z",
    "Europe/Berlin": "2026-11-05T18:30:00.000Z",
    UTC: "2026-11-05T19:30:00.000Z",
  };
  for (const [zone, instant] of Object.entries(expected)) {
    const payload = inZone(zone, 'preparePortalPayload("admin-publish", { type: "event", startsAt: "2026-11-05T19:30" })');
    assert.equal(payload.startsAt, instant, zone);
    assert.equal(portalDate(payload.startsAt), instant, "Server must preserve the already-resolved instant.");
  }
});

test("all timed portal actions serialize their local fields without changing date-only milestones", () => {
  const results = inZone("Asia/Kolkata", `[
    preparePortalPayload("admin-publish", { type: "opportunity", deadline: "2026-11-05T19:30", startsAt: "unused" }),
    preparePortalPayload("admin-publish", { type: "program", deadline: "2026-11-05T19:30" }),
    preparePortalPayload("log-mentor-session", { sessionAt: "2026-11-05T19:30", goal: "Keep this text" }),
    preparePortalPayload("send-invitation", { expiresAt: "2026-11-05T19:30" }),
    preparePortalPayload("admin-add-schedule", { when: "2026-11-05T19:30" }),
    preparePortalPayload("add-milestone", { dueDate: "2026-11-05" }),
    preparePortalPayload("admin-publish", { type: "resource", deadline: "unused" }),
    preparePortalPayload("admin-add-schedule", { when: "" })
  ]`);
  const instant = "2026-11-05T14:00:00.000Z";
  assert.deepEqual(results, [
    { type: "opportunity", deadline: instant, startsAt: "unused" },
    { type: "program", deadline: instant },
    { sessionAt: instant, goal: "Keep this text" },
    { expiresAt: instant }, { when: instant }, { dueDate: "2026-11-05" },
    { type: "resource", deadline: "unused" }, { when: "" },
  ]);
});

test("serialization leaves the original form draft intact and preserves seconds", () => {
  assert.deepEqual(inZone("Asia/Kolkata", `(() => {
    const original = { type: "event", startsAt: "2026-11-05T19:30:42.125" };
    return { original, prepared: preparePortalPayload("admin-publish", original) };
  })()`), {
    original: { type: "event", startsAt: "2026-11-05T19:30:42.125" },
    prepared: { type: "event", startsAt: "2026-11-05T14:00:42.125Z" },
  });
});

test("impossible calendar dates and skipped daylight-saving times cannot silently move", () => {
  for (const [zone, value] of [["UTC", "2026-02-30T12:00"], ["UTC", "2026-11-05T24:00"], ["America/New_York", "2026-03-08T02:30"]]) {
    const message = inZone(zone, `(() => { try { localPortalDateTime(${JSON.stringify(value)}); return null; } catch (error) { return error.message; } })()`);
    assert.match(message, /valid date and time/, `${zone}: ${value}`);
  }
});

test("server requires a timezone for timestamps and rejects invalid dates without normalizing them", () => {
  for (const value of ["2026-11-05T19:30", "2026-11-05T19:30:00", "2026-02-30", "2026-02-30T19:30:00Z", "2026-11-05T24:00:00Z", "2026-11-05T19:60:00Z", "2026-11-05T19:30:60Z", "2026-11-05T19:30:00+24:00", "11/05/2026", "tomorrow"]) {
    assert.equal(portalDate(value), null, value);
  }
  assert.equal(portalDate("2026-11-05T19:30:00+05:30"), "2026-11-05T14:00:00.000Z");
  assert.equal(portalDate("2028-02-29"), "2028-02-29T00:00:00.000Z");
  assert.equal(portalDate("2026-11-05"), "2026-11-05T00:00:00.000Z");
  assert.equal(portalDate(""), "");
  assert.equal(portalDate("", true), null);
});
