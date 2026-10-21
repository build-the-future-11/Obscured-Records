import fs from "node:fs";
import path from "node:path";
import { validateDraft, wordCount, writeDraft } from "./editorial-content.mjs";

const manifestPath = path.resolve("content/article-expansion-2026-10-14.json");
const draftsDirectory = path.resolve("content/drafts");
const articlesDirectory = path.resolve("content/articles");
const records = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

if (!Array.isArray(records) || records.length !== 100) {
  throw new Error(`Expansion manifest must contain exactly 100 records; found ${records?.length ?? "invalid"}`);
}

const requiredRecordFields = ["slug", "title", "dek", "section", "tags", "event", "mechanism", "system", "memory", "source"];
const manifestSlugs = new Set();
const manifestTitles = new Set();
for (const record of records) {
  if (!record || typeof record !== "object" || requiredRecordFields.some((field) => record[field] === undefined)) {
    throw new Error("Malformed expansion record");
  }
  if (manifestSlugs.has(record.slug)) throw new Error(`Duplicate expansion slug: ${record.slug}`);
  if (manifestTitles.has(record.title)) throw new Error(`Duplicate expansion title: ${record.title}`);
  manifestSlugs.add(record.slug);
  manifestTitles.add(record.title);
}

const existingDrafts = new Set(
  fs.readdirSync(draftsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .filter((slug) => !manifestSlugs.has(slug)),
);
const published = new Set(
  fs.readdirSync(articlesDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, "")),
);

function bodyFor(record) {
  return `${record.event}

This is an editorial reconstruction plan, not a certified account. The event has a public name, but that name can conceal several different records: what people observed in real time, what investigators later inferred, what courts or regulators decided under their own standards, and what subsequent retellings simplified. The article should keep those layers separate.

## The sequence to reconstruct

${record.mechanism}

Chronology is the first safeguard against a false story. The finished piece should identify the conditions before the failure, the earliest recoverable warning, the decisions made while alternatives still existed, the point at which the event became difficult to arrest, and the evidence created afterward. Every important time, number and quotation needs a traceable source. If clocks, manifests, casualty counts or technical findings disagree, the disagreement belongs in the narrative rather than being silently averaged away.

The human record needs equal discipline. Totals do not explain who was exposed, what information they had, what authority they could exercise or which institutions preserved their testimony. Names and personal details should be added only from reliable, rights-appropriate records. Survivors, workers and residents should not appear merely as illustrations of a technical mechanism.

## The system around the failure

${record.system}

A useful systems account does not dissolve responsibility. It shows where responsibility was located: design approval, procurement, maintenance, staffing, operations, regulation, emergency response and executive oversight. It also asks whether safeguards were genuinely independent or whether several barriers relied on the same assumption, contractor, data source or decision-maker.

Reform requires the same care as failure. A rule change, recall, redesign, inquiry or compensation program is evidence that an institution responded; it is not proof that the underlying risk disappeared. The eventual article should check implementation, later incidents and enforcement before describing any lesson as learned.

## What public memory leaves out

${record.memory}

Obscurity is a reporting question, not evidence of concealment by itself. A story may recede because archives are dispersed, terminology changes, records remain undigitized, litigation narrows what becomes public, or a more famous event supplies a simpler comparison. Those explanations need evidence too. The article should resist both conspiracy language and the comforting idea that a familiar moral completes the record.

## What remains to verify

The reporting trail begins with ${record.source.title}. That link is an orientation source only. It has not been accepted as claim-level proof, and its presence does not verify this draft. Before publication, an editor must locate the underlying investigation and contemporaneous records, test every material claim, seek an independent account, document meaningful contrary evidence, and reconcile dates, names and loss estimates.

The manuscript also requires a rights-cleared visual or an explicit text-only decision, a real named author, a fairness review and named human approval. Until those gates are complete, it remains private editorial inventory. Its completed value is narrower but real: one distinct subject, one documented reporting angle, one reproducible source lead and a visible map of the work still owed to readers.`;
}

for (const record of records) {
  if (existingDrafts.has(record.slug) || published.has(record.slug)) {
    throw new Error(`Expansion collides with existing subject: ${record.slug}`);
  }

  const body = bodyFor(record);
  const metadata = {
    slug: record.slug,
    title: record.title,
    dek: record.dek,
    author: "Unassigned — AI-assisted editorial draft",
    createdAt: "2026-10-14",
    status: "draft",
    section: record.section,
    tags: record.tags,
    description: record.dek,
    socialPreview: record.socialPreview ?? record.dek,
    readingTime: `${Math.max(1, Math.ceil(wordCount(body) / 210))} min`,
    genre: "Archival analysis — not original reporting",
    sources: [{
      title: record.source.title,
      url: record.source.url,
      status: "orientation-source-not-verified",
      supports: "Initial chronology, terminology and source discovery only; every material claim remains open for claim-level review.",
    }],
    reviewChecklist: [
      `Verify the chronology and material claims for ${record.title} against the underlying investigation and contemporaneous records.`,
      "Separate eyewitness observation, technical inference, regulatory finding, legal judgment and later interpretation.",
      "Reconcile names, dates, counts and loss estimates without selecting the most dramatic figure by default.",
      "Add at least one independent or contemporary source and document meaningful disagreement or evidentiary limits.",
      "Complete fairness and rights review, assign the real author, and obtain named human editorial approval before publication.",
    ],
    completedChecks: [],
    approvedBy: null,
    approvedAt: null,
    reviewSourceNotes: "Created as private reporting inventory on 14 October 2026. The linked page is an orientation source; no independent source pass, rights review or human approval is claimed.",
    relatedDrafts: [],
    history: [],
  };

  validateDraft(metadata, body);
  writeDraft(path.join(draftsDirectory, `${record.slug}.md`), metadata, body);
}

console.log(`Generated ${records.length} additional private article drafts.`);
