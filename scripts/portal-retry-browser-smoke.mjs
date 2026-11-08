import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

assert.ok(process.env.BROWSER_TOOLS_DIR, "Set BROWSER_TOOLS_DIR to a repository with Playwright installed.");
const requireTools = createRequire(resolve(process.env.BROWSER_TOOLS_DIR, "package.json"));
const { chromium } = requireTools("playwright");

const portProbe = createServer();
await new Promise((resolveReady, reject) => {
  portProbe.once("error", reject);
  portProbe.listen(0, "127.0.0.1", resolveReady);
});
const { port } = portProbe.address();
await new Promise((resolveClosed) => portProbe.close(resolveClosed));
const base = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--config",
    "scripts/portal-retry-browser-vite.config.mjs",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput = (serverOutput + chunk).slice(-12_000); });
server.stderr.on("data", (chunk) => { serverOutput = (serverOutput + chunk).slice(-12_000); });

let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Vite exited ${server.exitCode}: ${serverOutput}`);
    try {
      const response = await fetch(`${base}/portal-retry.html`, { signal: AbortSignal.timeout(500) });
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(100);
  }
  assert.ok(ready, `Portal fixture startup deadline exceeded: ${serverOutput}`);

  browser = await chromium.launch(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {});
  const context = await browser.newContext();
  let portalRequests = 0;
  let releaseRetry;
  let markRetryStarted;
  const retryStarted = new Promise((resolveStarted) => { markRetryStarted = resolveStarted; });
  const retryHeld = new Promise((resolveHeld) => { releaseRetry = resolveHeld; });
  const portal = {
    admin: false,
    canModerate: false,
    assignedRoles: [],
    notificationPreferences: { reminders: false },
    profile: { displayName: "Fixture Member", bio: "Recovered profile" },
    details: { skills: "[]", interests: "[]", accomplishments: "", portfolioUrl: "", directoryVisible: false },
  };

  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== base) return route.abort("blockedbyclient");
    if (url.pathname === "/api/member/portal" && request.method() === "GET") {
      portalRequests += 1;
      if (portalRequests === 1) {
        return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Portal temporarily unavailable." }) });
      }
      markRetryStarted();
      await retryHeld;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(portal) });
    }
    return route.continue();
  });

  const page = await context.newPage();
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !/Failed to load resource.*503/.test(message.text())) browserErrors.push(message.text());
  });
  await page.goto(`${base}/portal-retry.html`);
  await page.getByRole("heading", { name: "Workspace could not load" }).waitFor();
  assert.match(await page.getByRole("status").textContent(), /Portal temporarily unavailable/);

  await page.getByRole("button", { name: "Try again" }).click();
  await retryStarted;
  const retryButton = page.getByRole("button", { name: "Trying again…" });
  assert.equal(await retryButton.isDisabled(), true);
  assert.match(await page.getByRole("status").textContent(), /Retrying your member workspace/);
  await page.evaluate(() => document.querySelector("button")?.click());
  await delay(100);
  assert.equal(portalRequests, 2, "A pending retry must not issue a duplicate portal load.");

  releaseRetry();
  await page.getByRole("heading", { name: "Represent your work accurately." }).waitFor();
  assert.equal(await page.getByLabel("Display name").inputValue(), "Fixture Member");
  assert.equal(browserErrors.length, 0, browserErrors.join(" | "));
  console.log("PASS portal retry browser: failure, disabled pending retry, no duplicate load, and recovered profile");
  await context.close();

  const projects = [{ id: "project-1", title: "Archive review", summary: "Review the primary record.", createdBy: "lead", leaderName: "Fixture lead", status: "active" }];
  const milestones = [
    { id: "milestone-1", projectId: "project-1", title: "Confirm primary sources", dueDate: "2026-11-08T00:00:00.000Z", status: "planned" },
    { id: "milestone-2", projectId: "project-1", title: "Review leap-day record", dueDate: "2028-02-29T00:00:00.000Z", status: "in_progress" },
    { id: "milestone-3", projectId: "project-1", title: "Review without a date", dueDate: null, status: "planned" },
  ];
  for (const timezoneId of ["America/New_York", "America/Los_Angeles", "Asia/Kolkata", "Pacific/Kiritimati", "UTC"]) {
    for (const userId of ["lead", "contributor"]) {
      const projectContext = await browser.newContext({ timezoneId, locale: "en-US" });
      const projectPortal = {
        admin: false, canModerate: false, assignedRoles: [], viewer: { userId },
        projects, milestones, teamRequests: [], evidence: [], messages: [], contributions: [],
        memberships: [{ id: "membership-1", projectId: "project-1", userId, displayName: "Fixture member", status: "accepted", role: userId === "lead" ? "lead" : "contributor" }],
      };
      await projectContext.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== base) return route.abort("blockedbyclient");
        if (url.pathname === "/api/member/portal") {
          assert.equal(route.request().method(), "GET", "The calendar display check must not submit live actions.");
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(projectPortal) });
        }
        return route.continue();
      });
      const projectPage = await projectContext.newPage();
      const errors = [];
      projectPage.on("pageerror", (error) => errors.push(error.message));
      await projectPage.goto(`${base}/portal-retry.html?view=projects`);
      await projectPage.getByRole("heading", { name: "Archive review: team workspace" }).waitFor();
      if (userId === "lead") {
        assert.equal(await projectPage.locator(".portal-project").getByText("Confirm primary sources · 11/8/2026 · planned", { exact: true }).count(), 1, `${timezoneId}: lead must see the selected calendar day.`);
        assert.equal(await projectPage.locator(".portal-project").getByText("Review leap-day record · 2/29/2028 · in_progress", { exact: true }).count(), 1, `${timezoneId}: leap-day target must not move.`);
      }
      const workspace = projectPage.locator("section").filter({ has: projectPage.getByRole("heading", { name: "Archive review: team workspace", exact: true }) });
      for (const [title, target] of [["Confirm primary sources", "11/8/2026"], ["Review leap-day record", "2/29/2028"], ["Review without a date", "No deadline"]]) {
        const label = workspace.locator("label").filter({ has: projectPage.getByRole("combobox", { name: new RegExp(title) }) });
        assert.match(await label.textContent(), new RegExp(target.replaceAll("/", "\\/")), `${timezoneId}/${userId}: accepted teammates must see the target date.`);
      }
      assert.equal(errors.length, 0, errors.join(" | "));
      await projectContext.close();
    }
  }
  console.log("PASS portal milestone browser: selected day, leap day, and absent target for lead and contributor in five time zones");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
