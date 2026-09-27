import fs from 'node:fs';
import { editorialInbox } from './editorial-inbox.mjs';
import { readDraft, writeDraft, validateDraft, wordCount } from './editorial-content.mjs';

const [command = 'list', slug, destination] = process.argv.slice(2);
const directory = 'content/drafts';
if (command === 'inbox' || command === 'inspect') {
  const rows = editorialInbox(directory);
  if (command === 'inspect') {
    const row = rows.find((item) => item.slug === slug);
    if (!row) throw new Error('Unknown draft slug');
    console.log(JSON.stringify(row, null, 2));
  } else {
    console.log('PRIVATE EDITORIAL INBOX — read-only; no publication transitions');
    for (const state of ['draft', 'review', 'held', 'approved']) {
      const group = rows.filter((row) => row.state === state);
      console.log(`\n${state.toUpperCase()} (${group.length})`);
      for (const row of group) console.log(`${row.headline}\n  ${row.slug} | ${row.section} | ${row.author}\n  Sources verified: ${row.sourceReview.verified}/${row.sourceReview.total} | Checks remaining: ${row.remainingChecks.length} | Reviewer: ${row.reviewer || 'unassigned'} | Last transition: ${row.lastTransition || 'none recorded'}`);
    }
  }
} else if (command === 'list' || command === 'check') {
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
} else throw new Error('Use inbox, inspect <slug>, list, check, or transition <slug> <draft|review|approved|held>');
