"use client";
import { editorialEvent } from "@/lib/editorial-events";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CatalogStory } from "@/lib/catalog";
import { LIBRARY_KEY, NOTES_KEY, readSaved, readNotes, writeLocal, type SavedRecord, type Annotation, type ReadingState } from "@/lib/reader-storage";
import { StoryCard } from "./story-card";
import { deleteMemberRecord, memberRequest } from "@/lib/member-client";
export function SaveStory({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);
  const [accountSync, setAccountSync] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const sync = () => { try { if (!accountSync) setSaved(readSaved(localStorage.getItem(LIBRARY_KEY)).some((s) => s.slug === slug)); } catch { setMessage("Device storage unavailable."); } };
    sync();
    memberRequest<{ items: SavedRecord[] }>("/api/member/library", { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted || !Array.isArray(data.items)) return;
      setAccountSync(true); setSaved(data.items.some((item) => item.slug === slug));
    }).catch(() => {});
    window.addEventListener("storage", sync); window.addEventListener("or-library-change", sync);
    return () => { controller.abort(); window.removeEventListener("storage", sync); window.removeEventListener("or-library-change", sync); };
  }, [slug, accountSync]);
  useEffect(() => () => { pending.current?.abort(); pending.current = null; }, []);
  async function toggle() {
    if (pending.current) return;
    const exists = saved;
    if (accountSync) {
      const controller = new AbortController(); pending.current = controller; setBusy(true);
      try {
        let resultMessage = "Saved to your member library.";
        if (exists) {
          const result = await deleteMemberRecord("story", slug, controller.signal);
          resultMessage = result.deviceCleared ? "Removed from your member library and this browser’s saved stories. Independent local copies on other devices may remain." : "Removed from your member library, but this browser’s saved copy could not be cleared. Remove it from Saved stories before importing again. Other-device copies may remain.";
        } else {
          const receipt = await memberRequest<{ ok: boolean }>("/api/member/library", { method: "PUT", body: JSON.stringify({ slug, state: "Unread", savedAt: new Date().toISOString() }), signal: controller.signal });
          if (receipt.ok !== true) throw new Error("The saved story was not confirmed.");
        }
        if (controller.signal.aborted) return;
        setSaved(!exists); setMessage(resultMessage); editorialEvent("save", { slug, action: exists ? "remove" : "save" });
      } catch (error) { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Member sync could not be confirmed. Please try again."); }
      finally { if (pending.current === controller) { pending.current = null; setBusy(false); } }
      return;
    }
    try { const items = readSaved(localStorage.getItem(LIBRARY_KEY)); writeLocal(LIBRARY_KEY, exists ? items.filter((s) => s.slug !== slug) : [...items, { slug, state: "Unread", savedAt: new Date().toISOString() }]); editorialEvent("save", { slug, action: exists ? "remove" : "save" }); setMessage(exists ? "Removed from saved stories." : "Saved on this device."); } catch { setMessage("Could not save. Device storage is unavailable or full."); }
  }
  return <div className="save-control"><button aria-pressed={saved} disabled={busy} onClick={toggle}>{busy ? "Saving…" : saved ? "✓ Saved" : "+ Save story"}</button><small role="status">{message}</small></div>;
}
export function ReadingLibrary({ stories }: { stories: CatalogStory[] }) {
  const [saved, setSaved] = useState<SavedRecord[]>([]);
  const [notes, setNotes] = useState<Annotation[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  useEffect(() => { const sync = () => { try { setSaved(readSaved(localStorage.getItem(LIBRARY_KEY))); setNotes(readNotes(localStorage.getItem(NOTES_KEY))); } catch { setError("Device storage is unavailable."); } setReady(true); }; sync(); window.addEventListener("storage", sync); window.addEventListener("or-library-change", sync); return () => { window.removeEventListener("storage", sync); window.removeEventListener("or-library-change", sync); }; }, []);
  function change(slug: string, state?: ReadingState) { try { const items = readSaved(localStorage.getItem(LIBRARY_KEY)); writeLocal(LIBRARY_KEY, state ? items.map((s) => s.slug === slug ? { ...s, state } : s) : items.filter((s) => s.slug !== slug)); } catch { setError("Could not update your saved stories."); } }
  return <div className="library"><p className="device-note">Saved only in this browser. Stories and notes do not sync to an account. Clearing browser data removes them.</p>{error && <p role="alert">{error}</p>}
    <label className="library-filter">Reading state <select value={filter} onChange={(event) => setFilter(event.target.value)}>{["All", "Unread", "Reading", "Finished", "Archived"].map((state) => <option key={state}>{state}</option>)}</select></label>
    {!ready && <p role="status">Loading your device library…</p>}
    {ready && saved.filter((item) => filter === "All" || item.state === filter).length === 0 && <div className="empty-state"><h2>{saved.length ? "No stories in this state" : "A place for your next read"}</h2><p>Use Save story on any record, then return here when you have time.</p><Link href="/archive">Explore the archive →</Link></div>}
    {saved.filter((item) => filter === "All" || item.state === filter).map((item) => { const story = stories.find((s) => s.slug === item.slug); return <section className="saved-item" key={item.slug}>{story ? <StoryCard story={story} /> : <p>This saved record is no longer published.</p>}<div className="saved-actions"><label>Reading state<select aria-label={`Reading state for ${story?.title || item.slug}`} value={item.state} onChange={(event) => change(item.slug, event.target.value as ReadingState)}>{["Unread", "Reading", "Finished", "Archived"].map((state) => <option key={state}>{state}</option>)}</select></label><button onClick={() => change(item.slug)}>Remove saved story</button></div></section>; })}
    <section className="saved-notes"><h2>Highlights &amp; private notes</h2>{!notes.length && <p>Select a passage in a record, then use “Highlight selected text” in its reader tools.</p>}{notes.map((note) => { const story = stories.find((s) => s.slug === note.slug); return <article key={note.id}><blockquote>{note.text}</blockquote>{note.note && <p>{note.note}</p>}<p><time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleDateString()}</time></p>{story && <Link href={`/article/${note.slug}#${note.anchor}`}>Return to {story.title} →</Link>}<button onClick={() => { try { writeLocal(NOTES_KEY, readNotes(localStorage.getItem(NOTES_KEY)).filter((n) => n.id !== note.id)); } catch { setError("Could not remove this note."); } }}>Delete highlight</button></article>; })}</section>
  </div>;
}
