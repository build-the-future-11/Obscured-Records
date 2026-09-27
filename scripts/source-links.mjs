import fs from 'node:fs';
import path from 'node:path';
import { classifySourceResponse } from './source-link-policy.mjs';
import { getPublicArticles } from '../lib/articles.ts';
import { features } from '../lib/features.ts';
import { readDraft } from './editorial-content.mjs';
const sources = [...getPublicArticles().map((a) => a.sourceUrl), ...Object.values(features).flatMap((f) => f.sources.map((s) => s.url)), ...fs.readdirSync('content/drafts').flatMap((file) => readDraft(`content/drafts/${file}`).metadata.sources.map((s) => s.url))];
const queue = [...new Set(sources)];
const results = [];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'ObscuredRecords-EditorialLinkCheck/1.0' } });
      await response.body?.cancel();
      results.push({ url, finalUrl: response.url, status: response.status, state: classifySourceResponse(url, response.url, response.status) });
    } catch (error) { results.push({ url, state: 'access-unverified', error: error.cause?.code || error.name }); }
  }
}
await Promise.all([worker(), worker(), worker()]);
results.sort((a, b) => a.url.localeCompare(b.url));
const output = process.argv[2] || `verification/source-links-${Date.now()}.json`;
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ checkedAt: new Date().toISOString(), scope: 'URL reachability only; changed document redirects and non-200 responses require review; not factual or licensing certification', results }, null, 2), { flag: 'wx' });
console.log(JSON.stringify(results.reduce((counts, item) => ({ ...counts, [item.state]: (counts[item.state] || 0) + 1 }), {})));
