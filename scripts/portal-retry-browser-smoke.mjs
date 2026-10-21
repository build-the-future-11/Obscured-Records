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

  browser = await chromium.launch();
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
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
