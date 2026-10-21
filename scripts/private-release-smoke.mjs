import fs from "node:fs";
import { execFileSync } from "node:child_process";
import readline from "node:readline";

// Existing owner-private Site access token only; never generates tokens or
// changes sharing. Hidden stdin keeps credentials out of args, logs and files.
if (!process.stdin.isTTY) throw new Error("Use a hidden-input terminal session");
execFileSync("stty", ["-echo"], { stdio: "inherit" });
console.log("Ready for private verification JSON on hidden stdin.");
let input;
try {
  const lines = readline.createInterface({ input: process.stdin, terminal: false });
  for await (const line of lines) { input = JSON.parse(line); lines.close(); break; }
} finally { execFileSync("stty", ["echo"], { stdio: "inherit" }); }
if (!input?.token || !/^[0-9a-f]{40}$/.test(input.expected) || !input.receipt) throw new Error("Token, exact revision and receipt path required");
const origin = "https://obscured-records.ryangomez-hs.chatgpt.site";
const headers = { "OAI-Sites-Authorization": `Bearer ${input.token}` };
const checks = [];
async function check(name, route, inspect, authenticated = true) {
  try {
    const response = await fetch(origin + route, { headers: authenticated ? headers : {}, redirect: "manual", signal: AbortSignal.timeout(20_000) });
    const result = await inspect(response);
    checks.push({ name, route, status: response.status, ...result });
    await response.body?.cancel().catch(() => {});
  } catch (error) { checks.push({ name, route, passed: false, error: error.name }); }
}
await check("exact deployed revision", "/api/revision", async response => {
  const body = await response.json();
  return { passed: response.status === 200 && body.revision === input.expected, revision: body.revision };
});
const registry = fs.readFileSync("lib/articles.ts", "utf8");
const slugs = [...registry.matchAll(/\bslug:\s*"([^"]+)"/g)].map(match => match[1]);
const routes = ["/", "/archive", "/latest", "/search?q=aviation", "/world", "/business", "/science", "/technology", "/culture", "/underreported", "/topics", "/series", "/authors", "/about", "/standards", "/corrections", "/privacy", "/newsletter", "/submit", "/contribute", "/membership", "/saved", ...slugs.map(slug => `/article/${slug}`)];
let cursor = 0;
await Promise.all(Array.from({length:3}, async () => {
  while (cursor < routes.length) {
    const route = routes[cursor++];
    await check("reader route available", route, async response => ({passed: response.status === 200}));
  }
}));
await check("RSS restricted to reader catalogue", "/rss.xml", async response => {
  const text = await response.text(); const items = (text.match(/<item>/g) ?? []).length;
  return {passed: response.status === 200 && items === slugs.length && !text.includes("/article/2007-cyberattacks-on-estonia-record"), items};
});
for (const route of ["/sitemap.xml", "/news-sitemap.xml", "/robots.txt"]) {
  await check("discovery stays private-draft free", route, async response => {
    const text = await response.text();
    return {passed: response.status === 200 && !text.includes("/article/2007-cyberattacks-on-estonia-record")};
  });
}
for (const route of ["/editorial", "/editorial/draft/2007-cyberattacks-on-estonia-record", "/member"]) {
  await check("owner or member identity required", route, async response => ({passed: [302,303,307,308].includes(response.status) && (response.headers.get("location") ?? "").includes("signin-with-chatgpt")}));
}
await check("private draft has no reader page", "/article/2007-cyberattacks-on-estonia-record", async response => ({passed: response.status === 404}));
await check("unknown route is a real 404", "/missing-website-completion-check", async response => ({passed: response.status === 404}));
await check("anonymous access denied", "/", async response => ({passed: [401,403].includes(response.status)}), false);
for (const file of fs.readdirSync("public").filter(name => name.endsWith(".webp"))) {
  await check("WebP served with correct MIME and bytes", `/media/${file}`, async response => {
    const contentType = response.headers.get("content-type")?.split(";")[0];
    const bytes = Buffer.from(await response.arrayBuffer());
    return {passed: response.status === 200 && contentType === "image/webp" && bytes.equals(fs.readFileSync(`public/${file}`)), contentType, bytes:bytes.length};
  });
}
await check("reader markup uses typed image delivery", "/", async response => {
  const text = await response.text();
  return {passed: response.status === 200 && text.includes("/media/fedex-705.webp") && !/<img[^>]+src="\/fedex-705\.webp"/.test(text)};
});
await check("unknown image cannot read other files", "/media/not-a-reader-image.webp", async response => ({passed: response.status === 404}));
await check("anonymous image access denied", "/media/fedex-705.webp", async response => ({passed: [401,403].includes(response.status)}), false);
await check("typed images honor conditional requests", "/media/fedex-705.webp", async response => {
  const etag = response.headers.get("etag");
  if (response.status !== 200 || !etag) return {passed:false};
  const conditional = await fetch(origin + "/media/fedex-705.webp", {headers:{...headers,"if-none-match":etag},redirect:"manual",signal:AbortSignal.timeout(20_000)});
  const body = await conditional.arrayBuffer();
  return {passed:conditional.status === 304 && body.byteLength === 0,conditionalStatus:conditional.status};
});
const receipt = { checkedAt:new Date().toISOString(), expectedRevision:input.expected, scope:"Read-only hosted routes and assets; no owner-authenticated UI, human editorial review or storage mutation", checks };
fs.writeFileSync(input.receipt, JSON.stringify(receipt, null, 2) + "\n", {flag:"wx"});
console.log(JSON.stringify({receipt:input.receipt, checks:checks.length, passed:checks.filter(check => check.passed).length, failures:checks.filter(check => !check.passed)}, null, 2));
process.exitCode = checks.every(check => check.passed) ? 0 : 1;
