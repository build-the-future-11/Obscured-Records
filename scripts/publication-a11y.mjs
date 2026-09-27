import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { sourceIdentity } from './source-identity.mjs';
const requireBrowser = createRequire(resolve(process.env.BROWSER_TOOLS_DIR || '.cache/browser', 'package.json'));
const { chromium } = requireBrowser('playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3107';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Local preview only');
const output = process.env.A11Y_ARTIFACTS_DIR || `verification/publication-a11y-${Date.now()}`;
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const results = [];
async function audit(path, width, state = 'default') {
  await page.addScriptTag({ path: process.env.AXE_SCRIPT || '.cache/a11y/node_modules/axe-core/axe.min.js' });
  const result = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
  results.push({ path, width, state, violations: result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })) });
  console.log(`${result.violations.length ? 'FAIL' : 'PASS'} axe ${width}px ${path} ${state}: ${result.violations.length} violations`);
}
try {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/article/fedex-flight-705', '/archive', '/topic/aviation', '/series/in-the-air', '/author/ryan-gomez', '/newsletter', '/saved', '/about', '/standards', '/corrections', '/privacy', '/submit']) {
      await page.goto(base + path); await page.locator('h1').waitFor(); await audit(path, width);
    }
  }
  await page.goto(base); await page.locator('h1').waitFor();
  await page.locator('.newsletter-form input[type=email]').fill('accessibility@example.invalid');
  await page.locator('.newsletter-form button').click();
  await page.locator('.newsletter-form [role=alert]').waitFor();
  await audit('/', 1440, 'newsletter-error');
  await page.goto(base + '/article/fedex-flight-705'); await page.locator('h1').waitFor();
  await page.locator('.reader-settings summary').click();
  await page.getByLabel('Reading theme', { exact: true }).selectOption('dark');
  await audit('/article/fedex-flight-705', 1440, 'dark');
  await page.getByRole('button', { name: /^Preview source 1:/ }).click();
  await audit('/article/fedex-flight-705', 1440, 'source-dialog');
  await page.keyboard.press('Escape');
  await page.goto(base); await page.locator('h1').waitFor(); await page.keyboard.press('Control+k');
  await page.locator('#palette-query').fill('aviation');
  await page.getByRole('dialog').getByRole('heading', { name: 'Stories', exact: true }).waitFor();
  await audit('/', 1440, 'search-dialog');
} finally {
  writeFileSync(`${output}/accessibility.json`, JSON.stringify({ ...sourceIdentity(), tool: 'axe-core', scope: 'Automated checks only; not WCAG certification or screen-reader review', results }, null, 2));
  await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 2500))]);
}
assert.equal(results.filter((r) => r.violations.length).length, 0, 'Accessibility violations are recorded in the receipt');
