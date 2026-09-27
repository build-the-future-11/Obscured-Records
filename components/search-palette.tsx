"use client";
import { editorialEvent } from "@/lib/editorial-events";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { getCatalog, getTopics, getSeries } from "@/lib/catalog";
import { MatchText } from "./story-card";
type Index = { stories: ReturnType<typeof getCatalog>; topics: ReturnType<typeof getTopics>; series: ReturnType<typeof getSeries>; authors: { slug: string; name: string }[] };
export function SearchPalette() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState<Index | null>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const open = () => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.current?.showModal(); input.current?.focus();
      try { const saved: unknown = JSON.parse(localStorage.getItem("or-recent-searches") || "[]"); if (Array.isArray(saved)) setRecent(saved.filter((s): s is string => typeof s === "string").slice(0, 5)); } catch { /* Storage is optional. */ }
      setError(false);
      fetch("/api/search").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((data) => setIndex(data as Index)).catch(() => setError(true));
    };
    const key = (event: KeyboardEvent) => {
      const editing = event.target instanceof HTMLElement && (event.target.isContentEditable || !!event.target.closest("input, textarea, select"));
      if ((event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !editing && !event.altKey && !event.ctrlKey && !event.metaKey)) { event.preventDefault(); if (!dialog.current?.open) open(); }
    };
    document.addEventListener("keydown", key); window.addEventListener("or-open-search", open);
    return () => { document.removeEventListener("keydown", key); window.removeEventListener("or-open-search", open); };
  }, []);
  const q = query.toLowerCase().trim();
  const matches = (text: string) => q.split(/\s+/).every((term) => text.toLowerCase().includes(term));
  const groups = index && q ? [
    { title: "Stories", items: index.stories.filter((s) => matches([s.title, s.excerpt, s.author, ...s.tags].join(" "))).slice(0, 6).map((s) => ({ title: s.title, href: `/article/${s.slug}`, context: `${s.section} · ${s.date}` })) },
    { title: "Topics", items: index.topics.filter((t) => matches(t.name)).slice(0, 4).map((t) => ({ title: t.name, href: `/topic/${t.slug}`, context: `${t.count} records` })) },
    { title: "Authors", items: index.authors.filter((a) => matches(a.name)).map((a) => ({ title: a.name, href: `/author/${a.slug}`, context: "Author" })) },
    { title: "Series", items: index.series.filter((s) => matches(s.title + " " + s.description)).map((s) => ({ title: s.title, href: `/series/${s.slug}`, context: "Reading series" })) },
  ].filter((group) => group.items.length) : [];
  function close(remember = false) {
    if (remember && q) { editorialEvent("search_success"); try { localStorage.setItem("or-recent-searches", JSON.stringify([query.trim(), ...recent.filter((s) => s !== query.trim())].slice(0, 5))); } catch { /* Search works without persistence. */ } }
    dialog.current?.close();
  }
  return <dialog ref={dialog} className="search-dialog" aria-labelledby="palette-title" onClose={() => opener.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) close(); }} onKeyDown={(event) => {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    const links = Array.from(dialog.current?.querySelectorAll<HTMLElement>("[data-result]") || []);
    if (!links.length) return;
    event.preventDefault(); const position = links.indexOf(document.activeElement as HTMLElement); links[(position + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length]?.focus();
  }}><div className="palette-top"><h2 id="palette-title">Search Obscured Records</h2><button onClick={() => close()} aria-label="Close search">Close <kbd>Esc</kbd></button></div>
    <label className="sr-only" htmlFor="palette-query">Search stories, topics, authors and series</label><input ref={input} id="palette-query" type="search" value={query} maxLength={200} placeholder="An event, a subject, a question…" onChange={(event) => setQuery(event.target.value)} />
    <div className="palette-results"><p className="sr-only" role="status">{q ? `${groups.reduce((sum, g) => sum + g.items.length, 0)} suggestions` : "Type to search"}</p>
      {error && <p role="alert">Instant search is unavailable. <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={() => close()}>Use the search page.</Link></p>}
      {!index && !error && <p role="status">Loading the archive…</p>}
      {groups.map((group) => <section key={group.title}><h3>{group.title}</h3>{group.items.map((item) => <Link data-result key={item.href} href={item.href} onClick={() => close(true)}><span><MatchText text={item.title} query={query} /></span><small>{item.context}</small></Link>)}</section>)}
      {q && index && !groups.length && <p>No match yet. Try a broader subject.</p>}
      {!q && recent.length > 0 && <section><h3>Recent on this device</h3>{recent.map((value) => <button data-result key={value} onClick={() => setQuery(value)}>{value}</button>)}<button onClick={() => { try { localStorage.removeItem("or-recent-searches"); } catch {} setRecent([]); }}>Clear recent searches</button></section>}
      <section><h3>{q ? "Continue exploring" : "Go to"}</h3>{[["Archive", "/archive"], ["Topics", "/topics"], ["Reading series", "/series"], ["Saved stories", "/saved"], ["Newsletter", "/newsletter"]].map(([label, href]) => <Link data-result key={href} href={href} onClick={() => close()}>{label}<span aria-hidden="true">↗</span></Link>)}{q && <Link data-result href={`/search?q=${encodeURIComponent(query)}`} onClick={() => close(true)}>All results and filters →</Link>}</section>
    </div><p className="palette-hint">↑ ↓ Move through results · Enter Open · Esc Close</p>
  </dialog>;
}
export function SearchTrigger() { return <Link href="/search" className="search-trigger" onClick={(event) => { event.preventDefault(); window.dispatchEvent(new Event("or-open-search")); }} aria-label="Search the archive">Search <kbd>⌘ K</kbd></Link>; }
