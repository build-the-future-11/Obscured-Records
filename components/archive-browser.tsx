"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import type { CatalogStory } from "@/lib/catalog";
import { emptyFilters, filterCatalog, parseFilters, type Filters } from "@/lib/catalog-filter";
import { StoryCard } from "./story-card";
type ArchiveProps = { stories: CatalogStory[]; initial: Filters; series: { slug: string; title: string }[]; search?: boolean };
function subscribeToLocation(notify: () => void) {
  const events = ["popstate", "pageshow", "or-archive-location"];
  for (const event of events) window.addEventListener(event, notify);
  return () => { for (const event of events) window.removeEventListener(event, notify); };
}
const locationSearch = () => window.location.search;

export function ArchiveBrowser({ stories, initial, series, search = false }: ArchiveProps) {
  // The URL remains authoritative after Back, bfcache restore and same-route links.
  // Server markup uses the same parsed parameters until hydration can read location.
  const initialQuery = new URLSearchParams(initial).toString();
  // Both callers already read server searchParams and render dynamically. The
  // router subscription covers cached navigation even when initial props repeat.
  const routeQuery = useSearchParams()?.toString() ?? initialQuery;
  const query = useSyncExternalStore(subscribeToLocation, locationSearch, () => initialQuery);
  useEffect(() => {
    // Next can render router context before HistoryUpdater writes the URL in an
    // insertion effect. Notify after that commit, including A -> local B -> A.
    window.dispatchEvent(new Event("or-archive-location"));
  }, [routeQuery]);
  const params = new URLSearchParams(query);
  // Keep a trailing space while typing a multi-word query; matching trims terms.
  const filters = { ...parseFilters(params), q: (params.get("q") || "").slice(0, 200) };
  const [compact, setCompact] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  function update(next: Filters) {
    const params = new URLSearchParams(Object.entries(next).filter(([, value]) => value));
    // Both supported routers preserve their metadata for external history calls.
    history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
    window.dispatchEvent(new Event("or-archive-location"));
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
  const active = [
    ...(filters.q ? [{ key: "q" as keyof Filters, label: "Search", value: filters.q }] : []),
    ...options.filter(({ key }) => filters[key]).map(({ key, label, entries }) => ({ key, label, value: entries.find(([value]) => value === filters[key])?.[1] || filters[key] })),
  ];
  function removeFilter(key: keyof Filters) {
    update({ ...filters, [key]: "" });
    const control = form.current?.elements.namedItem("q");
    if (control instanceof HTMLElement) control.focus();
  }
  return <div className="archive-browser"><form ref={form} method="get" onSubmit={(event) => { event.preventDefault(); update(filters); }} className="archive-controls">
    <div className="archive-query"><label htmlFor="archive-q">Search by event, subject, author or record number</label><div><input id="archive-q" name="q" type="search" maxLength={200} value={filters.q} aria-describedby="archive-search-scope" onChange={(event) => update({ ...filters, q: event.target.value })} placeholder="What would you like to understand?" /><button type="submit">Search</button></div><p id="archive-search-scope" className="archive-help">Searches titles, summaries, tags and record details. Article bodies and linked sources are not searched.</p></div>
    <details className="filter-disclosure" open={!search || options.some(({ key }) => Boolean(filters[key]))}><summary>Refine the archive{active.length > (filters.q ? 1 : 0) ? ` (${active.length - (filters.q ? 1 : 0)} selected)` : ""}</summary><div className="archive-filters">{options.map(({ key, label, entries }) => <label key={key}>{label}<select name={key} value={filters[key]} onChange={(event) => update({ ...filters, [key]: event.target.value })}><option value="">All</option>{filters[key] && !entries.some(([value]) => value === filters[key]) && <option value={filters[key]}>{filters[key]} (not in archive)</option>}{entries.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>)}</div></details>
    <div className="archive-toolbar"><label className="archive-sort">Sort records<select name="sort" value={filters.sort} onChange={(event) => update({ ...filters, sort: event.target.value })}><option value="">Newest publication first</option><option value="oldest">Oldest publication first</option><option value="title">Title A–Z</option></select></label><div><button type="button" onClick={() => update(emptyFilters)} disabled={!active.length && !filters.sort}>Clear filters</button><button type="button" aria-pressed={compact} onClick={() => setCompact(!compact)}>Compact list</button></div></div>
    </form>{active.length > 0 && <div className="active-filters" aria-label="Active filters"><span>Filtered by</span>{active.map(({ key, label, value }) => <button key={key} type="button" onClick={() => removeFilter(key)} aria-label={`Remove ${label.toLowerCase()} filter: ${value}`}>{label}: {value} <span aria-hidden="true">×</span></button>)}</div>}<p className="result-count" role="status" aria-live="polite">{results.length} of {stories.length} {stories.length === 1 ? "record" : "records"}{filters.q ? ` matching “${filters.q}”` : active.length ? " match these filters" : " in the archive"}</p><div className="archive-results">{results.map((story) => <StoryCard key={story.slug} story={story} variant={compact ? "compact" : "horizontal"} query={filters.q} />)}</div>
    {!results.length && <div className="empty-state"><h2>No matching records</h2><p>Try fewer filters, another spelling or a broader subject.</p><button type="button" onClick={() => update(emptyFilters)}>Show all records</button></div>}
  </div>;
}
