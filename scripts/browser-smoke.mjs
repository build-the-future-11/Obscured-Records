import { sourceIdentity } from './source-identity.mjs';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Test only our own local Next.js process. No provider accounts or live signups.
assert.ok(process.env.BROWSER_TOOLS_DIR, 'Set BROWSER_TOOLS_DIR to the isolated Playwright installation.');
const requireTools = createRequire(resolve(process.env.BROWSER_TOOLS_DIR, 'package.json'));
const { chromium } = requireTools('playwright');
const axeScript = requireTools.resolve('axe-core/axe.min.js');
assert.equal(requireTools('playwright/package.json').version, '1.56.0');
const { revision: sourceSha, sourceDigest } = sourceIdentity();
const outputDir = resolve(process.env.BROWSER_ARTIFACTS_DIR || 'browser-artifacts');
await mkdir(outputDir, { recursive: true });
const portProbe = createServer();
await new Promise((resolve, reject) => { portProbe.once('error', reject); portProbe.listen(0, '127.0.0.1', resolve); });
const { port } = portProbe.address();
await new Promise((resolve) => portProbe.close(resolve));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  env: { ...process.env, NODE_ENV: 'production', VERCEL: '1', VERCEL_GIT_COMMIT_SHA: sourceSha ?? "" },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '', launchError;
server.stdout.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-16000); });
server.stderr.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-16000); });
server.on('error', (error) => { launchError = error; });
const exited = new Promise((resolve) => server.once('exit', resolve));
let browser, activePage;
const checks = [], errors = [], consoleMessages = [], performanceSamples = [], accessibility = [];
function pass(name) { checks.push(name); console.log(`PASS browser: ${name}`); }

async function auditAccessibility(page, path, width, state = 'default') {
  width = page.viewportSize()?.width ?? width;
  await page.addScriptTag({ path: axeScript });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) })));
  accessibility.push({ path, width, state, violations });
  assert.deepEqual(violations, [], `${path} ${state} accessibility at ${width}px`);
}

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
  const openGraphUrl = new URL(await page.locator('meta[property="og:url"]').getAttribute('content'));
  assert.equal(openGraphUrl.href, canonical.href, `${path}: canonical and Open Graph identify the same URL`);
  const overflow = await page.evaluate(() => ({
    extra: document.documentElement.scrollWidth - innerWidth,
    elements: [...document.querySelectorAll('body *')].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width && (rect.right > innerWidth + 1 || rect.left < -1) && getComputedStyle(element).position !== 'fixed';
    }).slice(0, 8).map((element) => ({ tag: element.tagName, class: element.className })),
  }));
  assert.ok(overflow.extra <= 1, `${path} at ${width}px overflow: ${JSON.stringify(overflow)}`);
  if ([375, 1440].includes(width)) await auditAccessibility(page, path, width);
  const brokenContact = await page.locator('a[href*="ryangomez.hsl"]').count();
  assert.equal(brokenContact, 0, `${path}: stale contact address`);
  const emptyLinks = await page.locator('a').evaluateAll((links) => links.filter((link) => !link.textContent.trim() && !link.getAttribute('aria-label') && !link.querySelector('img[alt]')).map((link) => link.getAttribute('href')));
  assert.deepEqual(emptyLinks, [], `${path}: links without accessible names`);
  performanceSamples.push({ path, width, ...await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    return { domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd), documentBytes: navigation.decodedBodySize, observedResourceCount: resources.length, sameOriginTransferredBytes: resources.filter((r) => new URL(r.name).origin === location.origin).reduce((n, r) => n + r.transferSize, 0) };
  }) });
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
  browser = await chromium.launch(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {});
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
  const paths = ['/', '/article/fedex-flight-705', '/world', '/latest', '/search?q=aviation&q=mercury', '/newsletter', '/submit', '/contribute', '/about', '/standards', '/corrections', '/privacy', '/author/ryan-gomez', '/archive', '/topics', '/topic/aviation', '/authors', '/series', '/series/in-the-air', '/saved'];
  const layoutFailures = [];
  for (const width of (process.env.BROWSER_INTERACTIONS_ONLY ? [] : [320, 375, 768, 1440])) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      try { await inspectPage(page, path, width); }
      catch (error) {
        layoutFailures.push(`${width}px ${path}: ${error.message}`);
        console.error(`FAIL browser layout: ${layoutFailures.at(-1)}`);
      }
    }
    for (const [path, name] of [['/', 'home'], ['/article/fedex-flight-705', 'article'], ['/newsletter', 'newsletter'], ['/contribute', 'contribute'], ['/about', 'about']]) {
      await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
      await page.locator('h1').waitFor();
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode().catch(() => {}))); });
      await page.screenshot({ path: resolve(outputDir, `${name}-${width}.png`), fullPage: true, animations: 'disabled' });
    }
  }
  assert.deepEqual(layoutFailures, [], 'Every responsive route must pass all layout and metadata assertions.');
  await page.setViewportSize({ width: 375, height: 850 });
  await page.goto(base); await page.locator('h1').waitFor();
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
  assert.equal(await page.locator('#archive-q').inputValue(), 'aviation');
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
  await page.locator('#archive-q').fill('zzzz-no-such-record-zzzz'); await page.locator('#archive-q').press('Enter');
  await page.getByText('No matching records').waitFor();
  pass('repeated search parameters and empty-state search navigation');

  await page.goto(`${base}/search?q=aviation`);
  await page.locator('#archive-q').waitFor();
  await page.keyboard.press('Control+k');
  const navigationPalette = page.getByRole('dialog', { name: 'Search Obscured Records' });
  await navigationPalette.waitFor();
  await page.locator('#palette-query').fill('mercury');
  await navigationPalette.getByRole('link', { name: 'All results and filters' }).click();
  await page.waitForURL(`${base}/search?q=mercury`);
  await page.waitForFunction(() => document.querySelector('#archive-q')?.value === 'mercury');
  assert.match(await page.locator('.result-count').innerText(), /2 records matching “mercury”/);
  pass('client search navigation replaces the previous query and results');

  await page.goto(`${base}/archive?topic=aviation`);
  await page.locator('select[name=topic]').waitFor();
  await page.keyboard.press('Control+k');
  await navigationPalette.waitFor();
  await page.locator('#palette-query').fill('');
  await navigationPalette.getByRole('link', { name: 'Archive', exact: true }).click();
  await page.waitForURL(`${base}/archive`);
  await page.waitForFunction(() => document.querySelector('select[name=topic]')?.value === '');
  assert.equal(await page.locator('.archive-results .record-card').count(), 28);
  pass('client archive navigation clears filters omitted from the destination URL');

  await page.goto(`${base}/search?q=aviation&q=mercury`);
  await page.locator('#archive-q').waitFor();
  await page.evaluate(() => { history.pushState(null, '', '/search?q=mercury'); history.back(); });
  await page.waitForURL(`${base}/search?q=aviation&q=mercury`);
  await page.waitForFunction(() => document.querySelector('#archive-q')?.value === 'aviation');
  assert.match(await page.locator('.result-count').innerText(), /7 records matching “aviation”/);
  pass('browser history uses the same first repeated search parameter as the server');

  await page.goto(`${base}/archive`);
  await page.locator('select[name=topic]').selectOption('aviation');
  await page.locator('select[name=format]').selectOption('feature');
  assert.equal(await page.locator('.archive-results .record-card').count(), 1);
  assert.match(page.url(), /topic=aviation/);
  await page.reload();
  assert.equal(await page.locator('select[name=topic]').inputValue(), 'aviation');
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  assert.equal(await page.locator('.archive-results .record-card').count(), 28);
  pass('archive intersects filters, persists URL and restores after reload');

  await page.goto(base); await page.locator('h1').waitFor();
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'Search Obscured Records' });
  await palette.waitFor();
  await page.locator('#palette-query').fill('aviation');
  await palette.getByRole('heading', { name: 'Stories', exact: true }).waitFor();
  await palette.getByRole('heading', { name: 'Topics', exact: true }).waitFor();
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-result')), true);
  await page.keyboard.press('Escape');
  await palette.waitFor({ state: 'hidden' });
  pass('keyboard search opens a modal, groups real results and supports arrow traversal/Escape');

  await page.goto(`${base}/article/fedex-flight-705`);
  const save = page.getByRole('button', { name: '+ Save story', exact: true });
  await save.click();
  await page.getByRole('button', { name: '✓ Saved', exact: true }).waitFor();
  await page.reload();
  await page.getByRole('button', { name: '✓ Saved', exact: true }).waitFor();
  await page.locator('.reader-settings summary').click();
  await page.getByLabel('Text size', { exact: true }).selectOption('large');
  await page.getByLabel('Reading theme', { exact: true }).selectOption('dark');
  assert.equal(await page.locator('.article-page').getAttribute('data-reader-theme'), 'dark');
  await page.getByLabel('Reading theme', { exact: true }).selectOption('light');
  await page.locator('#opening').evaluate((element) => {
    const range = document.createRange(); range.selectNodeContents(element);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
  await page.getByRole('button', { name: 'Highlight selected text' }).click();
  const note = page.getByRole('dialog', { name: 'Keep this passage' });
  await note.waitFor(); await note.getByLabel('Private note (optional)').fill('Browser verification note');
  await note.getByRole('button', { name: 'Save highlight', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Passage saved' }).waitFor();
  assert.equal(await page.evaluate(() => CSS.highlights?.get('saved-passages')?.size), 1);
  await page.getByRole('button', { name: /^Preview source 1:/ }).click();
  const source = page.locator('.sources dialog[open]');
  await source.waitFor();
  assert.match(await source.getByRole('link', { name: 'Open source' }).getAttribute('href'), /^https:/);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', { name: /^Preview source 1:/ }).evaluate((e) => e === document.activeElement), true);
  await page.locator('.contents a').nth(1).click();
  assert.match(page.url(), /#section-1$/);
  await page.goto(`${base}/saved`);
  await page.getByText('Browser verification note', { exact: true }).waitFor();
  await page.locator('.saved-actions select').selectOption('Finished');
  await page.reload(); assert.equal(await page.locator('.saved-actions select').inputValue(), 'Finished');
  await page.getByRole('button', { name: 'Delete highlight', exact: true }).click();
  assert.equal(await page.getByText('Browser verification note', { exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Remove saved story', exact: true }).click();
  await page.getByRole('heading', { name: 'A place for your next read' }).waitFor();
  pass('saved states, reload persistence, reader preferences, private highlights, source focus return and removal');

  // A storage failure must preserve the reader's unsaved passage and note so
  // the same editor can retry after storage access or capacity is restored.
  for (const [method, failure] of [['setItem', 'QuotaExceededError'], ['getItem', 'SecurityError']]) {
    await page.goto(`${base}/article/fedex-flight-705`);
    await page.getByRole('button', { name: 'Highlight selected text' }).waitFor();
    await page.locator('#opening').evaluate((element) => {
      const range = document.createRange(); range.selectNodeContents(element);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    });
    await page.getByRole('button', { name: 'Highlight selected text' }).click();
    const draft = page.getByRole('dialog', { name: 'Keep this passage' });
    await draft.waitFor();
    const passage = await draft.locator('blockquote').textContent();
    const privateNote = `Retain this private note after ${failure}.`;
    await draft.getByLabel('Private note (optional)').fill(privateNote);
    const priorNotes = await page.evaluate(() => localStorage.getItem('or-notes-v1'));
    await page.evaluate(({ method, failure }) => {
      const original = Storage.prototype[method];
      window.restoreNoteStorage = () => { Storage.prototype[method] = original; };
      Storage.prototype[method] = function (key, ...args) {
        if (key === 'or-notes-v1') throw new DOMException('Local browser fixture', failure);
        return original.call(this, key, ...args);
      };
    }, { method, failure });
    try {
      await draft.getByRole('button', { name: 'Save highlight', exact: true }).click();
      await draft.getByRole('alert').filter({ hasText: 'Your text is still here' }).waitFor();
      assert.equal(await draft.evaluate((element) => element.open && element.contains(document.activeElement)), true);
      assert.equal(await draft.getByLabel('Private note (optional)').inputValue(), privateNote);
      assert.equal(await draft.locator('blockquote').textContent(), passage);
      assert.equal(await page.getByRole('status').filter({ hasText: 'Passage saved' }).count(), 0);
      await auditAccessibility(page, '/article/fedex-flight-705', 375, `highlight-${failure}`);
    } finally {
      await page.evaluate(() => { window.restoreNoteStorage(); delete window.restoreNoteStorage; });
    }
    assert.equal(await page.evaluate(() => localStorage.getItem('or-notes-v1')), priorNotes);
    await draft.getByRole('button', { name: 'Save highlight', exact: true }).click();
    await draft.waitFor({ state: 'hidden' });
    await page.getByRole('status').filter({ hasText: 'Passage saved' }).waitFor();
    // The dialog's close event is queued separately from hiding it. Wait for
    // the onClose focus restoration before asserting the keyboard destination.
    await page.locator('.highlight-trigger:focus').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Highlight selected text' }).evaluate((element) => element === document.activeElement), true);
    const savedNotes = await page.evaluate(() => JSON.parse(localStorage.getItem('or-notes-v1') || '[]'));
    assert.equal(savedNotes.length, JSON.parse(priorNotes || '[]').length + 1);
    assert.equal(savedNotes.at(-1).note, privateNote);
    assert.equal(savedNotes.at(-1).text, passage);
    pass(`highlight ${failure}: preserves draft, exposes accessible error, retries exactly once and restores focus`);
  }

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

  await page.goto(`${base}/contribute`);
  const introduction = page.locator('.submission-form');
  assert.equal(await introduction.locator('[name=sourceUrl]').getAttribute('required'), null);
  await introduction.locator('[name=email]').fill('contributor@example.invalid');
  await introduction.locator('[name=title]').fill('Local test contributor — research');
  await introduction.locator('[name=message]').fill('A beginner introduction with an interest in source verification, editing and a few hours of availability. This is a local fixture only.');
  await introduction.locator('[name=consent]').check();
  await introduction.getByRole('button', { name: 'Send introduction' }).click();
  await introduction.getByRole('alert').filter({ hasText: 'temporarily unavailable' }).waitFor();
  assert.match(await introduction.locator('[name=message]').inputValue(), /beginner introduction/);
  await auditAccessibility(page, '/contribute', 375, 'storage-error');
  await context.route('**/api/submissions', (route) => {
    const payload = route.request().postDataJSON();
    assert.equal(payload.kind, 'Contributor'); assert.equal(payload.sourceUrl, ''); assert.equal(payload.consent, true);
    return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ message: 'Fixture contributor receipt: saved for review.' }) });
  });
  await introduction.getByRole('button', { name: 'Send introduction' }).click();
  await introduction.getByRole('status').filter({ hasText: 'Fixture contributor receipt' }).waitFor();
  assert.equal(await introduction.locator('[name=message]').inputValue(), '');
  await context.unroute('**/api/submissions');
  pass('contributor onboarding without portfolio: real outage retention and mocked confirmed receipt');
  assert.equal(await page.locator('#or-cloudflare-analytics').count(), 0);
  pass('analytics remains disabled without both approval and configuration');
  for (const slug of ['therac-25', 'wirecard-missing-billions', 'lake-nyos']) {
    await page.goto(`${base}/article/${slug}`);
    assert.equal(await page.locator('.article-cover').count(), 0);
    assert.match(await page.locator('meta[property="og:image"]').first().getAttribute('content'), /\/share-card\.png$/);
    await page.getByText(/Cover withheld/).waitFor();
  }
  pass('held covers are not rendered or shared; source notes remain visible');
  await page.goto(`${base}/submit`);
  const submission = page.locator('.submission-form');
  await submission.locator('[name=email]').fill('browser-smoke@example.invalid');
  await submission.locator('[name=title]').fill('Local browser submission');
  await submission.locator('[name=sourceUrl]').fill('https://example.invalid/source');
  await submission.locator('[name=message]').fill('A local browser fixture with sufficient detail to test the contributor form and its storage-unavailable state.');
  await submission.locator('[name=consent]').check();
  await submission.getByRole('button', { name: 'Send for review' }).click();
  await submission.getByRole('alert').filter({ hasText: 'temporarily unavailable' }).waitFor();
  assert.match(await submission.locator('[name=message]').inputValue(), /local browser fixture/);
  pass('real Node submission fails closed and retains contributor text');
  await context.route('**/api/submissions', (route) => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ message: 'Fixture receipt: saved for review.' }) }));
  await submission.getByRole('button', { name: 'Send for review' }).click();
  await submission.getByRole('status').filter({ hasText: 'Fixture receipt' }).waitFor();
  assert.equal(await submission.locator('[name=message]').inputValue(), '');
  pass('mocked submission acknowledgment clears text only after receipt');
  await context.unroute('**/api/submissions');
  await page.goto(`${base}/newsletter`);
  const form = page.locator('.newsletter-form');
  const input = form.locator('input[type="email"]');
  assert.equal(await form.locator('[name=consent]').isChecked(), false);
  await input.fill('smoke@example.invalid');
  let withoutConsent = 0;
  const observeRequest = (request) => { if (request.method() === 'POST' && request.url().endsWith('/api/newsletter')) withoutConsent++; };
  page.on('request', observeRequest);
  await form.getByRole('button', { name: 'Join waitlist', exact: true }).click();
  assert.equal(await form.evaluate((element) => element.checkValidity()), false);
  assert.equal(withoutConsent, 0);
  page.off('request', observeRequest);
  await form.locator('[name=consent]').check();
  await form.getByRole('button', { name: 'Join waitlist', exact: true }).click();
  await form.getByRole('alert').filter({ hasText: 'temporarily unavailable' }).waitFor();
  assert.equal(await input.inputValue(), 'smoke@example.invalid');
  await auditAccessibility(page, '/newsletter', 375, 'storage-error');
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
  await input.fill('smoke@example.invalid'); await form.getByRole('button', { name: 'Join waitlist', exact: true }).click();
  await form.getByRole('alert').filter({ hasText: 'Unable to save your waitlist request right now.' }).waitFor();
  pass('non-JSON provider failure remains a readable form error');
  await context.unroute('**/api/newsletter');
  let pendingRoute;
  await context.route('**/api/newsletter', (route) => { pendingRoute = route; });
  await form.getByRole('button', { name: 'Join waitlist', exact: true }).click();
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
  console.error(error);
  await writeFile(resolve(outputDir, "failure.txt"), String(error.stack || error));
  throw error;
} finally {
  await writeFile(resolve(outputDir, 'accessibility.json'), JSON.stringify({ sourceSha, scope: 'Automated axe checks; not human or screen-reader certification', results: accessibility }, null, 2));
  await writeFile(resolve(outputDir, 'receipt.json'), JSON.stringify({ sourceSha, sourceDigest, browser: `Chromium via Playwright 1.56.0 (${process.env.BROWSER_EXECUTABLE || 'bundled'})`, checks, errors, consoleMessages, performanceSamples, performanceScope: "Local browser observations, warm and cold caches mixed; not Core Web Vitals or field performance certification", providerPersistenceVerified: false }, null, 2));
  if (browser) await Promise.race([browser.close(), delay(2500)]);
  if (server.exitCode === null) {
    server.kill('SIGTERM'); await Promise.race([exited, delay(2000)]);
    if (server.exitCode === null && server.signalCode === null) server.kill('SIGKILL');
  }
}
console.log(`PASS: ${checks.length} browser checks at ${sourceSha ?? `export SHA-256 ${sourceDigest}`}`);
