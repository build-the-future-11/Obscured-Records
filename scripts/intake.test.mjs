import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { createSubmissionHandler } from '../lib/submission-handler.ts';
import { createSubmissionStore } from '../lib/submission-store.ts';
import { enforceIntakeLimit, IntakeRateLimit } from '../lib/intake-policy.ts';
import { createNewsletterHandler } from '../lib/newsletter-handler.ts';
import { createNewsletterStore } from '../lib/newsletter-store.ts';

const valid = { email: 'writer@example.invalid', kind: 'Source', title: 'A documented source lead', message: 'This is a clearly labeled test submission explaining why a source requires further editorial review.', sourceUrl: 'https://example.invalid/document', consent: true, website: '' };
const request = (body, headers = {}) => new Request('https://publication.example/api/submissions', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
for (const [name, changes] of [['email', { email: 'bad' }], ['type', { kind: 'Spam' }], ['short title', { title: 'x' }], ['short message', { message: 'x' }], ['long message', { message: 'x'.repeat(6001) }], ['consent', { consent: false }], ['source scheme', { sourceUrl: 'javascript:alert(1)' }], ['credentials', { sourceUrl: 'https://user:pass@example.invalid' }]]) {
  test(`submissions reject ${name} without persistence`, async () => {
    let writes = 0; const response = await createSubmissionHandler(async () => { writes++; return 'id'; })(request({ ...valid, ...changes }));
    assert.equal(response.status, 400); assert.equal(writes, 0);
  });
}
test('submissions reject oversized bodies, cross-origin requests and traps without storage', async () => {
  let writes = 0; const handler = createSubmissionHandler(async () => { writes++; return 'id'; });
  assert.equal((await handler(request({ ...valid, padding: 'x'.repeat(17000) }))).status, 413);
  assert.equal((await handler(request(valid, { origin: 'https://attacker.invalid' }))).status, 403);
  assert.equal((await handler(request({ ...valid, website: 'spam' }))).status, 200);
  assert.equal(writes, 0);
});
test('submission receipt follows successful storage; outage keeps private details out', async () => {
  let release; let settled = false;
  const handler = createSubmissionHandler(() => new Promise((resolve) => { release = resolve; }));
  const pending = handler(request(valid)).then((r) => { settled = true; return r; });
  await new Promise((resolve) => setImmediate(resolve)); assert.equal(settled, false);
  release('test-receipt'); assert.equal((await pending).status, 201);
  const failure = await createSubmissionHandler(async () => { throw new Error('secret@example.invalid'); })(request(valid));
  assert.equal(failure.status, 503); assert.doesNotMatch(await failure.text(), /secret@example/);
});
for (const channel of ['submission', 'newsletter']) {
  test(`${channel} propagates throttling with retry guidance`, async () => {
    const save = async () => { throw new IntakeRateLimit(); };
    const response = await (channel === 'submission' ? createSubmissionHandler(save) : createNewsletterHandler(save))(request(valid));
    assert.equal(response.status, 429); assert.equal(response.headers.get('retry-after'), '3600');
  });
}
function database() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('drizzle').filter((name) => name.endsWith('.sql')).sort()) sqlite.exec(readFileSync(`drizzle/${file}`, 'utf8'));
  const adapter = { prepare(sql) { return { bind(...values) { return { async run() { const result = sqlite.prepare(sql).run(...values); return { success: true, meta: { changes: Number(result.changes) } }; } }; } }; } };
  return { sqlite, adapter };
}
test('repeat newsletter capture never clears an unsubscribe or suppression', async () => {
  const { sqlite, adapter } = database();
  try {
    const save = createNewsletterStore(async () => adapter);
    await save('new@example.invalid');
    assert.equal(sqlite.prepare('SELECT status FROM newsletter_subscribers WHERE email = ?').get('new@example.invalid').status, 'pending_confirmation');
    for (const status of ['active', 'unsubscribed', 'suppressed', 'bounced', 'complained']) {
      const email = `${status}@example.invalid`;
      sqlite.prepare('INSERT INTO newsletter_subscribers (email, status, consented_at, source) VALUES (?, ?, ?, ?)').run(email, status, '2026-09-01', 'test');
      await save(email);
      assert.equal(sqlite.prepare('SELECT status FROM newsletter_subscribers WHERE email = ?').get(email).status, status);
    }
  } finally { sqlite.close(); }
});
test('real SQLite migrations and rate-limit SQL enforce expiry, channel isolation and global cap', async () => {
  const { sqlite, adapter } = database();
  try {
    for (let i = 0; i < 3; i++) await enforceIntakeLimit(adapter, valid.email, 'submission', 1000);
    await assert.rejects(enforceIntakeLimit(adapter, valid.email, 'submission', 1001), IntakeRateLimit);
    await enforceIntakeLimit(adapter, valid.email, 'newsletter', 1001);
    await enforceIntakeLimit(adapter, valid.email, 'submission', 3601000);
    assert.ok(sqlite.prepare('SELECT bucket FROM intake_limits').all().every((row) => !row.bucket.includes('@')));
    for (let i = 0; i < 59; i++) await enforceIntakeLimit(adapter, `other${i}@example.invalid`, 'submission', 3601000);
    await assert.rejects(enforceIntakeLimit(adapter, 'last@example.invalid', 'submission', 3601000), IntakeRateLimit);
  } finally { sqlite.close(); }
});
test('actual submission SQL stores privately as received and cannot be injected through text', async () => {
  const { sqlite, adapter } = database();
  try {
    const store = createSubmissionStore(async () => adapter);
    const title = "A title'); DROP TABLE editorial_submissions; --";
    const id = await store({ ...valid, title });
    const saved = sqlite.prepare('SELECT * FROM editorial_submissions WHERE id = ?').get(id);
    assert.equal(saved.title, title); assert.equal(saved.status, 'received'); assert.equal(saved.email, valid.email);
    assert.match(id, /^[a-f0-9-]{36}$/);
  } finally { sqlite.close(); }
});
