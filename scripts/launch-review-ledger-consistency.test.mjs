import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  articleSourceIdentities,
  launchReviewLedgerIssues,
  validateLaunchReviewLedger,
} from './launch-review-ledger-consistency.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articlesDirectory = path.join(root, 'content/articles');
const ledgerPath = path.join(root, 'docs/LAUNCH_EDITORIAL_REVIEW_2026-09-27.md');

test('all 28 launch-review rows match canonical article IDs, slugs and source URLs', () => {
  assert.deepEqual(validateLaunchReviewLedger({ articlesDirectory, ledgerPath }), {
    articleCount: 28,
    sectionCount: 28,
  });
});

test('the regression rejects the reproduced FedEx and Minamata stale-source states', () => {
  const articles = articleSourceIdentities(articlesDirectory);
  const canonicalLedger = fs.readFileSync(ledgerPath, 'utf8');
  const mutations = [
    {
      canonical: 'https://law.justia.com/cases/federal/appellate-courts/F3/116/1129/610984/',
      stale: 'https://vault.fbi.gov/fedex-flight-705-incident-on-april-7-1994',
      expected: /^0421: launch-review source differs/m,
    },
    {
      canonical: 'https://nimd.env.go.jp/archives/english/minamata_disease_in_depth/cause_investigation/',
      stale: 'https://iris.who.int/bitstream/handle/10665/331754/WHO-CED-PHE-EPE-19.12.10-eng.pdf',
      expected: /^0407: launch-review source differs/m,
    },
  ];

  for (const mutation of mutations) {
    const ledger = canonicalLedger.replace(mutation.canonical, mutation.stale);
    assert.match(launchReviewLedgerIssues({ articles, ledger }).join('\n'), mutation.expected);
  }
});

test('missing, duplicate and noncanonical launch-review identities fail closed', () => {
  const articles = articleSourceIdentities(articlesDirectory);
  const canonicalLedger = fs.readFileSync(ledgerPath, 'utf8');
  const fedexStart = canonicalLedger.indexOf('## 0421:');
  const fedexEnd = canonicalLedger.indexOf('\n## ', fedexStart + 1);
  const fedexSection = canonicalLedger.slice(fedexStart, fedexEnd);

  assert.match(
    launchReviewLedgerIssues({ articles, ledger: canonicalLedger.replace(fedexSection, '') }).join('\n'),
    /^0421: missing launch-review section/m,
  );
  assert.match(
    launchReviewLedgerIssues({ articles, ledger: `${canonicalLedger}\n${fedexSection}\n` }).join('\n'),
    /duplicate launch-review section 0421/,
  );
  assert.match(
    launchReviewLedgerIssues({ articles, ledger: canonicalLedger.replace('`fedex-flight-705`', '`fedex-flight-705-stale`') }).join('\n'),
    /^0421: launch-review slug differs/m,
  );
});
