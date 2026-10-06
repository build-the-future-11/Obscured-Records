"use client";
import { useEffect, useState } from "react";
import type { CatalogStory } from "@/lib/catalog";
import { emptyFilters, filterCatalog, parseFilters, type Filters } from "@/lib/catalog-filter";
import { StoryCard } from "./story-card";
export function ArchiveBrowser({ stories, initial, series, search = false }: { stories: CatalogStory[]; initial: Filters; series: { slug: string; title: string }[]; search?: boolean }) {
  const [filters, setFilters] = useState(initial);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const pop = () => {
      const params = new URLSearchParams(location.search);
      // Match the server: the first occurrence wins for repeated parameters.
      setFilters(parseFilters(Object.fromEntries(Object.keys(emptyFilters).map((key) => [key, params.get(key)]))));
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  function update(next: Filters) {
    setFilters(next);
    const params = new URLSearchParams(Object.entries(next).filter(([, value]) => value));
    history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
  }
  const results = filterCatalog(stories, filters);
  const options: { key: keyof Filters; label: string; entries: [string, string][] }[] = [
    { key: "year", label: "Publication year", entries: [...new Set(stories.map((s) => s.isoDate.slice(0, 4)))].sort().reverse().map((y) => [y, y]) },
    { key: "month", label: "Publication month", entries: [...new Set(stories.map((s) => s.isoDate.slice(5, 7)))].sort().map((m) => [m, new Date(`2000-${m}-01T12:00:00Z`).toLocaleDateString("en", { month: "long", timeZone: "UTC" })]) },
    { key: "topic", label: "Topic", entries: [...new Set(stories.flatMap((s) => s.tags))].sort().map((tag) => [tag, tag]) },
    { key: "author", label: "Author", entries: [...new Map(stories.map((s) => [s.authorSlug, s.author])).entries()] },
    { key: "section", label: "Section", entries: [...new Set(stories.map((s) => s.section))].sort().map((section) => [section, section]) },
    { key: "format", label: "Format", entries: [["feature", "Expanded feature"], ["brief", "Brief record"]] },
    { key: "series", label: "Reading series", entries: series.map((s) => [s.slug, s.title]) },
  ];
  return <div className="archive-browser"><form method="get" onSubmit={(event) => { event.preventDefault(); update(filters); }} className="archive-controls">
    <div className="archive-query"><label htmlFor="archive-q">Search by event, subject, author or record number</label><div><input id="archive-q" name="q" type="search" maxLength={200} value={filters.q} onChange={(event) => update({ ...filters, q: event.target.value })} placeholder="What would you like to understand?" /><button type="submit">Search</button></div></div>
    <details className="filter-disclosure" open={!search}><summary>Refine the archive</summary><div className="archive-filters">{options.map(({ key, label, entries }) => <label key={key}>{label}<select name={key} value={filters[key]} onChange={(event) => update({ ...filters, [key]: event.target.value })}><option value="">All</option>{entries.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>)}</div></details>
    <div className="archive-toolbar"><button type="button" onClick={() => update(emptyFilters)}>Clear filters</button><button type="button" aria-pressed={compact} onClick={() => setCompact(!compact)}>Compact list</button></div>
    </form><p className="result-count" role="status" aria-live="polite">{results.length} {results.length === 1 ? "record" : "records"}{filters.q ? ` matching “${filters.q}”` : " in the archive"}</p><div className="archive-results">{results.map((story) => <StoryCard key={story.slug} story={story} variant={compact ? "compact" : "horizontal"} query={filters.q} />)}</div>
    {!results.length && <div className="empty-state"><h2>No matching records</h2><p>Try fewer filters, another spelling or a broader subject.</p><button type="button" onClick={() => update(emptyFilters)}>Show all records</button></div>}
  </div>;
}
