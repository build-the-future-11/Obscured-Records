import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Test only our own local Next.js process. No provider accounts or live signups.
assert.ok(process.env.BROWSER_TOOLS_DIR, 'Set BROWSER_TOOLS_DIR to the isolated Playwright installation.');
const requireTools = createRequire(resolve(process.env.BROWSER_TOOLS_DIR, 'package.json'));
const { chromium } = requireTools('playwright');
assert.equal(requireTools('playwright/package.json').version, '1.56.0');
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
assert.match(sourceSha, /^[0-9a-f]{40}$/);
const outputDir = resolve('browser-artifacts');
await mkdir(outputDir, { recursive: true });
const portProbe = createServer();
await new Promise((resolve, reject) => { portProbe.once('error', reject); portProbe.listen(0, '127.0.0.1', resolve); });
const { port } = portProbe.address();
await new Promise((resolve) => portProbe.close(resolve));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  env: { ...process.env, NODE_ENV: 'production', VERCEL: '1', VERCEL_GIT_COMMIT_SHA: sourceSha },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '', launchError;
server.stdout.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-16000); });
server.stderr.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-16000); });
server.on('error', (error) => { launchError = error; });
const exited = new Promise((resolve) => server.once('exit', resolve));
let browser, activePage;
const checks = [], errors = [], consoleMessages = [];
function pass(name) { checks.push(name); console.log(`PASS browser: ${name}`); }

async function inspectPage(page, path, width) {
  const response = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200, `${path} returned an error`);
  await page.locator('h1').waitFor();
  assert.equal(await page.locator('h1').count(), 1, `${path}: exactly one main heading`);
  assert.equal(await page.locator('#main-content').count(), 1, `${path}: unique skip target`);
  assert.equal(await page.locator('link[rel="canonical"]').count(), 1, `${path}: unique canonical`);
  const canonical = new URL(await page.locator('link[rel="canonical"]').getAttribute('href'));
  assert.equal(canonical.pathname, path.split('?')[0]);
  assert.equal(canonical.search, '');
  assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), canonical.href);
  const overflow = await page.evaluate(() => ({
    extra: document.documentElement.scrollWidth - innerWidth,
    elements: [...document.querySelectorAll('body *')].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width && (rect.right > innerWidth + 1 || rect.left < -1) && getComputedStyle(element).position !== 'fixed';
    }).slice(0, 8).map((element) => ({ tag: element.tagName, class: element.className })),
  }));
  assert.ok(overflow.extra <= 1, `${path} at ${width}px overflow: ${JSON.stringify(overflow)}`);
  const brokenContact = await page.locator('a[href*="ryangomez.hsl"]').count();
  assert.equal(brokenContact, 0, `${path}: stale contact address`);
  const emptyLinks = await page.locator('a').evaluateAll((links) => links.filter((link) => !link.textContent.trim() && !link.getAttribute('aria-label') && !link.querySelector('img[alt]')).map((link) => link.getAttribute('href')));
  assert.deepEqual(emptyLinks, [], `${path}: links without accessible names`);
  pass(`${width}px ${path}: headings, canonical, contacts, labels, overflow`);
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (launchError) throw launchError;
    if (server.exitCode !== null) throw new Error(`Next.js exited: ${server.exitCode}`);
    try {
      const response = await fetch(`${base}/api/revision`, { signal: AbortSignal.timeout(1000) });
      assert.equal((await response.json()).revision, sourceSha); ready = true; break;
    } catch { await delay(250); }
  }
  assert.ok(ready, 'Local Next.js startup deadline exceeded.');
  browser = await chromium.launch();
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  // External images may load. Never permit an external write or submission.
  await context.route('**/*', (route) => {
    const request = route.request();
    if (new URL(request.url()).origin !== base && !['GET', 'HEAD'].includes(request.method())) return route.abort('blockedbyclient');
    return route.continue();
  });
  const page = await context.newPage(); activePage = page;
  page.setDefaultTimeout(12000);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleMessages.push(message.text()); });
  const paths = ['/', '/article/fedex-flight-705', '/world', '/latest', '/search?q=aviation&q=mercury', '/newsletter', '/submit', '/about', '/standards', '/corrections', '/privacy', '/author/ryan-gomez'];
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) await inspectPage(page, path, width);
    for (const [path, name] of [['/', 'home'], ['/article/fedex-flight-705', 'article'], ['/newsletter', 'newsletter']]) {
      await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
      await page.screenshot({ path: resolve(outputDir, `${name}-${width}.png`), fullPage: true, animations: 'disabled' });
    }
  }
  await page.setViewportSize({ width: 375, height: 850 });
  await page.goto(base);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#main-content').evaluate((element) => element === document.activeElement), true);
  pass('keyboard skip link reaches content after navigation');
  const menu = page.locator('.menu-trigger');
  await menu.click();
  const dialog = page.getByRole('dialog', { name: 'Site navigation' });
  await dialog.waitFor();
  assert.equal(await dialog.evaluate((element) => element.contains(document.activeElement)), true);
  assert.equal(await page.locator('.brand').evaluate((element) => element.inert), true);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await dialog.evaluate((element) => document.activeElement === [...element.querySelectorAll('a[href],button')].at(-1)), true);
  await page.keyboard.press('Tab');
  assert.equal(await dialog.evaluate((element) => document.activeElement === element.querySelector('button')), true);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await menu.evaluate((element) => element === document.activeElement), true);
  assert.equal(await page.locator('.brand').evaluate((element) => element.inert), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  pass('mobile menu traps focus, inerts background, closes and restores focus/scroll');
  await menu.click(); await page.setViewportSize({ width: 1440, height: 900 });
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  pass('desktop resize releases mobile overlay and scroll lock');

  await page.goto(`${base}/search?q=aviation&q=mercury`);
  assert.equal(await page.locator('#q').inputValue(), 'aviation');
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
  await page.locator('#q').fill('zzzz-no-such-record-zzzz'); await page.locator('#q').press('Enter');
  await page.getByText('No record matches that search.').waitFor();
  pass('repeated search parameters and empty-state search navigation');

  await page.goto(`${base}/article/fedex-flight-705?utm_source=smoke`);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert.ok(decodeURIComponent(await page.getByRole('link', { name: 'Share by email' }).getAttribute('href')).includes(canonical));
  assert.ok(!decodeURIComponent(await page.getByRole('link', { name: 'Share by email' }).getAttribute('href')).includes('utm_source'));
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('fixture denied')) } });
    document.execCommand = () => false;
  });
  await page.getByRole('button', { name: 'Copy article link' }).click();
  await page.getByRole('alert').filter({ hasText: 'Copy unavailable.' }).waitFor();
  assert.equal(await page.getByText('Copied', { exact: true }).count(), 0);
  pass('canonical sharing and honest clipboard-denial feedback');

  await page.goto(`${base}/newsletter`);
  const form = page.locator('.newsletter-form');
  const input = form.locator('input[type="email"]');
  await input.fill('smoke@example.invalid');
  await form.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await form.getByRole('alert').filter({ hasText: 'temporarily unavailable' }).waitFor();
  assert.equal(await input.inputValue(), 'smoke@example.invalid');
  pass('real unconfigured local newsletter returns visible failure without erasing email');
  let writes = 0, release;
  const gate = new Promise((resolve) => { release = resolve; });
  await context.route('**/api/newsletter', async (route) => {
    writes++; await gate;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Fixture signup saved.' }) });
  });
  await form.evaluate((element) => { element.requestSubmit(); element.requestSubmit(); });
  await page.waitForFunction(() => document.querySelector('.newsletter-form').getAttribute('aria-busy') === 'true');
  for (let attempt = 0; writes === 0 && attempt < 100; attempt++) await delay(20);
  assert.equal(writes, 1);
  release(); await form.getByRole('status').filter({ hasText: 'Fixture signup saved.' }).waitFor();
  assert.equal(await input.inputValue(), '');
  pass('mocked persistence response: duplicate-submit guard and success reset');
  await context.unroute('**/api/newsletter');
  await context.route('**/api/newsletter', (route) => route.fulfill({ status: 502, contentType: 'text/html', body: '<h1>Fixture upstream failure</h1>' }));
  await input.fill('smoke@example.invalid'); await form.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await form.getByRole('alert').filter({ hasText: 'Unable to subscribe right now.' }).waitFor();
  pass('non-JSON provider failure remains a readable form error');
  await context.unroute('**/api/newsletter');
  let pendingRoute;
  await context.route('**/api/newsletter', (route) => { pendingRoute = route; });
  await form.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await form.getByRole('alert').filter({ hasText: 'timed out' }).waitFor({ timeout: 15000 });
  assert.equal(await input.isEnabled(), true);
  if (pendingRoute) await pendingRoute.abort().catch(() => {});
  await context.unroute('**/api/newsletter');
  pass('actual ten-second timeout cancels request and re-enables form');

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  await staticPage.goto(`${base}/newsletter`, { waitUntil: 'domcontentloaded' });
  assert.equal(await staticPage.locator('.newsletter-form button').isDisabled(), true);
  assert.equal(await staticPage.locator('.newsletter-form').getAttribute('method'), 'post');
  await staticPage.getByText('Newsletter signup requires JavaScript.').waitFor();
  pass('no-JavaScript form cannot leak an email via GET and offers RSS');
  await noJs.close();
  for (const path of ['/rss.xml', '/news-sitemap.xml', '/sitemap.xml']) {
    const parsed = await page.evaluate(async (path) => {
      const response = await fetch(path); const text = await response.text();
      const xml = new DOMParser().parseFromString(text, 'application/xml');
      return { status: response.status, errors: xml.querySelectorAll('parsererror').length };
    }, path);
    assert.deepEqual(parsed, { status: 200, errors: 0 });
  }
  pass('RSS and both sitemaps parse as XML in Chromium');
  assert.deepEqual(errors, [], 'Browser runtime or hydration errors');
  assert.ok(!consoleMessages.some((text) => /hydration|Minified React error/i.test(text)), 'React hydration console error');
  pass('no uncaught browser exceptions or hydration errors');
} catch (error) {
  if (activePage) await activePage.screenshot({ path: resolve(outputDir, 'failure.png'), fullPage: true }).catch(() => {});
  console.error(serverOutput);
  throw error;
} finally {
  await writeFile(resolve(outputDir, 'receipt.json'), JSON.stringify({ sourceSha, browser: 'Chromium via Playwright 1.56.0', checks, errors, consoleMessages, providerPersistenceVerified: false }, null, 2));
  if (browser) await browser.close();
  if (server.exitCode === null) {
    server.kill('SIGTERM'); await Promise.race([exited, delay(2000)]);
    if (server.exitCode === null && server.signalCode === null) server.kill('SIGKILL');
  }
}
console.log(`PASS: ${checks.length} browser checks at ${sourceSha}`);
