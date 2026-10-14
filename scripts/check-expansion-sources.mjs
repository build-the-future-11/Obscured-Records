import fs from "node:fs";

const manifests = [
  "content/article-expansion-2026-10-11.json",
  "content/article-expansion-2026-10-14.json",
];
const records = manifests.flatMap((file) => JSON.parse(fs.readFileSync(file, "utf8")));
const queue = records.map((record) => ({ slug: record.slug, url: record.source.url }));
const failures = [];
let cursor = 0;

async function worker() {
  while (cursor < queue.length) {
    const item = queue[cursor++];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(item.url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "ObscuredRecordsEditorialAudit/1.0" },
      });
      if (!response.ok) failures.push({ ...item, status: response.status });
      await response.body?.cancel();
    } catch (error) {
      failures.push({ ...item, error: error.name });
    } finally {
      clearTimeout(timer);
    }
  }
}

await Promise.all(Array.from({ length: 6 }, worker));
if (failures.length) {
  console.error(JSON.stringify({ checked: queue.length, failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ checked: queue.length, reachable: queue.length }));
}
