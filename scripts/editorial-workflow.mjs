import fs from 'node:fs';
import { readDraft, writeDraft, validateDraft, wordCount } from './editorial-content.mjs';

const [command = 'list', slug, destination] = process.argv.slice(2);
const directory = 'content/drafts';
if (command === 'list' || command === 'check') {
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.md')).sort()) {
    const { metadata, body } = readDraft(`${directory}/${file}`);
    validateDraft(metadata, body);
    console.log(`${metadata.status.padEnd(9)} ${String(wordCount(body)).padStart(4)} words  ${metadata.slug}`);
  }
} else if (command === 'transition') {
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Use a canonical draft slug');
  const file = `${directory}/${slug}.md`;
  const { metadata, body } = readDraft(file);
  const allowed = { draft: ['review', 'held'], review: ['draft', 'approved', 'held'], held: ['draft'], approved: ['review', 'held'] };
  if (!allowed[metadata.status]?.includes(destination)) throw new Error(`Unsupported transition ${metadata.status} -> ${destination}. Publication requires reviewed registry integration.`);
  const updated = { ...metadata, status: destination, history: [...(metadata.history || []), { from: metadata.status, to: destination, at: new Date().toISOString() }] };
  validateDraft(updated, body);
  writeDraft(file, updated, body);
  console.log(`${slug}: ${metadata.status} -> ${destination}`);
} else throw new Error('Use list, check, or transition <slug> <draft|review|approved|held>');
