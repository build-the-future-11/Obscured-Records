import assert from "node:assert/strict";
import { after, test } from "node:test";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { getArticle, getPublicArticles } from "../lib/articles.ts";
import { getFeature } from "../lib/features.ts";
import { corrections } from "../lib/corrections.ts";
import { displayCover } from "../lib/media-policy.ts";
import { articleMetadata, articleStructuredData, articleUpdatedDate } from "../lib/article-metadata.ts";
import { serializeJsonLd } from "../lib/discovery.ts";
import { absoluteUrl } from "../lib/site.ts";

const root = new URL("../", import.meta.url);
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier.startsWith("@/") ? new URL(`${specifier.slice(2)}.ts`, root).href : specifier, context);
  },
});
after(() => hook.deregister());
const { default: sitemap } = await import("../app/sitemap.ts");
const { default: robots } = await import("../app/robots.ts");
const rss = await import("../app/rss.xml/route.ts");
const news = await import("../app/news-sitemap.xml/route.ts");
const search = await import("../app/api/search/route.ts");

test("the latest recorded update survives newest-first correction logs everywhere", () => {
  const article = getArticle("fedex-flight-705");
  const updated = articleUpdatedDate(article, getFeature(article.slug), corrections);
  assert.equal(updated, "2 Oct 2026");
  assert.equal(articleUpdatedDate(article, getFeature(article.slug), [...corrections].reverse()), updated);
  assert.equal(articleMetadata(article, { updated }).openGraph.modifiedTime, "2026-10-02");
  assert.equal(articleStructuredData(article, { updated }).dateModified, "2026-10-02");
  assert.equal(sitemap().find((item) => item.url.endsWith(`/article/${article.slug}`)).lastModified.toISOString(), "2026-10-02T00:00:00.000Z");
  assert.equal(article.date, "14 Sep 2026", "a corrected update must preserve first publication");
});

test("a later feature or registry revision is not masked by an older correction", () => {
  const article = { slug: "fixture", date: "14 Sep 2026", updated: "1 Oct 2026" };
  const older = [{ slug: "fixture", date: "27 Sep 2026" }, { slug: "unrelated", date: "9 Oct 2026" }];
  assert.equal(articleUpdatedDate(article, undefined, older), "1 Oct 2026");
  assert.equal(articleUpdatedDate(article, { updated: "2 Oct 2026" }, older), "2 Oct 2026");
  assert.throws(() => articleUpdatedDate(article, { updated: "31 Sep 2026" }, older));
});

test("all reader metadata preserves canonical slugs, dates, bylines and held imagery", () => {
  const titles = new Set();
  for (const article of getPublicArticles()) {
    const presentation = { updated: articleUpdatedDate(article, getFeature(article.slug), corrections), cover: displayCover(article) };
    const metadata = articleMetadata(article, presentation);
    const schema = articleStructuredData(article, presentation);
    assert.equal(metadata.alternates.canonical, absoluteUrl(`/article/${article.slug}`));
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(schema.mainEntityOfPage, metadata.alternates.canonical);
    assert.equal(schema.author.name, article.author);
    assert.equal(schema.author.url, metadata.authors[0].url);
    assert.equal(schema.headline, article.title);
    assert.equal(schema.description, article.excerpt);
    assert.equal(schema.dateModified, metadata.openGraph.modifiedTime);
    assert.match(metadata.openGraph.images[0].url, /^https?:\/\//);
    assert.ok(!titles.has(metadata.title)); titles.add(metadata.title);
    if (presentation.cover) assert.equal(schema.image, metadata.openGraph.images[0].url);
    else {
      assert.ok(!Object.hasOwn(schema, "image"), "a publication card is not documentary Article imagery");
      assert.equal(metadata.openGraph.images[0].url, absoluteUrl("/share-card.png"));
      assert.match(metadata.openGraph.images[0].alt, /publication preview; no documentary image/);
    }
  }
});

test("article structured data round-trips script closing text without breaking HTML", () => {
  const original = getPublicArticles()[0];
  const article = { ...original, title: '</script><script>alert("headline")</script>', excerpt: "A\u2028B\u2029C" };
  const schema = articleStructuredData(article, { updated: original.updated });
  const serialized = serializeJsonLd(schema);
  assert.doesNotMatch(serialized, /<|\u2028|\u2029/);
  assert.deepEqual(JSON.parse(serialized), schema);
});

test("real discovery handlers exclude held, review, draft and future records", async () => {
  const article = getPublicArticles()[0];
  const original = { ...article };
  try {
    for (const change of [{ status: "draft" }, { status: "review" }, { status: "held" }, { status: "published", date: "2099-01-01" }]) {
      Object.assign(article, original, change);
      assert.equal(getArticle(article.slug), undefined);
      const index = await search.GET().json();
      assert.ok(!index.stories.some((story) => story.slug === article.slug));
      assert.ok(!index.series.some((series) => series.slugs.includes(article.slug)));
      assert.ok(!sitemap().some((entry) => entry.url.endsWith(`/article/${article.slug}`)));
      assert.ok(!(await rss.GET().text()).includes(`/article/${article.slug}<`));
      assert.ok(!(await news.GET().text()).includes(`/article/${article.slug}<`));
    }
  } finally { Object.assign(article, original); }
  assert.equal(getArticle(original.slug), article);
});

test("feeds have the intended media type and keep the launch HOLD outside HTML", async () => {
  const response = rss.GET();
  assert.match(response.headers.get("content-type"), /^application\/rss\+xml; charset=utf-8$/);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, follow");
  assert.equal((await response.text()).match(/<item>/g).length, getPublicArticles().length);
  assert.equal(news.GET().headers.get("x-robots-tag"), "noindex, follow");
  assert.match(news.GET().headers.get("content-type"), /^application\/xml; charset=utf-8$/);
  assert.match(readFileSync(new URL("app/layout.tsx", root), "utf8"), /robots:\s*\{ index: false, follow: true \}/);
  assert.equal(robots().rules.allow, "/", "readers' noindex must not be hidden behind a new robots block");
});

test("discovery outputs never include unpublished draft-only slugs or private routes", async () => {
  const visible = new Set(getPublicArticles().map((article) => article.slug));
  const xml = await rss.GET().text();
  const locations = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
  const index = await search.GET().json();
  for (const file of readdirSync(new URL("content/drafts/", root)).filter((name) => name.endsWith(".md"))) {
    const slug = file.slice(0, -3);
    if (visible.has(slug)) continue; // The existing brief is independent of its same-slug expansion.
    assert.ok(!locations.has(`/article/${slug}`), slug);
    assert.ok(!xml.includes(`/article/${slug}<`), slug);
    assert.ok(!index.stories.some((story) => story.slug === slug), slug);
  }
  for (const location of locations) assert.doesNotMatch(location, /^\/(editorial|member|saved|search|api)(\/|$)/);
});

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(?:ts|tsx)$/.test(file) ? [file] : [];
  });
}

test("public server and all client import graphs cannot reach private manuscript projections", () => {
  const appRoot = path.resolve("app");
  const files = [...sourceFiles(appRoot), ...sourceFiles(path.resolve("components"))];
  const entrypoints = files.filter((file) => (file.startsWith(appRoot + path.sep) && !file.includes(`${path.sep}editorial${path.sep}`)) || /^['"]use client['"];/.test(readFileSync(file, "utf8")));
  const seen = new Set();
  function visit(file) {
    if (seen.has(file)) return;
    seen.add(file);
    assert.doesNotMatch(file, /editorial-drafts\.generated|editorial-draft-loader\.generated|editorial-draft-data\.generated|content\/(?:drafts|review-manuscripts)/, file);
    const source = readFileSync(file, "utf8").replace(/^\s*import\s+type\b[^;]+;/gm, "");
    const imports = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["']([^"']+)["']/g)].map((match) => match[1]);
    for (const specifier of imports) {
      if (!specifier.startsWith("@/") && !specifier.startsWith(".")) continue;
      const base = specifier.startsWith("@/") ? path.resolve(specifier.slice(2)) : path.resolve(path.dirname(file), specifier);
      const dependency = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")].find((candidate) => /\.(?:ts|tsx)$/.test(candidate) && existsSync(candidate));
      if (dependency) visit(dependency);
    }
  }
  entrypoints.forEach(visit);
  assert.ok(seen.has(path.resolve("app/article/[slug]/page.tsx")));
  assert.ok(seen.has(path.resolve("lib/article-metadata.ts")));
});
