import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import fs from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { sourceIdentity } from './source-identity.mjs';
import { getPublicArticles, sections } from '../lib/articles.ts';

const identity = sourceIdentity();
const evidenceDirectory = process.env.VERIFICATION_DIR || `verification/workers-intake-${Date.now()}`;
fs.mkdirSync(evidenceDirectory, { recursive: true });
const state = `.wrangler/intake-smoke-${Date.now()}`;
const environment = { ...process.env, WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_CF_FETCH_ENABLED: 'false', WRANGLER_LOG_PATH: '.wrangler/logs' };
const command = ['--import', './scripts/sites-env.mjs', 'node_modules/wrangler/bin/wrangler.js'];
for (const file of fs.readdirSync('drizzle').filter((name) => name.endsWith('.sql')).sort()) {
  const applied = spawnSync(process.execPath, [...command, 'd1', 'execute', 'DB', '--config', 'dist/server/wrangler.json', '--local', '--persist-to', state, '--file', `drizzle/${file}`, '--json'], { encoding: 'utf8', env: environment });
  assert.equal(applied.status, 0, `Local migration ${file}: ${applied.stderr || applied.stdout}`);
}
const probe = createServer(); await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(0, '127.0.0.1', resolve); });
const { port } = probe.address(); await new Promise((resolve) => probe.close(resolve));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [...command, 'dev', '--config', 'dist/server/wrangler.json', '--local', '--persist-to', state, '--ip', '127.0.0.1', '--port', String(port), '--inspector-port', '0'], { env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
let output = ''; server.stdout.on('data', (chunk) => { output = (output + chunk).slice(-10000); }); server.stderr.on('data', (chunk) => { output = (output + chunk).slice(-10000); });
const exited = new Promise((resolve) => server.once('exit', resolve));
const checks = [];
async function send(path, body, expected) {
  const response = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
  const data = await response.json(); assert.equal(response.status, expected, JSON.stringify(data));
  checks.push(`${path}: ${expected}`); return data;
}
function query(sql) {
  const result = spawnSync(process.execPath, [...command, 'd1', 'execute', 'DB', '--config', 'dist/server/wrangler.json', '--local', '--persist-to', state, '--command', sql, '--json'], { env: environment, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout)[0].results;
}
try {
  let ready = false;
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null) throw new Error('Local Workers process exited.');
    try { const response = await fetch(base + '/api/revision', { signal: AbortSignal.timeout(500) }); await response.text(); ready = true; break; } catch { await delay(250); }
  }
  assert.ok(ready, 'Local Workers server did not become ready.');
  for (const path of [...sections.map((section) => `/${section.toLowerCase()}`), ...getPublicArticles().map((article) => `/article/${article.slug}`)]) {
    const response = await fetch(base + path, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, `Workers reader route ${path}`);
    await response.text(); checks.push(`Reader route ${path}: 200`);
  }
  const newsletter = { email: 'newsletter-smoke@example.invalid', website: '', consent: true };
  for (let i = 0; i < 3; i++) await send('/api/newsletter', newsletter, 200);
  await send('/api/newsletter', newsletter, 429);
  const submission = { email: 'writer-smoke@example.invalid', kind: 'Source', title: 'Local integration test only', message: 'This is a retained local test submission that checks database persistence without contacting a live service.', sourceUrl: 'https://example.invalid/source', consent: true, website: '' };
  const saved = await send('/api/submissions', submission, 201); assert.match(saved.message, /Reference: [a-f0-9-]{36}/);
  await send('/api/submissions', { ...submission, website: 'trap' }, 200);
  assert.equal((await fetch(base + '/api/submissions')).status, 405);
  const subscribers = query("SELECT status FROM newsletter_subscribers WHERE email = 'newsletter-smoke@example.invalid'");
  assert.deepEqual(subscribers, [{ status: 'pending_confirmation' }]);
  const records = query('SELECT id, status FROM editorial_submissions'); assert.equal(records.length, 1); assert.equal(records[0].status, 'received');
  query(`UPDATE editorial_submissions SET status = 'triage' WHERE id = '${records[0].id}' AND status = 'received'`);
  assert.equal(query('SELECT status FROM editorial_submissions')[0].status, 'triage');
  checks.push('Local D1: pending signup, one private submission, triage update, no public read endpoint');
  fs.writeFileSync(`${evidenceDirectory}/workers-intake.json`, JSON.stringify({ ...identity, state, checks, externalPersistenceVerified: false }, null, 2), { flag: 'wx' });
  console.log(`PASS ${checks.length} Workers/D1 integration checks; isolated local data retained in ${state}`);
} catch (error) { console.error(output); throw error; }
finally {
  if (server.exitCode === null) { server.kill('SIGTERM'); await Promise.race([exited, delay(2000)]); if (server.exitCode === null && server.signalCode === null) server.kill('SIGKILL'); }
}
