import { createHash } from 'node:crypto';

// readDraft strips outer whitespace and normalizes editor line endings. Hash
// that same textual body; do not hash a generated projection or change the
// frozen Page snapshot to make a local edit appear to be an exact import.
export function reviewBodyHash(body) {
  return createHash('sha256').update(body.replace(/\r\n/g, '\n').trim()).digest('hex');
}

export function validateLocalReviewRevisions(snapshots, revisions) {
  if (!Array.isArray(revisions)) throw new Error('Local review revisions must be an explicit array');
  const originals = new Map(snapshots.map(row => [row.slug, row]));
  const bySlug = new Map();
  for (const revision of revisions) {
    const original = originals.get(revision.slug);
    if (!original || bySlug.has(revision.slug)) throw new Error(`Unknown or duplicate local revision: ${revision.slug}`);
    for (const key of ['sourceBodySha256', 'revisedBodySha256']) {
      if (!/^[a-f0-9]{64}$/.test(revision[key] ?? '')) throw new Error(`Invalid ${key}: ${revision.slug}`);
    }
    if (reviewBodyHash(original.body) !== revision.sourceBodySha256) throw new Error(`Frozen source hash mismatch: ${revision.slug}`);
    if (revision.sourceBodySha256 === revision.revisedBodySha256) throw new Error(`Local revision has no body change: ${revision.slug}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(revision.recordedAt ?? '') || !Number.isFinite(Date.parse(`${revision.recordedAt}T00:00:00Z`)) || new Date(`${revision.recordedAt}T00:00:00Z`).toISOString().slice(0, 10) !== revision.recordedAt) throw new Error(`Invalid revision date: ${revision.slug}`);
    for (const key of ['reason', 'reviewKind', 'evidence']) {
      if (typeof revision[key] !== 'string' || !revision[key].trim()) throw new Error(`Missing ${key}: ${revision.slug}`);
    }
    bySlug.set(revision.slug, revision);
  }
  return bySlug;
}

export function assertReviewBodyMatchesRecord(snapshot, body, revision) {
  if (!revision) {
    if (body !== snapshot.body.trim()) throw new Error(`Unrecorded local manuscript change: ${snapshot.slug}`);
    return;
  }
  if (revision.slug !== snapshot.slug || revision.sourceBodySha256 !== reviewBodyHash(snapshot.body) || revision.revisedBodySha256 !== reviewBodyHash(body)) {
    throw new Error(`Local revision hash mismatch: ${snapshot.slug}`);
  }
}
