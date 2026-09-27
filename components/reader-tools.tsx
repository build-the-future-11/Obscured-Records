"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SaveStory } from "./reader-library";
import { NOTES_KEY, readNotes, writeLocal } from "@/lib/reader-storage";
type Heading = { id: string; label: string };
export function ReaderTools({ slug, headings }: { slug: string; headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id || "");
  const [size, setSize] = useState("standard");
  const [theme, setTheme] = useState("system");
  const [selection, setSelection] = useState<{ text: string; anchor: string } | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const notebook = useRef<HTMLDialogElement>(null);
  const highlightButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".article-page");
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { let preference = "system", text = "standard"; try { preference = localStorage.getItem("or-reader-theme") || "system"; text = localStorage.getItem("or-reader-size") || "standard"; } catch {} setTheme(preference); setSize(text); if (article) { article.dataset.readerTheme = preference === "system" ? (media.matches ? "dark" : "light") : preference; article.dataset.readerSize = text; } };
    apply(); media.addEventListener("change", apply); window.addEventListener("or-reader-preference", apply);
    const update = () => { const passed = headings.filter(({ id }) => { const element = document.getElementById(id); return element && element.getBoundingClientRect().top <= 160; }); setActive(passed.at(-1)?.id || headings[0]?.id || ""); };
    window.addEventListener("scroll", update, { passive: true }); update();
    const selected = () => { if (notebook.current?.open) return; const range = window.getSelection(); if (!range || range.isCollapsed || !range.rangeCount) { setSelection(null); return; } const elementFor = (node: Node | null) => node instanceof Element ? node : node?.parentElement; const parent = elementFor(range.anchorNode)?.closest("[data-passage]"); const end = elementFor(range.focusNode)?.closest("[data-passage]"); const text = range.toString().trim(); setSelection(parent && end === parent && text && text.length <= 2000 ? { text, anchor: parent.id } : null); };
    document.addEventListener("selectionchange", selected);
    return () => { media.removeEventListener("change", apply); window.removeEventListener("or-reader-preference", apply); window.removeEventListener("scroll", update); document.removeEventListener("selectionchange", selected); };
  }, [headings]);
  useEffect(() => {
    // CSS Highlights paints stored passages without modifying React's article DOM.
    const api = window as unknown as { Highlight?: new (...ranges: Range[]) => unknown };
    const registry = (CSS as unknown as { highlights?: { set: (key: string, value: unknown) => void; delete: (key: string) => void } }).highlights;
    if (!api.Highlight || !registry) return;
    const paint = () => {
      const ranges: Range[] = [];
      try {
        for (const saved of readNotes(localStorage.getItem(NOTES_KEY)).filter((entry) => entry.slug === slug)) {
          const paragraph = document.getElementById(saved.anchor);
          const start = paragraph?.textContent?.indexOf(saved.text) ?? -1;
          if (!paragraph || start < 0) continue;
          const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
          let offset = 0, node: Node | null, beginning: { node: Node; offset: number } | null = null;
          while ((node = walker.nextNode())) {
            const length = node.textContent?.length || 0;
            if (!beginning && start < offset + length) beginning = { node, offset: start - offset };
            if (beginning && start + saved.text.length <= offset + length) {
              const range = document.createRange(); range.setStart(beginning.node, beginning.offset); range.setEnd(node, start + saved.text.length - offset); ranges.push(range); break;
            }
            offset += length;
          }
        }
        registry.set("saved-passages", new api.Highlight!(...ranges));
      } catch { /* Stored excerpts remain accessible from the library. */ }
    };
    paint(); window.addEventListener("or-library-change", paint); window.addEventListener("storage", paint);
    return () => { registry.delete("saved-passages"); window.removeEventListener("or-library-change", paint); window.removeEventListener("storage", paint); };
  }, [slug]);
  function preference(key: string, value: string) { try { localStorage.setItem(key, value); window.dispatchEvent(new Event("or-reader-preference")); } catch { setMessage("Settings could not be saved on this device."); } }
  return <aside className="reader-rail" aria-label="Reader tools"><SaveStory slug={slug} />
    <details className="contents" open><summary>In this record</summary><nav aria-label="Table of contents">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} aria-current={active === heading.id ? "location" : undefined}>{heading.label}</a>)}</nav></details>
    <details className="reader-settings"><summary>Reading settings</summary><label>Text size<select aria-label="Text size" value={size} onChange={(e) => preference("or-reader-size", e.target.value)}><option value="standard">Standard</option><option value="large">Large</option><option value="larger">Larger</option></select></label><label>Reading theme<select aria-label="Reading theme" value={theme} onChange={(e) => preference("or-reader-theme", e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label></details>
    <button className="highlight-trigger" ref={highlightButton} onMouseDown={(e) => e.preventDefault()} onClick={() => { if (!selection) { setMessage("Select text within a paragraph first, up to 2,000 characters."); return; } setNote(""); notebook.current?.showModal(); }}>Highlight selected text</button><small>Private to this browser. <Link href="/saved">Your notes →</Link></small><p className="reader-status" role="status">{message}</p>
    <dialog ref={notebook} className="source-dialog" aria-labelledby="note-title" onClose={() => highlightButton.current?.focus()}><h2 id="note-title">Keep this passage</h2><blockquote>{selection?.text}</blockquote><label htmlFor="private-note">Private note (optional)</label><textarea id="private-note" value={note} maxLength={3000} onChange={(e) => setNote(e.target.value)} rows={4} /><p>Saved only on this device. Visible to anyone who uses this browser.</p><div className="dialog-actions"><button onClick={() => { if (!selection) return; try { writeLocal(NOTES_KEY, [...readNotes(localStorage.getItem(NOTES_KEY)), { id: crypto.randomUUID(), slug, text: selection.text, anchor: selection.anchor, note, createdAt: new Date().toISOString() }]); setMessage("Passage saved in your highlights."); notebook.current?.close(); } catch { setMessage("Could not save this highlight. Device storage may be full."); notebook.current?.close(); } }}>Save highlight</button><button onClick={() => notebook.current?.close()}>Cancel</button></div></dialog>
  </aside>;
}
export function SourcePreview({ source, index }: { source: { label: string; url: string; kind: string; publisher: string }; index: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [message, setMessage] = useState("");
  return <><button ref={trigger} className="source-preview-button" aria-label={`Preview source ${index}: ${source.label}`} onClick={() => { setMessage(""); dialog.current?.showModal(); }}>Preview {index}</button><dialog ref={dialog} className="source-dialog" aria-labelledby={`source-title-${index}`} onClose={() => trigger.current?.focus()}><span className="eyebrow">{source.kind}</span><h2 id={`source-title-${index}`}>{source.label}</h2><p>{source.publisher}</p><p className="source-domain">{new URL(source.url).hostname}</p><p>This source is included in the record’s reading trail. It is not a claim-level citation or independent verification of every statement.</p><div className="dialog-actions"><a href={source.url} target="_blank" rel="noreferrer">Open source ↗</a><button onClick={async () => { try { await navigator.clipboard.writeText(source.url); setMessage("Source link copied."); } catch { setMessage("Copy unavailable. Use the source link above."); } }}>Copy source link</button><button onClick={() => dialog.current?.close()}>Return to source</button></div><p role="status">{message}</p></dialog></>;
}
