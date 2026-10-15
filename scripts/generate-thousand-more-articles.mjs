import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { readDraft, validateDraft, wordCount, writeDraft } from "./editorial-content.mjs";

const { values } = parseArgs({ options: {
  manifest: { type: "string", default: "content/article-expansion-2026-10-15.json" },
  count: { type: "string", default: "1000" },
} });
const expectedCount = Number(values.count);
if (!Number.isSafeInteger(expectedCount) || expectedCount < 1 || expectedCount > 5000) throw new Error("Count must be between 1 and 5,000");
const manifestPath = path.resolve(values.manifest);
const draftsDirectory = path.resolve("content/drafts");
const articlesDirectory = path.resolve("content/articles");
const records = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

if (!Array.isArray(records) || records.length !== expectedCount) {
  throw new Error(`Expansion manifest must contain exactly ${expectedCount} records; found ${records?.length ?? "invalid"}`);
}

const requiredFields = [
  "slug", "title", "dek", "section", "tags", "profile", "event", "mechanism", "system", "memory",
  "evidencePlan", "stakeholderPlan", "openQuestions", "source", "discovery",
];
const slugs = new Set();
const titles = new Set();
const sourceUrls = new Set();
const pageIds = new Set();
const wikidataIds = new Set();
for (const record of records) {
  if (!record || typeof record !== "object" || requiredFields.some((field) => record[field] === undefined)) {
    throw new Error("Malformed article expansion record");
  }
  if (slugs.has(record.slug)) throw new Error(`Duplicate expansion slug: ${record.slug}`);
  if (titles.has(record.title)) throw new Error(`Duplicate expansion title: ${record.title}`);
  if (sourceUrls.has(record.source.url)) throw new Error(`Duplicate orientation URL: ${record.source.url}`);
  if (pageIds.has(record.discovery.wikipediaPageId)) throw new Error(`Duplicate Wikipedia page ID: ${record.discovery.wikipediaPageId}`);
  if (wikidataIds.has(record.discovery.wikidataId)) throw new Error(`Duplicate Wikidata item: ${record.discovery.wikidataId}`);
  for (const field of ["evidencePlan", "stakeholderPlan", "openQuestions"]) {
    if (!Array.isArray(record[field]) || record[field].length !== 3 || record[field].some((value) => typeof value !== "string" || !value.trim())) {
      throw new Error(`${record.slug}: ${field} must contain exactly three reporting tasks`);
    }
  }
  slugs.add(record.slug);
  titles.add(record.title);
  sourceUrls.add(record.source.url);
  pageIds.add(record.discovery.wikipediaPageId);
  wikidataIds.add(record.discovery.wikidataId);
}

const existingDrafts = new Set(
  fs.readdirSync(draftsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .filter((slug) => !slugs.has(slug)),
);
const published = new Set(
  fs.readdirSync(articlesDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, "")),
);

function list(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function bodyFor(record) {
  const description = record.discovery.wikidataDescription
    ? `The Wikidata snapshot supplied the short discovery description “${record.discovery.wikidataDescription}.”`
    : "The Wikidata snapshot did not supply an English discovery description.";
  return `${record.event}

This manuscript is a private, AI-assisted archival reconstruction plan. It is not a certified account, an original-reporting claim or a publishable substitute for source review. Its present value is narrower: it identifies one distinct subject, records where that subject was discovered and lays out a concrete path from an index entry to accountable journalism.

## The discovery record

The orientation trail is unusually explicit. The Wikipedia source is page ${record.discovery.wikipediaPageId}, captured at revision ${record.discovery.wikipediaRevisionId ?? "not returned"} on ${record.discovery.wikipediaRevisionTimestamp ?? "an unrecorded revision time"}. It connects to Wikidata item ${record.discovery.wikidataId}, captured at entity revision ${record.discovery.wikidataRevisionId ?? "not returned"}. ${description} Category membership, labels and descriptions can change; none is claim-level proof.

That boundary matters. An index can establish that a subject is findable, but it cannot establish the event's chronology, the reliability of a number, the meaning of a technical term, the fairness of an allegation or the responsibility of an institution. The reporting pass must open the underlying citations, locate records created closest to the events and preserve uncertainty when the surviving evidence does not converge.

## Build the chronology and mechanism

${record.mechanism}

The first evidence pass has three defined tasks:

${list(record.evidencePlan)}

The chronology should show conditions before the first documented warning, the decisions made while alternatives still existed, the point at which consequences became difficult to arrest and the evidence created afterward. Eyewitness observation, technical inference, regulatory finding, legal judgment and later interpretation must remain separate. If clocks, names, quantities or causal accounts conflict, the disagreement belongs in the article with its provenance; it must not be silently averaged into a cleaner story.

## Map power, responsibility and affected people

${record.system}

A systems account should widen responsibility without dissolving it. Design, finance, procurement, maintenance, staffing, operations, oversight, emergency response and executive control are different powers. The article must identify which of them actually existed around this subject, who exercised them and what records make that assignment defensible.

The human-source plan is equally concrete:

${list(record.stakeholderPlan)}

People should not appear merely as illustrations of a technical mechanism. Names, health details, losses and testimony require reliable, rights-appropriate sourcing. When records are absent, sealed, translated indirectly or created by institutions with an interest in the outcome, the manuscript should say so rather than fill the gap with narrative confidence.

## Test the public memory

${record.memory}

Obscurity is not evidence of concealment by itself. A subject may recede because records are dispersed, terminology changes, archives remain undigitized, litigation narrows what becomes public, language limits discovery or a more famous comparison supplies an easier story. Each explanation needs evidence. The article should compare contemporary coverage, institutional memory, local commemoration and later summaries before claiming that anything was forgotten.

The next reporting round should answer three questions:

${list(record.openQuestions)}

## Publication boundary

The two linked pages are discovery sources only. Before publication, an editor must obtain claim-level primary evidence, at least one genuinely independent account, meaningful contrary evidence and a documented reconciliation of dates, identities and quantities. The piece also needs a real named author, a fairness review, rights-cleared media or an explicit text-only decision, and named human editorial approval.

Until those gates close, this remains private editorial inventory. No reachability check, generated word count, category label, metadata revision or batch test converts it into verified journalism. What is complete now is the reporting map for ${record.title}: a distinct subject, a reproducible discovery trail, explicit evidence tasks and a visible record of every major editorial obligation still open.`;
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
    createdAt: "2026-10-15",
    status: "draft",
    section: record.section,
    tags: record.tags,
    description: record.dek,
    socialPreview: record.dek,
    readingTime: `${Math.max(1, Math.ceil(wordCount(body) / 210))} min`,
    genre: "Archival analysis — reporting plan, not original reporting",
    sources: [
      {
        title: record.source.title,
        url: record.source.url,
        status: "orientation-source-not-verified",
        checkedAt: record.discovery.retrievedAt,
        supports: `Discovery index and source finding only; captured as Wikipedia page ${record.discovery.wikipediaPageId} at revision ${record.discovery.wikipediaRevisionId ?? "not returned"}.`,
      },
      {
        title: `${record.discovery.wikidataId} — Wikidata discovery metadata`,
        url: record.discovery.wikidataUrl,
        status: "orientation-source-not-verified",
        checkedAt: record.discovery.retrievedAt,
        supports: `CC0 discovery metadata only; captured at entity revision ${record.discovery.wikidataRevisionId ?? "not returned"}.`,
      },
    ],
    reviewChecklist: [
      `Verify every material claim about ${record.title} against primary records and document any unresolved conflict.`,
      "Add at least one independent or contemporary source that does not merely repeat the orientation pages.",
      "Separate observation, technical inference, institutional finding, legal outcome and later interpretation.",
      "Reconcile dates, names, quantities and geographic scope; retain uncertainty instead of selecting the most dramatic figure.",
      "Complete fairness, privacy and rights review; assign the real author and obtain named human approval before publication.",
    ],
    completedChecks: [],
    approvedBy: null,
    approvedAt: null,
    reviewSourceNotes: `Created as private reporting inventory on 15 October 2026 from Wikipedia page ${record.discovery.wikipediaPageId} / Wikidata ${record.discovery.wikidataId}. API discovery metadata and URL reachability are not claim verification.`,
    relatedDrafts: [],
    history: [],
  };

  validateDraft(metadata, body);
  const destination = path.join(draftsDirectory, `${record.slug}.md`);
  if (fs.existsSync(destination)) {
    const existing = readDraft(destination);
    if (JSON.stringify(existing.metadata) !== JSON.stringify(metadata) || existing.body.trim() !== body.trim()) {
      throw new Error(`Refusing to overwrite an existing or reviewed manuscript: ${record.slug}`);
    }
  } else writeDraft(destination, metadata, body);
}

console.log(`Generated ${records.length} additional private article drafts.`);
