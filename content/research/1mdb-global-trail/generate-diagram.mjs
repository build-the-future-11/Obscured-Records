#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function text(x, y, value, className, anchor = 'start') {
  return `<text x="${x}" y="${y}" class="${className}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
}

function wrapWords(value, maximumCharacters) {
  return String(value).split(/\s+/).reduce((lines, word) => {
    const last = lines.at(-1);
    if (!last || `${last} ${word}`.length > maximumCharacters) lines.push(word);
    else lines[lines.length - 1] = `${last} ${word}`;
    return lines;
  }, []);
}

function phaseCard(phase, index) {
  const y = 252 + index * 196;
  const purposeLines = wrapWords(phase.purpose, 51);
  const routeLines = wrapWords(phase.allegedRoute, 56);
  return [
    `<rect x="64" y="${y}" width="450" height="176" rx="16" class="phase-card"/>`,
    text(88, y + 34, `${index + 1} · ${phase.name}`, 'phase-name'),
    text(488, y + 34, phase.period, 'period', 'end'),
    text(88, y + 70, phase.amount, 'amount'),
    ...purposeLines.map((line, lineIndex) => text(88, y + 101 + lineIndex * 22, line, 'body')),
    ...routeLines.map((line, lineIndex) => text(88, y + 143 + lineIndex * 18, line, 'body-small')),
    `<path d="M514 ${y + 88} H622" class="arrow" marker-end="url(#arrowhead)"/>`,
  ].join('\n');
}

export function renderDiagram(data) {
  const assets = data.assetCategories.map((asset, index) => {
    const y = 286 + index * 86;
    return [
      `<rect x="1120" y="${y}" width="416" height="60" rx="30" class="asset-pill"/>`,
      text(1150, y + 38, asset, 'asset'),
    ].join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" role="img" aria-labelledby="diagram-title diagram-desc">
  <title id="diagram-title">${escapeXml(data.title)}</title>
  <desc id="diagram-desc">${escapeXml(data.caption)}</desc>
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#c79753"/>
    </marker>
    <style>
      .background { fill: #11161b; }
      .eyebrow { fill: #c79753; font: 700 19px Arial, sans-serif; letter-spacing: 2.2px; }
      .title { fill: #f6f0e6; font: 700 42px Georgia, serif; }
      .subtitle { fill: #b8c0c7; font: 22px Arial, sans-serif; }
      .legal-banner { fill: #3a231d; stroke: #c56b50; stroke-width: 2; }
      .legal { fill: #f2b099; font: 700 18px Arial, sans-serif; letter-spacing: 1.6px; }
      .column-label { fill: #c79753; font: 700 17px Arial, sans-serif; letter-spacing: 1.4px; }
      .phase-card { fill: #1b232b; stroke: #3c4954; stroke-width: 2; }
      .phase-name { fill: #f6f0e6; font: 700 24px Georgia, serif; }
      .period { fill: #c9d0d6; font: 17px Arial, sans-serif; }
      .amount { fill: #e0ae68; font: 700 22px Arial, sans-serif; }
      .body { fill: #d3d9de; font: 16px Arial, sans-serif; }
      .body-small { fill: #9faab3; font: 14px Arial, sans-serif; }
      .routing { fill: #202a32; stroke: #c79753; stroke-width: 2.5; }
      .routing-title { fill: #f6f0e6; font: 700 26px Georgia, serif; }
      .routing-copy { fill: #c9d0d6; font: 17px Arial, sans-serif; }
      .arrow { fill: none; stroke: #c79753; stroke-width: 3; }
      .asset-pill { fill: #1b232b; stroke: #53616d; stroke-width: 1.5; }
      .asset { fill: #e2e6e9; font: 18px Arial, sans-serif; }
      .caption-box { fill: #171e24; stroke: #3c4954; stroke-width: 1.5; }
      .caption { fill: #aeb7be; font: 15px Arial, sans-serif; }
      .source { fill: #78858f; font: 13px Arial, sans-serif; }
    </style>
  </defs>
  <rect width="1600" height="1000" class="background"/>
  ${text(64, 58, `RECORD ${data.recordId} · PUBLIC-RECORD SCHEMATIC`, 'eyebrow')}
  ${text(64, 114, data.title, 'title')}
  ${text(64, 151, data.subtitle, 'subtitle')}
  <rect x="1172" y="60" width="364" height="58" rx="8" class="legal-banner"/>
  ${text(1354, 96, data.legalStatus, 'legal', 'middle')}
  ${text(64, 225, 'ALLEGED PHASE', 'column-label')}
  ${text(630, 225, 'ALLEGED ROUTING', 'column-label')}
  ${text(1120, 225, 'ASSET CATEGORIES NAMED BY DOJ', 'column-label')}
  ${data.phases.map(phaseCard).join('\n')}
  <rect x="646" y="350" width="386" height="270" rx="20" class="routing"/>
  ${text(839, 405, 'Accounts and entities', 'routing-title', 'middle')}
  ${text(839, 449, 'The complaints alleged transfers', 'routing-copy', 'middle')}
  ${text(839, 478, 'through accounts, shell companies', 'routing-copy', 'middle')}
  ${text(839, 507, 'and financial institutions across', 'routing-copy', 'middle')}
  ${text(839, 536, 'multiple jurisdictions.', 'routing-copy', 'middle')}
  ${text(839, 584, 'Schematic only — not a ledger', 'legal', 'middle')}
  <path d="M1032 485 H1098" class="arrow" marker-end="url(#arrowhead)"/>
  ${assets}
  <rect x="64" y="854" width="1472" height="92" rx="12" class="caption-box"/>
  ${text(88, 884, 'CAPTION', 'column-label')}
  ${text(88, 914, 'Schematic of allegations in U.S. civil-forfeiture complaints announced 20 July 2016. Amounts are approximate;', 'caption')}
  ${text(88, 938, 'arrow width and box area do not encode volume. This does not establish guilt, ownership, final recovery or completeness.', 'caption')}
  ${text(1536, 974, 'Source: U.S. Department of Justice · 20 July 2016', 'source', 'end')}
</svg>
`;
}

export function loadData(dataPath = path.join(directory, 'diagram-data.json')) {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function main() {
  const outputIndex = process.argv.indexOf('--output');
  const dataIndex = process.argv.indexOf('--data');
  const outputPath = outputIndex >= 0 ? path.resolve(process.argv[outputIndex + 1]) : path.join(directory, 'diagram.svg');
  const dataPath = dataIndex >= 0 ? path.resolve(process.argv[dataIndex + 1]) : path.join(directory, 'diagram-data.json');
  fs.writeFileSync(outputPath, renderDiagram(loadData(dataPath)), 'utf8');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
