import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const root='content/research/johnstown-warning-and-escape/';
test('Johnstown graphic preserves five sourced clock-time events and the breach account range',()=>{
 const csv=fs.readFileSync(root+'timeline.csv','utf8');
 const [header,...rows]=csv.trim().split('\n').map(r=>r.split(','));
 assert.equal(header.length,7); assert.equal(rows.length,5);
 assert.equal(new Set(rows.map(r=>r[0])).size,5);
 for(const row of rows){assert.equal(row.length,7);assert.equal(row[1],'1889-05-31');assert.match(row[5],/^https:\/\/www\.nps\.gov\/jofl\//);assert.ok(row[6].length);}
 assert.deepEqual(rows.map(r=>r.slice(2,4)),[['13:00','13:00'],['13:52','13:52'],['14:45','14:45'],['15:10','15:15'],['16:07','16:07']]);
 const receipt=JSON.parse(fs.readFileSync(root+'figure_receipt.json','utf8'));
 assert.equal(receipt.source_csv_sha256,createHash('sha256').update(csv).digest('hex'));
 assert.equal(receipt.simulated_data,false);assert.equal(receipt.interpolation,false);
});
test('Johnstown generated vector is self-contained and labels uncertainty',()=>{
 const svg=fs.readFileSync(root+'timeline.svg','utf8');
 assert.match(svg,/Warnings, breach, arrival/); assert.match(svg,/Times are approximate/);
 assert.doesNotMatch(svg,/<script\b|<foreignObject\b|href=["']https?:/i);
 assert.ok(fs.statSync(root+'timeline.png').size>10000);
});
