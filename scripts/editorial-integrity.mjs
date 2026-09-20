import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const articlesDir = path.join(root, "content", "articles");
const articleRegistryPath = path.join(root, "lib", "articles.ts");

const requiredFields = [
  "title",
  "subtitle",
  "slug",
  "author",
  "date",
  "updated",
  "section",
  "excerpt",
  "recordId",
  "readingTime",
  "eventDate",
  "source",
  "sourceUrl",
];

const fail = (message) => {
  console.error(`editorial-integrity: ${message}`);
  process.exitCode = 1;
};

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(`${path.relative(root, filePath)} is missing frontmatter`);
    return {};
  }

  const result = {};
  for (const line of match[1].split("\n")) {
    const delimiter = line.indexOf(":");
    if (delimiter === -1) continue;
    const key = line.slice(0, delimiter).trim();
    let value = line.slice(delimiter + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function isCanonicalIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function humanDateToIso(value) {
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const match = value?.match(/^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/);
  if (!match || !months[match[2]]) return null;
  const iso = `${match[3]}-${months[match[2]]}-${match[1].padStart(2, "0")}`;
  return isCanonicalIsoDate(iso) ? iso : null;
}

function isSafeSourceUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

const files = fs.readdirSync(articlesDir)
  .filter((name) => name.endsWith(".mdx"))
  .sort();

if (files.length === 0) fail("content/articles has no MDX records");

const seenSlugs = new Set();
const seenRecordIds = new Set();
const records = [];

for (const file of files) {
  const filePath = path.join(articlesDir, file);
  const frontmatter = parseFrontmatter(filePath);

  for (const field of requiredFields) {
    if (!frontmatter[field]) fail(`${file}: missing required field ${field}`);
  }

  if (frontmatter.slug && file !== `${frontmatter.slug}.mdx`) {
    fail(`${file}: filename does not match slug ${frontmatter.slug}`);
  }
  if (frontmatter.slug) {
    if (seenSlugs.has(frontmatter.slug)) fail(`${file}: duplicate slug ${frontmatter.slug}`);
    seenSlugs.add(frontmatter.slug);
  }
  if (frontmatter.recordId) {
    if (!/^\d{4}$/.test(frontmatter.recordId)) fail(`${file}: recordId must be four digits`);
    if (seenRecordIds.has(frontmatter.recordId)) fail(`${file}: duplicate recordId ${frontmatter.recordId}`);
    seenRecordIds.add(frontmatter.recordId);
  }
  for (const field of ["date", "updated"]) {
    if (frontmatter[field] && !isCanonicalIsoDate(frontmatter[field])) {
      fail(`${file}: ${field} must be a valid YYYY-MM-DD calendar date`);
    }
  }
  if (frontmatter.date && frontmatter.updated && frontmatter.updated < frontmatter.date) {
    fail(`${file}: updated date precedes publication date`);
  }
  if (frontmatter.sourceUrl && !isSafeSourceUrl(frontmatter.sourceUrl)) {
    fail(`${file}: sourceUrl must be a valid credential-free HTTPS URL`);
  }
  if (frontmatter.readingTime && !/^\d+ min$/.test(frontmatter.readingTime)) {
    fail(`${file}: readingTime must use '<n> min'`);
  }
  records.push(frontmatter);
}

const registry = fs.readFileSync(articleRegistryPath, "utf8");
const registrySlugs = [...registry.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]);
const registryRecordIds = [...registry.matchAll(/\brecordId:\s*"([^"]+)"/g)].map((match) => match[1]);

for (const record of records) {
  if (!registrySlugs.includes(record.slug)) fail(`${record.slug}: missing from lib/articles.ts registry`);
  if (!registryRecordIds.includes(record.recordId)) fail(`${record.slug}: recordId ${record.recordId} missing from lib/articles.ts registry`);
}
for (const slug of registrySlugs) {
  if (!seenSlugs.has(slug)) fail(`${slug}: registry entry has no matching content/articles MDX file`);
}

const byMatch = registry.match(/const by=\{[^}]*date:\s*"([^"]+)"[^}]*updated:\s*"([^"]+)"/);
if (!byMatch) {
  fail("lib/articles.ts base date/updated values are missing or not in the expected deterministic shape");
} else {
  const registryDate = humanDateToIso(byMatch[1]);
  const registryUpdated = humanDateToIso(byMatch[2]);
  if (!registryDate || !registryUpdated) {
    fail("lib/articles.ts base date/updated values must be valid calendar dates in deterministic format");
  } else {
    for (const record of records) {
      if (record.date !== registryDate) fail(`${record.slug}: MDX date ${record.date} differs from registry base date ${registryDate}`);
      if (record.updated !== registryUpdated) fail(`${record.slug}: MDX updated ${record.updated} differs from registry base updated ${registryUpdated}`);
    }
  }
}

if (registrySlugs.length !== records.length) {
  fail(`registry/MDX article count mismatch (${registrySlugs.length} vs ${records.length})`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`editorial-integrity: PASS (${records.length} article records; slugs, IDs, dates and source URLs checked)`);
