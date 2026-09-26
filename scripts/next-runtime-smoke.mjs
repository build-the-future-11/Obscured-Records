import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

// Start only a local, owned Next.js process. Never target a live deployment.
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
assert.match(sourceSha, /^[0-9a-f]{40}$/);
const probe = createServer();
await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(0, '127.0.0.1', resolve); });
const { port } = probe.address();
await new Promise((resolve) => probe.close(resolve));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  env: { ...process.env, NODE_ENV: 'production', VERCEL: '1', VERCEL_GIT_COMMIT_SHA: sourceSha },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
server.stdout.on('data', (chunk) => { output = (output + chunk).slice(-16000); });
server.stderr.on('data', (chunk) => { output = (output + chunk).slice(-16000); });
const exited = new Promise((resolve) => server.once('exit', resolve));
let launchError;
server.on('error', (error) => { launchError = error; });
let checks = 0;

async function check(path, status = 200, options = {}) {
  const response = await fetch(`${base}${path}`, { ...options, redirect: 'manual', signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, status, `${path}: expected ${status}, got ${response.status}`);
  const text = await response.text();
  assert.doesNotMatch(text, /Application error: a server-side exception/i, `${path}: server error shell`);
  checks++;
  console.log(`PASS ${options.method ?? 'GET'} ${path}: ${status}`);
  return { response, text };
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (launchError) throw launchError;
    if (server.exitCode !== null) throw new Error(`Next.js exited early (${server.exitCode}).`);
    try {
      const response = await fetch(`${base}/api/revision`, { signal: AbortSignal.timeout(1000) });
      await response.text();
      ready = true; break;
    } catch { await delay(250); }
  }
  assert.ok(ready, 'Next.js did not start within the startup deadline.');
  const { text: home } = await check('/');
  assert.match(home, /Obscured Records/);
  for (const path of ['/latest', '/search', '/search?q=aviation', '/search?q=aviation&q=mercury', '/about', '/standards', '/corrections', '/privacy', '/submit', '/newsletter', '/rss.xml', '/sitemap.xml', '/robots.txt']) {
    await check(path);
  }
  const article = home.match(/href="(\/article\/[^"?#]+)"/);
  assert.ok(article, 'Homepage must link to a real archive article.');
  const { text: story } = await check(article[1]);
  assert.match(story, /<h1(?:\s|>)/);
  await check('/article/__nonexistent_smoke_record__', 404);
  await check('/__nonexistent_smoke_section__', 404);

  const assets = [...new Set([...home.matchAll(/(?:src|href)="(\/_next\/static\/[^"<>]+)"/g)].map((match) => match[1]))];
  assert.ok(assets.some((asset) => /\.js(?:\?|$)/.test(asset)), 'Missing JavaScript assets.');
  assert.ok(assets.some((asset) => /\.css(?:\?|$)/.test(asset)), 'Missing stylesheet assets.');
  for (const asset of assets) {
    const { response } = await check(asset);
    assert.doesNotMatch(response.headers.get('content-type') ?? '', /text\/html/, 'An asset returned an HTML fallback.');
  }

  const { text: revision } = await check('/api/revision');
  assert.equal(JSON.parse(revision).revision, sourceSha, 'Runtime revision must match this checkout.');
  for (const [body, status, type] of [['null', 400, 'application/json'], ['{', 400, 'application/json'], ['{}', 415, 'text/plain'], [' '.repeat(4097), 413, 'application/json'], ['{"email":"smoke@example.invalid","website":""}', 503, 'application/json']]) {
    // Next.js has no Workers D1 binding. This test must not persist a signup.
    const { response } = await check('/api/newsletter', status, { method: 'POST', headers: { 'content-type': type }, body });
    assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  }
  console.log(`PASS: ${checks} built Next.js runtime checks at ${sourceSha}`);
} catch (error) {
  console.error(output);
  throw error;
} finally {
  if (server.exitCode === null) {
    server.kill('SIGTERM');
    await Promise.race([exited, delay(2000)]);
    if (server.exitCode === null && server.signalCode === null) server.kill('SIGKILL');
  }
}
