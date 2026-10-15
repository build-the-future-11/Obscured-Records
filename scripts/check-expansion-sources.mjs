import fs from "node:fs";

const manifests = [
  "content/article-expansion-2026-10-11.json",
  "content/article-expansion-2026-10-14.json",
  "content/article-expansion-2026-10-15.json",
];
const records = manifests.flatMap((file) => JSON.parse(fs.readFileSync(file, "utf8")));
const queue = records.map((record) => ({ slug: record.slug, url: record.source.url }));
const failures = [];
const wikipedia = [];
const direct = [];

for (const item of queue) {
  const url = new URL(item.url);
  if (url.hostname === "en.wikipedia.org" && url.pathname.startsWith("/wiki/")) {
    wikipedia.push({ ...item, title: decodeURIComponent(url.pathname.slice(6)).replaceAll("_", " ") });
  } else {
    direct.push(item);
  }
}

for (let index = 0; index < wikipedia.length; index += 50) {
  const batch = wikipedia.slice(index, index + 50);
  const endpoint = new URL("https://en.wikipedia.org/w/api.php");
  endpoint.search = new URLSearchParams({
    action: "query",
    titles: batch.map((item) => item.title).join("|"),
    redirects: "1",
    prop: "info",
    format: "json",
    formatversion: "2",
    origin: "*",
    maxlag: "5",
  });
  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(20000),
      headers: {
        "user-agent": "ObscuredRecordsEditorialAudit/1.0 (https://obscured-records.ryangomez-hs.chatgpt.site)",
        "api-user-agent": "ObscuredRecordsEditorialAudit/1.0 (https://obscured-records.ryangomez-hs.chatgpt.site)",
      },
    });
    if (!response.ok) {
      failures.push({ batch: batch.map((item) => item.slug), status: response.status });
      continue;
    }
    const payload = await response.json();
    const missing = (payload.query?.pages ?? []).filter((page) => page.missing || page.invalid);
    if (payload.error || missing.length) {
      failures.push({ batch: batch.map((item) => item.slug), apiError: payload.error ?? null, missing });
    }
  } catch (error) {
    failures.push({ batch: batch.map((item) => item.slug), error: error.name });
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}

let cursor = 0;

async function worker() {
  while (cursor < direct.length) {
    const item = direct[cursor++];
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
