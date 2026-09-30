import fs from 'node:fs';

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
function isTextList(value) {
  return Array.isArray(value) && value.length > 0 && Array.from(value).every(isText);
}

export function readDraft(file) {
  // Editors on Windows may add CRLF line endings or a UTF-8 BOM.
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing JSON frontmatter`);
  return { metadata: JSON.parse(match[1]), body: match[2].trim() };
}
export function wordCount(body) { return body.split(/\s+/).filter(Boolean).length; }
export function writeDraft(file, metadata, body) {
  fs.writeFileSync(file, `---\n${JSON.stringify(metadata, null, 2)}\n---\n\n${body.trim()}\n`);
}
export function validateDraft(metadata, body) {
  if (!isRecord(metadata)) throw new Error('Metadata must be an object');
  if (typeof body !== 'string') throw new Error('Draft body must be text');
  for (const field of ['slug', 'title', 'dek', 'author', 'createdAt', 'status', 'section', 'description', 'socialPreview', 'readingTime']) {
    if (!isText(metadata[field])) throw new Error(`Missing ${field}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.slug)) throw new Error('Invalid slug');
  if (!['draft', 'review', 'approved', 'held'].includes(metadata.status)) throw new Error('Draft files cannot directly publish');
  if (!['World', 'Business', 'Technology', 'Science', 'Culture', 'Underreported'].includes(metadata.section)) throw new Error('Unknown section');
  if (!isTextList(metadata.tags) || metadata.tags.length < 2) throw new Error('At least two nonempty text tags required');
  if (!Array.isArray(metadata.sources) || !metadata.sources.length) throw new Error('Source trail required');
  for (const source of metadata.sources) {
    if (!isRecord(source) || !['url', 'title', 'supports', 'status'].every((field) => isText(source[field]))) {
      throw new Error('Unsafe or incomplete source record');
    }
    let url;
    try { url = new URL(source.url); }
    catch { throw new Error('Unsafe or incomplete source record'); }
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Unsafe or incomplete source record');
  }
  const words = wordCount(body);
  if (words < 350) throw new Error('Draft must contain at least 350 words of substantive copy');
  if (metadata.readingTime !== `${Math.max(1, Math.ceil(words / 210))} min`) throw new Error('Reading time differs from body');
  if (!isTextList(metadata.reviewChecklist)) throw new Error('Retain specific editorial review work as nonempty text entries');
  if (metadata.status === 'approved') {
    // A string also has .includes(): require arrays before checking completion.
    // Structural validation does not itself establish real human approval.
    const validApproval = isText(metadata.approvedBy)
      && isText(metadata.approvedAt)
      && Number.isFinite(Date.parse(metadata.approvedAt))
      && isTextList(metadata.completedChecks)
      && metadata.reviewChecklist.every((check) => metadata.completedChecks.includes(check))
      && metadata.sources.every((source) => source.status === 'verified');
    if (!validApproval) throw new Error('Approval needs named reviewer, date and completed source/checklist review');
  }
}
