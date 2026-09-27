import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export function sourceIdentity() {
  let revision = null;
  try { revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* exported checkout */ }
  const hash = createHash('sha256');
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile()) { hash.update(file); hash.update(readFileSync(file)); }
    }
  }
  for (const directory of ['app', 'components', 'lib', 'content', 'db', 'drizzle', 'public', 'scripts']) walk(directory);
  for (const file of ['package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'next.config.ts']) hash.update(readFileSync(file));
  return { revision, sourceDigest: hash.digest('hex'), basis: 'source tree SHA-256; Git revision when available' };
}
