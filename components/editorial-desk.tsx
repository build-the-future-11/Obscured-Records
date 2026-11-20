"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { compareEditorialPriority, editorialOpenWork, editorialProgress, editorialStage, paginateEditorialQueue, type EditorialQueueItem } from "@/lib/editorial-queue";

type Collection = "all" | "new" | "archive";
type Blocker = "all" | "sources" | "checks" | "approval";
type Sort = "priority" | "title" | "shortest";

export function EditorialDesk({ items }: { items: EditorialQueueItem[] }) {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<Collection>("all");
  const [blocker, setBlocker] = useState<Blocker>("all");
  const [sort, setSort] = useState<Sort>("priority");
  const [kind, setKind] = useState("all");
  const [section, setSection] = useState("all");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const normalized = query.trim().toLocaleLowerCase();

  const filtered = useMemo(() => items.filter((item) => {
    const haystack = [item.title, item.dek, item.section, item.slug, ...item.tags].join(" ").toLocaleLowerCase();
    if (normalized && !haystack.includes(normalized)) return false;
    if (kind !== "all" && item.kind !== kind) return false;
    if (section !== "all" && item.section !== section) return false;
    if (collection === "new" && item.publishedInArchive) return false;
    if (collection === "archive" && !item.publishedInArchive) return false;
    if (blocker === "sources" && item.verifiedSources >= item.sourceCount) return false;
    if (blocker === "checks" && item.completedChecks >= item.totalChecks) return false;
    if (blocker === "approval" && item.status === "approved" && item.approvedBy) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "shortest") return a.words - b.words || a.title.localeCompare(b.title);
    return compareEditorialPriority(a, b);
  }), [items, normalized, collection, blocker, sort, kind, section]);

  const hasFilters = Boolean(normalized || collection !== "all" || blocker !== "all" || sort !== "priority" || kind !== "all" || section !== "all");
  const reset = () => { setQuery(""); setCollection("all"); setBlocker("all"); setSort("priority"); setKind("all"); setSection("all"); setPage(1); };
  const pagination = paginateEditorialQueue(filtered, page);
  const changePage = (value: number) => { setPage(value); resultsRef.current?.focus(); };

  return <section className="editorial-workbench" aria-labelledby="editorial-queue-title">
    <header className="editorial-workbench-heading"><div><span className="eyebrow">Review queue</span><h2 id="editorial-queue-title">Find the next draft that needs judgment.</h2></div><p>Priority puts active new records first, then drafts with the fewest open review signals. Held drafts come last. These signals never establish factual accuracy.</p></header>
    <div className="editorial-controls">
      <label className="editorial-search"><span>Search all drafts</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Title, topic, section or tag" maxLength={120} /></label>
      <label><span>Collection</span><select value={collection} onChange={(event) => { setCollection(event.target.value as Collection); setPage(1); }}><option value="all">All drafts</option><option value="new">New records</option><option value="archive">Archive counterparts</option></select></label>
      <label><span>Open work</span><select value={blocker} onChange={(event) => { setBlocker(event.target.value as Blocker); setPage(1); }}><option value="all">Any stage</option><option value="sources">Evidence review</option><option value="checks">Checklist</option><option value="approval">Human approval</option></select></label>
      <label><span>Draft type</span><select value={kind} onChange={(event) => { setKind(event.target.value); setPage(1); }}><option value="all">All draft types</option><option value="reporting-plan">Reporting plans</option><option value="manuscript">Manuscripts</option></select></label>
      <label><span>Section</span><select value={section} onChange={(event) => { setSection(event.target.value); setPage(1); }}><option value="all">All sections</option>{["World", "Business", "Science", "Technology", "Culture", "Underreported"].map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
      <label><span>Order</span><select value={sort} onChange={(event) => { setSort(event.target.value as Sort); setPage(1); }}><option value="priority">Review priority</option><option value="title">Title A–Z</option><option value="shortest">Shortest first</option></select></label>
    </div>
    <div className="editorial-results-line" aria-live="polite" ref={resultsRef} tabIndex={-1}><p>Showing <strong>{pagination.start}–{pagination.end}</strong> of {filtered.length} matching drafts ({items.length} total)</p>{hasFilters && <button type="button" onClick={reset}>Clear filters</button>}</div>
    {filtered.length ? <div className="editorial-grid">{pagination.items.map((item, index) => {
      const progress = editorialProgress(item);
      const open = editorialOpenWork(item);
      return <article key={item.slug}>
        <div className="editorial-card-meta"><span>{item.section} / {item.status}</span><span>{item.publishedInArchive ? "Archive counterpart" : "New record"}</span></div>
        <p className="editorial-draft-kind">{item.kind === "reporting-plan" ? "Reporting plan · reporting required" : "Manuscript · editorial review required"}</p>
        <h3><Link prefetch={false} href={`/editorial/draft/${item.slug}`}>{item.title}</Link></h3><p>{item.dek}</p>
        <div className="editorial-progress" aria-label={`${progress}% of recorded review signals complete`}><span style={{ width: `${progress}%` }} /></div>
        <dl><div><dt>Current stage</dt><dd>{editorialStage(item)}</dd></div><div><dt>Sources verified</dt><dd>{item.verifiedSources}/{item.sourceCount}</dd></div><div><dt>Checks complete</dt><dd>{item.completedChecks}/{item.totalChecks}</dd></div><div><dt>Open signals</dt><dd>{open}</dd></div><div><dt>Length</dt><dd>{item.words} words</dd></div></dl>
        <Link prefetch={false} className="editorial-open-draft" href={`/editorial/draft/${item.slug}`}>{index === 0 && pagination.page === 1 && sort === "priority" ? "Review first" : "Open manuscript"} →</Link>
        {item.publishedInArchive && <Link className="editorial-archive-link" href={`/article/${item.slug}`}>Open published counterpart →</Link>}
      </article>;
    })}</div> : <div className="editorial-empty"><p>No drafts match these filters.</p><button type="button" onClick={reset}>Show the full queue</button></div>}
    {pagination.totalPages > 1 && <nav className="editorial-pagination" aria-label="Editorial queue pages"><button type="button" disabled={pagination.page === 1} onClick={() => changePage(pagination.page - 1)}>← Previous</button><span>Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={pagination.page === pagination.totalPages} onClick={() => changePage(pagination.page + 1)}>Next →</button></nav>}
  </section>;
}
