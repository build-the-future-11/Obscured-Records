import fs from 'node:fs';

export function readDraft(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing JSON frontmatter`);
  return { metadata: JSON.parse(match[1]), body: match[2].trim() };
}
export function wordCount(body) { return body.split(/\s+/).filter(Boolean).length; }
export function writeDraft(file, metadata, body) {
  fs.writeFileSync(file, `---\n${JSON.stringify(metadata, null, 2)}\n---\n\n${body.trim()}\n`);
}
export function validateDraft(metadata, body) {
  for (const field of ['slug', 'title', 'dek', 'author', 'createdAt', 'status', 'section', 'description', 'socialPreview', 'readingTime']) {
    if (typeof metadata[field] !== 'string' || !metadata[field].trim()) throw new Error(`Missing ${field}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.slug)) throw new Error('Invalid slug');
  if (!['draft', 'review', 'approved', 'held'].includes(metadata.status)) throw new Error('Draft files cannot directly publish');
  if (!['World', 'Business', 'Technology', 'Science', 'Culture', 'Underreported'].includes(metadata.section)) throw new Error('Unknown section');
  if (!Array.isArray(metadata.tags) || metadata.tags.length < 2) throw new Error('At least two tags required');
  if (!Array.isArray(metadata.sources) || !metadata.sources.length) throw new Error('Source trail required');
  for (const source of metadata.sources) {
    const url = new URL(source.url);
    if (url.protocol !== 'https:' || url.username || url.password || !source.title || !source.supports || !source.status) throw new Error('Unsafe or incomplete source record');
  }
  if (wordCount(body) < 350) throw new Error('Draft must contain at least 350 words of substantive copy');
  if (metadata.readingTime !== `${Math.max(1, Math.ceil(wordCount(body) / 210))} min`) throw new Error('Reading time differs from body');
  if (!metadata.reviewChecklist?.length) throw new Error('Retain specific editorial review work');
  if (metadata.status === 'approved' && (!metadata.approvedBy || !Number.isFinite(Date.parse(metadata.approvedAt)) || !metadata.reviewChecklist.every((check) => metadata.completedChecks?.includes(check)) || metadata.sources.some((s) => s.status !== 'verified'))) throw new Error('Approval needs named reviewer, date and completed source/checklist review');
}
