import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDraft, validateDraft, wordCount } from './editorial-content.mjs';

const requiredGates = [
  'editorial-review', 'media-rights', 'incident-and-intake-operator',
  'retention-and-newsletter-policy', 'provider-restore-exercise',
  'physical-device-and-screen-reader', 'field-performance', 'public-audience-authorization',
];
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
function validDate(value) {
  if (!isText(value) || !/^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?Z)?$/.test(value)
    || !Number.isFinite(Date.parse(value))) return false;
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === value.slice(0, 10);
}
function requireEvidence(root, relative) {
  assert.ok(isText(relative) && !path.isAbsolute(relative), 'Evidence must name a repository-relative file');
  const file = path.resolve(root, relative);
  assert.ok(file.startsWith(`${path.resolve(root)}${path.sep}`), 'Evidence cannot leave the repository');
  assert.ok(fs.existsSync(file), `Missing evidence file: ${relative}`);
  const resolved = fs.realpathSync(file);
  assert.ok(resolved.startsWith(`${fs.realpathSync(root)}${path.sep}`), 'Evidence cannot link outside the repository');
  assert.ok(fs.statSync(file).isFile() && fs.statSync(file).size > 0, `Evidence must be a nonempty file: ${relative}`);
}

export function measureContent(root) {
  const counts = {
    drafts: 0, explicitReportingPlans: 0, otherDrafts: 0, draftWords: 0,
    draftStates: { draft: 0, review: 0, approved: 0, held: 0 },
    readerRecords: 0, readerStates: { draft: 0, review: 0, published: 0, held: 0 },
  };
  const draftSlugs = new Set();
  for (const file of fs.readdirSync(path.join(root, 'content/drafts')).filter((name) => name.endsWith('.md'))) {
    const { metadata, body } = readDraft(path.join(root, 'content/drafts', file));
    validateDraft(metadata, body);
    assert.equal(file, `${metadata.slug}.md`, `Draft filename mismatch: ${file}`);
    assert.ok(!draftSlugs.has(metadata.slug), `Duplicate draft slug: ${metadata.slug}`);
    draftSlugs.add(metadata.slug);
    counts.drafts++;
    counts.draftWords += wordCount(body);
    counts.draftStates[metadata.status]++;
    if (typeof metadata.genre === 'string' && /\breporting plan\b/i.test(metadata.genre)) counts.explicitReportingPlans++;
    else counts.otherDrafts++;
  }
  for (const file of fs.readdirSync(path.join(root, 'content/articles')).filter((name) => name.endsWith('.mdx'))) {
    const text = fs.readFileSync(path.join(root, 'content/articles', file), 'utf8');
    const frontmatter = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(frontmatter, `Missing reader frontmatter: ${file}`);
    const fields = Object.fromEntries(frontmatter[1].split('\n').map((line) => line.match(/^([a-zA-Z]+):\s*(.*?)\s*$/))
      .filter(Boolean).map((match) => [match[1], match[2].replace(/^(["'])(.*)\1$/, '$2')]));
    assert.equal(file, `${fields.slug}.mdx`, `Reader filename mismatch: ${file}`);
    assert.ok(Object.hasOwn(counts.readerStates, fields.status), `Unknown reader status: ${file}`);
    counts.readerRecords++;
    counts.readerStates[fields.status]++;
  }
  return counts;
}

export function checkProjectState(root = process.cwd()) {
  const state = JSON.parse(fs.readFileSync(path.join(root, 'PROJECT_STATE.json'), 'utf8'));
  assert.equal(state.schemaVersion, 1, 'Unsupported project state schema');
  assert.ok(validDate(state.updatedAt), 'Project state requires a valid date');
  assert.equal(state.productKind, 'publication-website', 'This state describes a publication website');
  assert.equal(state.scientificModel?.applicable, false, 'Do not report this publication as a scientific experiment');
  assert.ok(isText(state.scientificModel.reason) && isText(state.evidenceBoundary), 'Evidence scope must remain explicit');
  const measured = measureContent(root);
  assert.deepEqual(state.content, measured, 'PROJECT_STATE content counts have drifted; inspect and update the measured inventory');
  assert.ok(['HOLD', 'READY'].includes(state.release?.publicLaunch), 'Unknown public launch state');
  assert.ok(['owner-private', 'public'].includes(state.release?.audience), 'Unknown audience state');
  requireEvidence(root, state.release.deploymentReceipt);
  assert.equal(state.channels?.newsletter, 'capture-only', 'Newsletter sending needs a separately reviewed implementation and state contract');
  for (const channel of ['emailSending', 'analytics', 'audio', 'sponsorship']) {
    assert.equal(state.channels[channel], 'deferred', `${channel} needs a separately reviewed implementation and state contract`);
  }
  assert.ok(Array.isArray(state.acceptanceGates), 'Acceptance gates must be an array');
  const ids = new Set();
  for (const gate of state.acceptanceGates) {
    assert.ok(isText(gate?.id) && !ids.has(gate.id), 'Acceptance gates require unique ids');
    ids.add(gate.id);
    assert.ok(isText(gate.requiredEvidence), `${gate.id}: required evidence must be explicit`);
    assert.ok(['OPEN', 'CLOSED'].includes(gate.status), `${gate.id}: invalid gate status`);
    requireEvidence(root, gate.workPlan);
    if (gate.status === 'OPEN') assert.equal(gate.acceptance, null, `${gate.id}: open gate cannot claim acceptance`);
    else {
      assert.ok(isText(gate.acceptance?.by) && validDate(gate.acceptance?.at), `${gate.id}: closure needs named, dated acceptance`);
      assert.ok(Array.isArray(gate.acceptance.evidencePaths) && gate.acceptance.evidencePaths.length > 0, `${gate.id}: closure needs evidence files`);
      for (const file of gate.acceptance.evidencePaths) requireEvidence(root, file);
    }
  }
  for (const id of requiredGates) assert.ok(ids.has(id), `Required acceptance gate missing: ${id}`);
  const openGates = state.acceptanceGates.filter((gate) => gate.status === 'OPEN').map((gate) => gate.id);
  if (openGates.length > 0) assert.equal(state.release.publicLaunch, 'HOLD', 'Public launch must remain HOLD while acceptance gates are open');
  if (state.release.audience === 'public') assert.equal(state.release.publicLaunch, 'READY', 'A public audience requires completed launch acceptance');
  return { status: 'PASS', publicLaunch: state.release.publicLaunch, audience: state.release.audience, content: measured, openGates,
    boundary: 'Structural state consistency only; does not certify human acceptance, reporting quality or current hosting access.' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(checkProjectState(), null, 2)); }
  catch (error) { console.error(`project-state: ${error.message}`); process.exitCode = 1; }
}
