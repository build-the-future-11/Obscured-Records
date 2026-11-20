// Source-derived inventory, not an HTTP crawl. Run with Node's type stripping.
import fs from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { getPublicArticles, sections } from "../lib/articles.ts";
import { getFeature } from "../lib/features.ts";
import { getTopics, getSeries } from "../lib/catalog.ts";
import { corrections } from "../lib/corrections.ts";
import { articleMetadata, articleStructuredData, articleUpdatedDate } from "../lib/article-metadata.ts";
import { displayCover } from "../lib/media-policy.ts";
import { absoluteUrl, siteUrl } from "../lib/site.ts";

const root = new URL("../", import.meta.url);
const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith("@/") ? new URL(`${specifier.slice(2)}.ts`, root).href : specifier, context);
} });
const { default: sitemap } = await import("../app/sitemap.ts");
hook.deregister();
const sitemapPaths = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
const records = getPublicArticles();
const routes = [];
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const sourceHttp = (expected) => ({ expected, observedStatus: null, verification: "UNRUN: no server or browser started in the resource-constrained pass" });
const allStaticLinks = [...read("components/editorial.tsx").matchAll(/href="(\/[^"?#]*)"/g)].map((match) => match[1]);
function add(pathname, type, title, description, sourceFile, incoming, extra = {}) {
  routes.push({
    path: pathname, url: absoluteUrl(pathname), routeType: type, sourceFile,
    intendedVisibility: "Reader route; public launch HOLD; indexing requires separately authorized launch",
    currentlyIndexableByPolicy: false, robots: "noindex, follow (root layout)",
    title: title === "Obscured Records" ? title : `${title} — Obscured Records`,
    description, canonical: absoluteUrl(pathname), http: sourceHttp("200 behind the existing deployment access policy"),
    structuredData: [], socialImage: absoluteUrl("/share-card.png"),
    sitemap: sitemapPaths.has(pathname), rss: false,
    incomingInternalLinks: incoming, issues: [], ...extra,
  });
}
const staticPages = fs.readdirSync(new URL("app/", root), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("[") && fs.existsSync(new URL(`app/${entry.name}/page.tsx`, root)))
  .map((entry) => entry.name);
for (const slug of ["", ...staticPages]) {
  const sourceFile = slug ? `app/${slug}/page.tsx` : "app/page.tsx";
  const source = read(sourceFile);
  const match = source.match(/pageMetadata\("([^"]*)", "([^"]*)", "([^"]*)"\)/);
  if (!match) continue; // Protected routes are recorded explicitly below.
  const [, pathname, title, description] = match;
  const incoming = allStaticLinks.includes(pathname) ? ["Shared Masthead/Footer navigation"] : [];
  add(pathname, slug === "" ? "homepage" : "reader-page", title, description, sourceFile, incoming,
    ["saved", "search"].includes(slug) ? { intendedVisibility: "Permanently noindex reader utility, including after an authorized launch", robots: "noindex, follow (route override)" } : {});
}
const sectionCopy = Object.fromEntries([...read("app/[section]/page.tsx").matchAll(/(world|business|technology|science|culture|underreported): "([^"]*)"/g)].map((match) => [match[1], match[2]]));
for (const section of sections) add(`/${section.toLowerCase()}`, "section", section, sectionCopy[section.toLowerCase()], "app/[section]/page.tsx", ["Shared section navigation", "Article section links"]);
for (const topic of getTopics()) add(`/topic/${topic.slug}`, "topic", topic.name, topic.description, "app/topic/[slug]/page.tsx", ["/topics", ...records.filter((record) => record.tags.includes(topic.tag)).map((record) => `/article/${record.slug}`)]);
for (const series of getSeries()) add(`/series/${series.slug}`, "series", series.title, series.description, "app/series/[slug]/page.tsx", ["/series", ...series.slugs.map((slug) => `/article/${slug}`)]);
for (const [slug, author] of new Map(records.map((record) => [record.authorSlug, record.author]))) add(`/author/${slug}`, "author", author, `Filed records by ${author} at Obscured Records.`, "app/author/[slug]/page.tsx", ["/authors", ...records.filter((record) => record.authorSlug === slug).map((record) => `/article/${record.slug}`)], { structuredData: ["Person"] });
for (const record of records) {
  const presentation = { updated: articleUpdatedDate(record, getFeature(record.slug), corrections), cover: displayCover(record) };
  const metadata = articleMetadata(record, presentation);
  const schema = articleStructuredData(record, presentation);
  add(`/article/${record.slug}`, getFeature(record.slug) ? "feature" : "brief", record.title, record.excerpt, "app/article/[slug]/page.tsx",
    ["/archive", "/latest", `/author/${record.authorSlug}`, `/${record.section.toLowerCase()}`, ...getTopics().filter((topic) => record.tags.includes(topic.tag)).map((topic) => `/topic/${topic.slug}`)], {
      structuredData: ["Article", "BreadcrumbList"], socialImage: metadata.openGraph.images[0].url,
      documentarySchemaImage: schema.image ?? null, datePublished: schema.datePublished, dateModified: schema.dateModified,
      rss: true, issues: !presentation.cover && record.cover ? ["Documentary image withheld under existing provenance hold; branded social preview remains"] : [],
    });
}
for (const [pathname, title, description, expected] of [
  ["/member", "Member space", null, "Sign-in redirect for anonymous visitors; 200 for authenticated member when storage is configured"],
  ["/editorial", "Private editorial desk", "Owner-only draft review for Obscured Records.", "Sign-in redirect when anonymous; 404 for non-owner; 200 for owner"],
  ["/editorial/draft/[slug]", "Private draft", null, "Sign-in redirect when anonymous; 404 for non-owner/unknown slug; 200 for owner and known draft"],
]) {
  add(pathname, "private-route", title, description, `app${pathname}/page.tsx`, pathname === "/member" ? ["/membership", "/saved"] : ["Owner-only member/desk links"], {
    intendedVisibility: "Private authenticated route; permanently excluded from public discovery",
    robots: "noindex, nofollow (route override)", canonical: null, http: sourceHttp(expected), socialImage: "Inherited publication preview only; no private content metadata",
    issues: pathname.includes("[slug]") ? ["Pattern represents the local review corpus; draft titles and bodies are intentionally absent from this inventory"] : [],
  });
}
for (const [pathname, type, sourceFile, contentType, incoming, expected] of [
  ["/rss.xml", "feed", "app/rss.xml/route.ts", "application/rss+xml; charset=utf-8", ["Shared Footer", "RSS alternate metadata"], "200 with 28 current reader items; draft/held/future records excluded"],
  ["/sitemap.xml", "sitemap", "app/sitemap.ts", "application/xml (framework-generated)", ["/robots.txt"], "200; canonical reader paths only, with actual latest recorded article updates"],
  ["/news-sitemap.xml", "news-sitemap", "app/news-sitemap.xml/route.ts", "application/xml; charset=utf-8", ["/robots.txt"], "200; empty at snapshot because no reader publication is within 48 hours"],
  ["/robots.txt", "crawler-policy", "app/robots.ts", "text/plain (framework-generated)", [], "200; allow / and disallow /api/; does not replace noindex or access control"],
  ["/media/[filename]", "image", "app/media/[filename]/route.ts", "image/webp", ["Allowed article covers and responsive variants"], "200/304 for known images; 404 for unknown filename; GET and HEAD"],
]) add(pathname, type, null, null, sourceFile, incoming, {
  title: null, canonical: null, socialImage: null, intendedVisibility: "Machine-readable supporting route behind unchanged deployment access policy",
  robots: ["/rss.xml", "/news-sitemap.xml"].includes(pathname) ? "noindex, follow (X-Robots-Tag)" : "No HTML robots metadata; deployment access policy unchanged",
  contentType, http: sourceHttp(expected),
  issues: pathname === "/news-sitemap.xml" ? ["Existing endpoint retained; review news eligibility before any future use. Historical subject matter alone does not establish NewsArticle eligibility."] : [],
});
function routeHandlers(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? routeHandlers(path.join(directory, entry.name)) : entry.name === "route.ts" ? [path.join(directory, entry.name)] : []);
}
for (const file of routeHandlers("app/api")) {
  const pathname = file.slice(3, -"/route.ts".length);
  const expected = pathname === "/api/search" ? "GET 200; reader-only search index" : pathname === "/api/revision" ? "GET/HEAD 200 with configured revision, otherwise 503" : pathname.includes("/member/") ? "401 without authenticated identity; method-dependent success/validation/storage failures" : "POST only; validation/rate/storage failures or synthetic-record receipt; no email delivery";
  add(pathname, "api", null, null, file, ["Application interactions"], { title: null, canonical: null, socialImage: null, intendedVisibility: "API; excluded from sitemap and crawling by /api/ robots rule", robots: "Disallowed in robots.txt", http: sourceHttp(expected), contentType: "application/json" });
}
for (const [pathname, canonical, expected, issue] of [
  ["/archive?q=aviation", "/archive", "200, filters rendered from query state", "Single complete archive, no pagination: canonical consolidates filter variants; not a page-two-to-page-one canonical"],
  ["/search?q=aviation", "/search", "200, matching search results; explicitly noindex", "Search variants remain noindex after authorized launch"],
  ["/article/__not-a-reader-record__", null, "404 via notFound()", "HTTP status and refresh behavior require a server test"],
  ["/__not-a-section__", null, "404 via dynamic section notFound()", "HTTP status and refresh behavior require a server test"],
  ["/article/fedex-flight-705/", "/article/fedex-flight-705", "Framework trailing-slash normalization expected; unverified on both runtime paths", "No new redirect configuration was added; both builds must verify this behavior"],
]) add(pathname, "variant-or-negative-case", null, null, null, [], { title: null, canonical: canonical ? absoluteUrl(canonical) : null, socialImage: null, http: sourceHttp(expected), issues: [issue] });

const inventory = {
  date: "2026-10-16", baselineRevision: "831471f11d517f769f2216024dc720ac9f8f4bd8", origin: siteUrl,
  evidence: "Source inspection, helper/handler execution and bounded Node regression tests; not a deployed crawl",
  publicLaunch: "HOLD", currentlyIndexableHtmlRoutes: 0,
  counts: { entries: routes.length, readerRecords: records.length, features: records.filter((record) => getFeature(record.slug)).length, topics: getTopics().length, series: getSeries().length, sitemapEntries: sitemapPaths.size },
  checks: { metadataAndHandlers: "VERIFIED by scripts/article-metadata.test.mjs", httpRedirectsAndStatus: "UNRUN", initialServerHtmlAndRenderedOutput: "BLOCKED by local resource admission", socialImageDeliveryAndCrop: "UNRUN on this revision; source fallback and rights holds verified", orphanedReaderRecords: records.filter((record) => !routes.find((route) => route.path === `/article/${record.slug}`)?.incomingInternalLinks.length).map((record) => record.slug) },
  releaseNotes: ["Do not remove root noindex or change private access without explicit launch authorization.", "Robots allow / so an accessible crawler can see the noindex rule; noindex is not access control.", "RSS and news XML carry the HOLD header; reviewed launch must account for these alongside root HTML metadata.", "No custom domain or preview origin was introduced; the existing resolver remains authoritative.", "All HTTP results above are expectations from source, not measured response statuses. Both runtime paths and negative URL cases still require execution."],
  references: ["https://developers.google.com/search/docs/appearance/structured-data/article", "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap", "https://developers.google.com/search/docs/crawling-indexing/block-indexing"],
  routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
};
fs.writeFileSync(new URL("docs/route-inventory-2026-10-16.json", root), `${JSON.stringify(inventory, null, 2)}\n`);
console.log(JSON.stringify(inventory.counts));
