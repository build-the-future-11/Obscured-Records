import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { getPublicArticles } from '../lib/articles.ts';
import { features } from '../lib/features.ts';
import { corrections } from '../lib/corrections.ts';

const asOf = Date.parse('2026-10-16T23:59:59Z');
const articles = getPublicArticles(asOf);
const reviewed = JSON.parse(fs.readFileSync('docs/EDITORIAL_REVIEW_2026-10-16.json', 'utf8'));
const revisedSlugs = ['wirecard-missing-billions','goiania-blue-powder','therac-25','iraq-poison-grain','yodogo-hijacking'];

test('every reader record has a specific audit and its companion contains the authoritative brief', () => {
  assert.deepEqual(Object.keys(reviewed.readerReviews).sort(), articles.map(article => article.slug).sort());
  for (const article of articles) {
    const companion = fs.readFileSync(`content/articles/${article.slug}.mdx`, 'utf8');
    for (const key of ['title','subtitle','slug','source','sourceUrl','status']) {
      assert.ok(companion.includes(`${key}: ${JSON.stringify(article[key])}`), `${article.slug}: ${key}`);
    }
    for (const key of ['opening','context','significance']) assert.ok(companion.includes(article[key]), `${article.slug}: ${key}`);
    assert.ok(reviewed.readerReviews[article.slug][2].length > 80, article.slug);
  }
});

test('local revisions preserve original URLs, bylines and publication state while disclosing changes', () => {
  for (const slug of revisedSlugs) {
    const article = articles.find(item => item.slug === slug);
    assert.ok(article, slug);
    assert.equal(article.status, 'published');
    assert.equal(article.date, '14 Sep 2026');
    assert.equal(article.author, 'Ryan Gomez');
    assert.equal(article.updated, '16 Oct 2026');
    if (features[slug]) assert.equal(features[slug].updated, article.updated);
    const companion = fs.readFileSync(`content/articles/${slug}.mdx`, 'utf8');
    assert.match(companion, /date: "2026-09-14"/);
    assert.match(companion, /updated: "2026-10-16"/);
    assert.ok(corrections.some(note => note.slug === slug && note.date === article.updated));
  }
});

test('claim ledger identifies exact current renderer passages and retains source-review limits', () => {
  const ledger = JSON.parse(fs.readFileSync('docs/EDITORIAL_CLAIM_LEDGER_2026-10-16.json', 'utf8'));
  assert.ok(ledger.claims.length >= 26);
  assert.equal(new Set(ledger.claims.map(claim => claim.id)).size, ledger.claims.length);
  for (const claim of ledger.claims) {
    let value = claim.file === 'lib/articles.ts' ? articles.find(article => article.slug === claim.slug) : features[claim.slug];
    for (const part of claim.passagePath.split('.')) value = value[part];
    assert.equal(claim.passage, value, claim.id);
    assert.equal(claim.accessDate, '2026-10-16');
    assert.ok(claim.uncertainty && claim.editorialFollowup);
    for (const sourceId of claim.sourceIds) assert.ok(ledger.sources[sourceId]?.inspected, sourceId);
  }
  assert.match(ledger.sources.iraq.inspected, /Abstract.*only/);
  assert.match(ledger.status, /NEEDS EDITOR REVIEW/);
});

test('regeneration preserves an edited manuscript and reader source bytes and is deterministic', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'obscured-editorial-revision-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const directory of ['content/drafts','content/articles','lib']) fs.mkdirSync(path.join(root, directory), { recursive: true });
  const draftPath = 'content/drafts/iraq-poison-grain.md';
  const edited = fs.readFileSync(draftPath, 'utf8') + '\nEditor working note: preserve this local revision during regeneration.\n';
  fs.writeFileSync(path.join(root, draftPath), edited);
  const preserved = [draftPath, 'content/articles/iraq-poison-grain.mdx', 'lib/articles.ts', 'lib/features.ts'];
  for (const file of preserved.slice(1)) fs.copyFileSync(file, path.join(root, file));
  const before = new Map(preserved.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
  const run = () => spawnSync(process.execPath, ['--max-old-space-size=96', path.resolve('scripts/generate-editorial-drafts.mjs')], { cwd: root, encoding: 'utf8', timeout: 30_000 });
  const first = run(); assert.equal(first.status, 0, first.stderr);
  const projection = fs.readFileSync(path.join(root, 'lib/editorial-draft-data.generated/0.ts'), 'utf8');
  assert.match(projection, /preserve this local revision during regeneration/);
  assert.match(projection, /"status":"review"/);
  assert.match(projection, /"approvedBy":null/);
  const outputs = ['lib/editorial-drafts.generated.ts','lib/editorial-draft-loader.generated.ts', ...Array.from({ length: 64 }, (_, index) => `lib/editorial-draft-data.generated/${index}.ts`)];
  const generated = new Map(outputs.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
  const second = run(); assert.equal(second.status, 0, second.stderr);
  for (const [file, content] of before) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), content, file);
  for (const [file, content] of generated) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), content, file);
});
