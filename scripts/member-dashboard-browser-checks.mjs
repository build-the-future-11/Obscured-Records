import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

const tests = [];
const test = (name, run) => tests.push({ name, run });

// The account component and its request client are the production modules.
// Only the local fixture's API responses are intercepted. No authenticated
// account, external service or persistent server database is used.
async function accountFixture(browser, base, { heldInitial = false } = {}) {
  const context = await browser.newContext();
  const state = { preferences: { textSize: "standard", theme: "system" }, library: [], holdPreferences: heldInitial };
  const writes = [], pendingReads = [], errors = [];
  const page = await context.newPage();
  page.setDefaultTimeout(5_000);
  page.on("pageerror", error => errors.push(error.message));
  await context.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== base) return route.abort("blockedbyclient");
    if (!url.pathname.startsWith("/api/member/")) return route.continue();
    if (request.method() === "GET") {
      if (url.pathname === "/api/member/preferences" && state.holdPreferences) {
        const response = await new Promise(release => pendingReads.push(release));
        return route.fulfill(response);
      }
      const payload = url.pathname === "/api/member/library" ? { items: state.library }
        : url.pathname === "/api/member/annotations" ? { items: [] }
        : { preferences: state.preferences };
      return route.fulfill({ json: payload });
    }
    assert.ok(["/api/member/profile", "/api/member/preferences"].includes(url.pathname), "Only expected fixture writes may occur");
    const response = await new Promise(release => writes.push({ path: url.pathname, method: request.method(), body: request.postDataJSON(), release }));
    return route.fulfill(response);
  });
  const field = label => page.getByLabel(new RegExp(`^${label}`));
  const button = label => page.getByRole("button", { name: label, exact: true });
  async function waitFor(predicate, description) {
    for (let i = 0; i < 500; i++) { if (predicate()) return; await delay(10); }
    assert.fail(description);
  }
  async function settled() {
    await page.waitForFunction(() => [...document.querySelectorAll("button")].find(b => b.textContent === "Save profile")?.disabled === false);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  const fixture = {
    page, state, writes, field, button,
    async mount() {
      await page.goto(`${base}/portal-retry.html?view=member-account`);
      await page.getByRole("heading", { name: "Your profile", exact: true }).waitFor();
      if (state.holdPreferences) await waitFor(() => pendingReads.length > 0, "Initial preference read did not start");
      else await settled();
    },
    async edit(label, value) {
      const input = field(label);
      if (await input.evaluate(element => element.tagName) === "SELECT") await input.selectOption(value);
      else await input.fill(value);
    },
    async clickSave(label) {
      const count = writes.length;
      await button(label).click();
      await waitFor(() => writes.length === count + 1, "Expected exactly one account write");
      assert.equal(await button(label).isDisabled(), true);
      return writes[count];
    },
    async confirm(index, payload, status = 200) {
      writes[index].release({ status, json: payload });
      await settled();
    },
    async finishRead() {
      await waitFor(() => pendingReads.length > 0, "No held account read");
      state.holdPreferences = false;
      pendingReads.shift()({ status: 200, json: { preferences: state.preferences } });
      await settled();
    },
    async importReading() {
      await button("Import local reading").click();
      if (state.holdPreferences) await waitFor(() => pendingReads.length > 0, "Import did not refresh preferences");
      else await settled();
    },
    async status() { return page.getByRole("status").textContent(); },
    async close() {
      for (const write of writes) write.release({ status: 503, json: { error: "Fixture closed" } });
      for (const release of pendingReads) release({ status: 503, json: { error: "Fixture closed" } });
      await context.close();
      assert.deepEqual(errors, [], "The production account component must not raise browser errors");
    },
  };
  return fixture;
}

for (const [fieldName, label, oldValue, newValue] of [
  ["displayName", "Display name", "Submitted Name", "Newer Name"],
  ["bio", "About you", "Submitted bio", "Newer bio"],
  ["digestFrequency", "Optional brief preference", "weekly", "monthly"],
]) test(`profile preserves newer ${fieldName} and submits it only on manual retry`, async f => {
  await f.mount(); await f.edit(label, oldValue); await f.clickSave("Save profile");
  assert.equal(f.writes[0].body[fieldName], oldValue);
  assert.equal(f.writes[0].method, "PATCH");
  await f.edit(label, newValue); await f.confirm(0, { profile: f.writes[0].body });
  assert.equal(await f.field(label).inputValue(), newValue);
  assert.match(await f.status(), /newer edits.*unsaved/i);
  assert.equal(f.writes.length, 1, "Receipt must not automatically resubmit newer edits");
  await f.clickSave("Save profile"); assert.equal(f.writes[1].body[fieldName], newValue);
  await f.confirm(1, { profile: f.writes[1].body }); assert.equal(await f.status(), "Profile saved.");
});

for (const [fieldName, label, oldValue, newValue] of [
  ["textSize", "Text size", "large", "larger"], ["theme", "Theme", "light", "dark"],
]) test(`settings preserve newer ${fieldName} and submit it only on manual retry`, async f => {
  await f.mount(); await f.edit(label, oldValue); await f.clickSave("Save settings");
  assert.equal(f.writes[0].body[fieldName], oldValue); assert.equal(f.writes[0].method, "PUT");
  await f.edit(label, newValue); await f.confirm(0, { preferences: f.writes[0].body });
  assert.equal(await f.field(label).inputValue(), newValue);
  assert.match(await f.status(), /newer edits.*unsaved/i); assert.equal(f.writes.length, 1);
  await f.clickSave("Save settings"); assert.equal(f.writes[1].body[fieldName], newValue);
  await f.confirm(1, { preferences: f.writes[1].body }); assert.equal(await f.status(), "Reading settings saved.");
});

test("unchanged profile accepts canonical server normalization", async f => {
  await f.mount(); await f.edit("Display name", "  Submitted  "); await f.clickSave("Save profile");
  await f.confirm(0, { profile: { ...f.writes[0].body, displayName: "Submitted" } });
  assert.equal(await f.field("Display name").inputValue(), "Submitted");
  assert.equal(await f.status(), "Profile saved."); assert.equal(f.writes.length, 1);
});
test("unchanged settings accept canonical server values", async f => {
  await f.mount(); await f.edit("Text size", "large"); await f.clickSave("Save settings");
  await f.confirm(0, { preferences: { textSize: "large", theme: "dark" } });
  assert.equal(await f.field("Theme").inputValue(), "dark"); assert.equal(await f.status(), "Reading settings saved.");
});
test("profile failure preserves edits for a manual retry", async f => {
  await f.mount(); await f.edit("Display name", "Before"); await f.clickSave("Save profile");
  await f.edit("About you", "New draft"); await f.confirm(0, { error: "Fixture storage failure" }, 503);
  assert.equal(await f.field("About you").inputValue(), "New draft");
  assert.match(await f.status(), /Fixture storage failure/); assert.equal(f.writes.length, 1);
  await f.clickSave("Save profile"); assert.equal(f.writes[1].body.bio, "New draft");
  await f.confirm(1, { profile: f.writes[1].body });
});
test("settings failure preserves edits for a manual retry", async f => {
  await f.mount(); await f.edit("Text size", "large"); await f.clickSave("Save settings");
  await f.edit("Theme", "dark"); await f.confirm(0, { error: "Fixture storage failure" }, 503);
  assert.equal(await f.field("Theme").inputValue(), "dark");
  assert.match(await f.status(), /Fixture storage failure/); assert.equal(f.writes.length, 1);
  await f.clickSave("Save settings"); assert.equal(f.writes[1].body.theme, "dark");
  await f.confirm(1, { preferences: f.writes[1].body });
});
test("initial read preserves edited theme and merges untouched text size", async f => {
  f.state.holdPreferences = true; f.state.preferences = { textSize: "large", theme: "light" };
  await f.mount(); assert.equal(await f.button("Save settings").isDisabled(), true);
  await f.edit("Theme", "dark"); await f.finishRead();
  assert.equal(await f.field("Theme").inputValue(), "dark"); assert.equal(await f.field("Text size").inputValue(), "large");
  assert.match(await f.status(), /unsaved/i); assert.equal(f.writes.length, 0);
});
test("import refresh preserves a settings draft created before import", async f => {
  await f.mount(); await f.edit("Theme", "dark");
  f.state.preferences = { textSize: "large", theme: "light" };
  f.state.library = [{ slug: "account-story", state: "Finished", savedAt: "2026-11-11T00:00:00Z" }];
  await f.importReading();
  assert.equal(await f.field("Theme").inputValue(), "dark"); assert.equal(await f.field("Text size").inputValue(), "large");
  assert.match(await f.status(), /Imported 0.*unsaved/i);
  assert.equal(await f.page.getByRole("heading", { name: "account-story", exact: true }).count(), 1);
  assert.equal(f.writes.length, 0);
});
test("import refresh preserves a field edited while its read is pending", async f => {
  await f.mount(); f.state.holdPreferences = true; await f.importReading(); await f.edit("Text size", "larger");
  f.state.preferences = { textSize: "standard", theme: "light" }; await f.finishRead();
  assert.equal(await f.field("Text size").inputValue(), "larger"); assert.equal(await f.field("Theme").inputValue(), "light");
  assert.match(await f.status(), /unsaved/i); assert.equal(f.writes.length, 0);
});
test("clean settings refresh after import and an acknowledged save", async f => {
  await f.mount(); f.state.preferences = { textSize: "large", theme: "light" }; await f.importReading();
  assert.equal(await f.field("Theme").inputValue(), "light");
  await f.edit("Theme", "dark"); await f.clickSave("Save settings"); await f.confirm(0, { preferences: f.writes[0].body });
  f.state.preferences = { textSize: "larger", theme: "system" }; await f.importReading();
  assert.equal(await f.field("Theme").inputValue(), "system"); assert.equal(await f.field("Text size").inputValue(), "larger");
});
test("initial read merges untouched theme and the next request includes both intended fields", async f => {
  f.state.holdPreferences = true; f.state.preferences = { textSize: "large", theme: "light" };
  await f.mount(); await f.edit("Text size", "larger"); await f.finishRead();
  assert.equal(await f.field("Theme").inputValue(), "light"); assert.equal(await f.field("Text size").inputValue(), "larger");
  await f.clickSave("Save settings"); assert.deepEqual(f.writes[0].body, { textSize: "larger", theme: "light" });
  await f.confirm(0, { preferences: f.writes[0].body });
});
test("save receipt merges a canonical untouched field and preserves the newer edit", async f => {
  await f.mount(); await f.edit("Text size", "large"); await f.clickSave("Save settings"); await f.edit("Theme", "dark");
  await f.confirm(0, { preferences: { textSize: "larger", theme: "light" } });
  assert.equal(await f.field("Text size").inputValue(), "larger"); assert.equal(await f.field("Theme").inputValue(), "dark");
  await f.clickSave("Save settings"); assert.deepEqual(f.writes[1].body, { textSize: "larger", theme: "dark" });
  await f.confirm(1, { preferences: f.writes[1].body });
});

export async function verifyMemberDashboardDrafts({ browser, base }) {
  const failures = [];
  for (const { name, run } of tests) {
    const fixture = await accountFixture(browser, base);
    try {
      await run(fixture);
      console.log(`PASS member account browser: ${name}`);
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      console.error(`FAIL member account browser: ${name}: ${error.message}`);
    } finally {
      try { await fixture.close(); } catch (error) { failures.push(`${name}: ${error.message}`); }
    }
  }
  assert.equal(failures.length, 0, failures.join("\n"));
  console.log(`PASS member account browser: all ${tests.length} scenarios`);
}
