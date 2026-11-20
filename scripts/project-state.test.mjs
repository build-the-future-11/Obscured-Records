import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { checkProjectState, measureContent } from './check-project-state.mjs';
import { readDraft, writeDraft } from './editorial-content.mjs';

// Synthetic acceptance records in temporary directories never approve the site.
const body = Array.from({ length: 360 }, (_, index) => `fixture${index}`).join(' ');
function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'obscured-project-state-'));
  try {
    fs.mkdirSync(path.join(root, 'content/drafts'), { recursive: true });
    fs.mkdirSync(path.join(root, 'content/articles'), { recursive: true });
    const metadata = {
      slug: 'plan-fixture', title: 'Synthetic fixture', dek: 'Fixture only', author: 'Test fixture',
      createdAt: '2026-10-01', status: 'draft', section: 'Technology', description: 'Fixture only',
      socialPreview: 'Fixture only', readingTime: '2 min', tags: ['fixture', 'test'],
      sources: [{ title: 'Fixture source', url: 'https://example.invalid/source', supports: 'Test only', status: 'located' }],
      genre: 'Reporting plan, not original reporting', reviewChecklist: ['Read source'], completedChecks: [],
      approvedBy: null, approvedAt: null, history: [],
    };
    writeDraft(path.join(root, 'content/drafts/plan-fixture.md'), metadata, body);
    writeDraft(path.join(root, 'content/drafts/other-fixture.md'), { ...metadata, slug: 'other-fixture', genre: 'Archival analysis' }, body);
    fs.writeFileSync(path.join(root, 'content/articles/reader-fixture.mdx'), '---\nslug: "reader-fixture"\nstatus: "published"\n---\nSynthetic reader record.\n');
    fs.writeFileSync(path.join(root, 'plan.md'), 'Synthetic work plan.');
    fs.writeFileSync(path.join(root, 'receipt.md'), 'Synthetic evidence only.');
    const state = JSON.parse(fs.readFileSync(new URL('../PROJECT_STATE.json', import.meta.url), 'utf8'));
    state.content = measureContent(root);
    state.release = { publicLaunch: 'HOLD', audience: 'owner-private', deploymentReceipt: 'receipt.md' };
    state.acceptanceGates = state.acceptanceGates.map((gate) => ({ ...gate, status: 'OPEN', workPlan: 'plan.md', acceptance: null }));
    const save = () => fs.writeFileSync(path.join(root, 'PROJECT_STATE.json'), JSON.stringify(state));
    save();
    run({ root, state, save });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('state measurement separates reporting plans, other drafts and reader registry states', () => fixture(({ root }) => {
  const result = checkProjectState(root);
  assert.equal(result.status, 'PASS');
  assert.equal(result.content.explicitReportingPlans, 1);
  assert.equal(result.content.otherDrafts, 1);
  assert.equal(result.content.draftStates.approved, 0);
  assert.equal(result.content.readerStates.published, 1);
  assert.equal(result.publicLaunch, 'HOLD');
  assert.match(result.boundary, /does not certify/);
}));
test('a content addition or genre reclassification invalidates stale inventory counts', () => fixture(({ root }) => {
  const source = path.join(root, 'content/drafts/plan-fixture.md');
  const { metadata } = readDraft(source);
  const extra = path.join(root, 'content/drafts/added-fixture.md');
  writeDraft(extra, { ...metadata, slug: 'added-fixture' }, body);
  assert.throws(() => checkProjectState(root), /counts have drifted/);
  fs.unlinkSync(extra);
  writeDraft(source, { ...metadata, genre: 'Archival analysis' }, body);
  assert.throws(() => checkProjectState(root), /counts have drifted/);
}));
test('launch or audience cannot be represented as public while gates remain open', () => fixture(({ root, state, save }) => {
  state.release.publicLaunch = 'READY';
  save();
  assert.throws(() => checkProjectState(root), /must remain HOLD/);
  state.release.publicLaunch = 'HOLD';
  state.release.audience = 'public';
  save();
  assert.throws(() => checkProjectState(root), /completed launch acceptance/);
}));
test('an acceptance gate cannot disappear or close without named evidence', () => fixture(({ root, state, save }) => {
  const gate = state.acceptanceGates.pop();
  save();
  assert.throws(() => checkProjectState(root), /Required acceptance gate missing/);
  state.acceptanceGates.push(gate);
  gate.status = 'CLOSED';
  save();
  assert.throws(() => checkProjectState(root), /named, dated acceptance/);
  gate.acceptance = { by: 'Synthetic test reviewer', at: '2026-10-16', evidencePaths: [] };
  save();
  assert.throws(() => checkProjectState(root), /closure needs evidence files/);
}));
test('evidence references must resolve to nonempty files inside the repository', () => fixture(({ root, state, save }) => {
  for (const receipt of ['missing.md', '../outside.md', '/tmp/outside.md']) {
    state.release.deploymentReceipt = receipt;
    save();
    assert.throws(() => checkProjectState(root), /evidence|Evidence/);
  }
  fs.writeFileSync(path.join(root, 'empty.md'), '');
  state.release.deploymentReceipt = 'empty.md';
  save();
  assert.throws(() => checkProjectState(root), /nonempty file/);
}));
test('complete synthetic acceptance can satisfy the structural READY contract', () => fixture(({ root, state, save }) => {
  for (const gate of state.acceptanceGates) {
    gate.status = 'CLOSED';
    gate.acceptance = { by: 'Synthetic test reviewer', at: '2026-10-16', evidencePaths: ['receipt.md'] };
  }
  state.release.publicLaunch = 'READY';
  state.release.audience = 'public';
  save();
  assert.deepEqual(checkProjectState(root).openGates, []);
}));
