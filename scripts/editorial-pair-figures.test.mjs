import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { readDraft, validateDraft } from './editorial-content.mjs';
const root='content/research/';
const slugs=['blackout-2003-silent-alarms','herald-confirming-the-doors'];
test('two source-led drafts exceed600 substantive words and preserve approval gates',()=>{
 for(const slug of slugs){
  const {metadata,body}=readDraft(`content/drafts/${slug}.md`);validateDraft(metadata,body);
  const prose=body.split('## Sources')[0].replace(/\[\d+\]/g,'').split('\n').filter(x=>!x.startsWith('#')).join('\n');
  assert.ok(prose.split(/\s+/).filter(Boolean).length>=600);
  assert.equal(metadata.status,'draft');assert.equal(metadata.approvedBy,null);assert.equal(metadata.approvedAt,null);assert.deepEqual(metadata.completedChecks,[]);
  assert.ok(metadata.sources.every(x=>x.status==='inspected-ai-review-pending'));
 }
});
test('blackout classification does not invent numerical causal shares',()=>{
 const d=JSON.parse(fs.readFileSync(root+slugs[0]+'/diagram_data.json','utf8'));
 assert.equal(d.groups.length,4); assert.equal(new Set(d.groups.map(x=>x.id)).size,4);
 assert.ok(d.groups.every(x=>x.quantitative_weight===null && x.source_url.startsWith('https://www.canada.ca/')));
});
test('Herald dates preserve year-only precision and the exact1998 entry date',()=>{
 const d=JSON.parse(fs.readFileSync(root+slugs[1]+'/diagram_data.json','utf8'));
 assert.deepEqual(d.events.map(x=>x.date),['1987','1989','1991','1993','1998-07-01']);
 assert.deepEqual(d.events.map(x=>x.precision),['year','year','year','year','day']);
 assert.equal(d.effectiveness_estimate,null);
});
test('both original diagrams are self-contained vector artifacts',()=>{
 for(const slug of slugs){const s=fs.readFileSync(root+slug+'/diagram.svg','utf8');assert.match(s,/<svg\b/);assert.doesNotMatch(s,/<script\b|<foreignObject\b|href=["']https?:/i);assert.ok(fs.statSync(root+slug+'/diagram.png').size>10000);}
});
