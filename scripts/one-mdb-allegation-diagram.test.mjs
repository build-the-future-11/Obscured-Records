import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadData, renderDiagram } from '../content/research/1mdb-global-trail/generate-diagram.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packetDirectory = path.join(repositoryRoot, 'content/research/1mdb-global-trail');
const dataPath = path.join(packetDirectory, 'diagram-data.json');
const svgPath = path.join(packetDirectory, 'diagram.svg');

test('1MDB figure remains a deterministic rendering of its underlying data', () => {
  const data = loadData(dataPath);
  const expected = fs.readFileSync(svgPath, 'utf8');
  assert.equal(renderDiagram(data), expected);

  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'obscured-1mdb-'));
  try {
    const output = path.join(temporaryDirectory, 'diagram.svg');
    fs.writeFileSync(output, renderDiagram(data), 'utf8');
    assert.equal(fs.readFileSync(output, 'utf8'), expected);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test('1MDB figure preserves the allegation and proportionality caveats', () => {
  const data = loadData(dataPath);
  const normalized = JSON.stringify(data).toLowerCase();
  assert.equal(data.legalStatus, 'ALLEGATIONS, NOT VERDICTS');
  assert.match(data.caption, /arrow width and box area do not encode transaction volume/i);
  assert.match(data.caption, /does not establish guilt, ownership, final recovery or completeness/i);
  assert.doesNotMatch(normalized, /superyacht/);
});

test('1MDB figure is bounded to the three phases and asset categories in the cited 2016 record', () => {
  const data = loadData(dataPath);
  assert.deepEqual(data.phases.map(({ name, period, amount }) => ({ name, period, amount })), [
    { name: 'Good Star', period: '2009–2011', amount: 'more than $1 billion' },
    { name: 'Aabar-BVI', period: '2012', amount: 'approximately $1.367 billion' },
    { name: 'Tanore', period: '2013', amount: 'more than $1.26 billion' },
  ]);
  assert.deepEqual(data.assetCategories, [
    'Real estate and hotels',
    '$35 million jet',
    'Van Gogh and Monet works',
    'EMI publishing interest',
    'The Wolf of Wall Street production',
  ]);
  assert.deepEqual(data.sources.map(({ url }) => url), [
    'https://www.justice.gov/archives/opa/pr/united-states-seeks-recover-more-1-billion-obtained-corruption-involving-malaysian-sovereign',
    'https://www.justice.gov/opa/file/877326/dl?inline=',
  ]);
});

test('committed SVG exposes an accessible title and description without embedded third-party media', () => {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const data = loadData(dataPath);
  assert.match(svg, /role="img" aria-labelledby="diagram-title diagram-desc"/);
  assert.match(svg, /<title id="diagram-title">/);
  assert.match(svg, /<desc id="diagram-desc">/);
  for (const asset of data.assetCategories) assert.ok(svg.includes(asset));
  assert.doesNotMatch(svg, /<image\b|\b(?:href|xlink:href)=/i);
});
