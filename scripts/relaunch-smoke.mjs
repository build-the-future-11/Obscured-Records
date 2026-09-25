const base = (process.env.OBSCURED_BASE_URL || "").trim().replace(/\/+$/, "");
const expected = (process.env.EXPECTED_OBSCURED_REVISION || "").trim().toLowerCase();

if (!/^https:\/\//.test(base)) {
  console.error("[relaunch-smoke] OBSCURED_BASE_URL must be an https URL");
  process.exit(2);
}
if (!/^[0-9a-f]{40}$/.test(expected)) {
  console.error("[relaunch-smoke] EXPECTED_OBSCURED_REVISION must be an immutable 40-char git SHA");
  process.exit(2);
}

const checks = [];
let failed = false;

async function request(path, init = {}) {
  const url = new URL(path, base + "/");
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      ...init,
    });
    return { response, url: url.toString(), error: null };
  } catch (error) {
    return { response: null, url: url.toString(), error: error instanceof Error ? error.message : String(error) };
  }
}

function record(name, ok, detail) {
  checks.push({ name, ok, detail });
  const prefix = ok ? "OK" : "FAIL";
  console.log(`[relaunch-smoke] ${prefix}: ${name} — ${detail}`);
  if (!ok) failed = true;
}

const revisionResult = await request("/api/revision");
if (!revisionResult.response) {
  record("immutable revision endpoint", false, revisionResult.error || "request failed");
} else {
  let json = null;
  try { json = await revisionResult.response.json(); } catch {}
  const served = typeof json?.revision === "string" ? json.revision.toLowerCase() : null;
  record(
    "immutable revision endpoint",
    revisionResult.response.status === 200 && json?.ok === true && served === expected,
    `http=${revisionResult.response.status} served=${served || "none"} expected=${expected}`,
  );
}

for (const path of ["/", "/search", "/newsletter", "/submit", "/corrections", "/standards", "/rss.xml", "/sitemap.xml", "/news-sitemap.xml", "/robots.txt"]) {
  const result = await request(path);
  record(
    `GET ${path}`,
    Boolean(result.response && result.response.status >= 200 && result.response.status < 400),
    result.response ? `http=${result.response.status}` : (result.error || "request failed"),
  );
}

const sitemapResult = await request("/sitemap.xml");
if (sitemapResult.response?.ok) {
  const sitemap = await sitemapResult.response.text();
  const match = sitemap.match(/<loc>(https?:\/\/[^<]+\/article\/[^<]+)<\/loc>/i);
  if (!match) {
    record("article route discovered from sitemap", false, "no public article URL found");
  } else {
    const articleUrl = new URL(match[1]);
    const result = await request(articleUrl.pathname + articleUrl.search);
    record(
      "first public article",
      Boolean(result.response && result.response.status >= 200 && result.response.status < 400),
      result.response ? `http=${result.response.status} path=${articleUrl.pathname}` : (result.error || "request failed"),
    );
  }
} else {
  record("article route discovered from sitemap", false, "sitemap unavailable");
}

const invalidNewsletter = await request("/api/newsletter", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "not-an-email", website: "" }),
});
record(
  "newsletter rejects malformed email without storage mutation",
  invalidNewsletter.response?.status === 400,
  invalidNewsletter.response ? `http=${invalidNewsletter.response.status}` : (invalidNewsletter.error || "request failed"),
);

console.log(JSON.stringify({ base, expectedRevision: expected, checks }, null, 2));
if (failed) process.exit(1);
