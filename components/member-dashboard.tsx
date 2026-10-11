"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LIBRARY_KEY, NOTES_KEY, readNotes, readSaved, type Annotation, type SavedRecord } from "@/lib/reader-storage";

type Profile = { displayName: string; email: string; bio: string; digestFrequency: string };
type Preferences = { textSize: string; theme: string };
type Story = { slug: string; title: string; section: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const payload: unknown = await response.json().catch(() => ({}));
  const error = payload && typeof payload === "object" && "error" in payload ? (payload as { error?: unknown }).error : undefined;
  if (!response.ok) throw new Error(typeof error === "string" ? error : "Member service is unavailable.");
  return payload as T;
}

export function MemberDashboard({ initialProfile, stories }: { initialProfile: Profile; stories: Story[] }) {
  const [profile, setProfile] = useState(initialProfile);
  const [preferences, setPreferences] = useState<Preferences>({ textSize: "standard", theme: "system" });
  const [library, setLibrary] = useState<SavedRecord[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [status, setStatus] = useState("Loading your private member library…");
  const [busy, setBusy] = useState(false);
  const storyMap = useMemo(() => new Map(stories.map((story) => [story.slug, story])), [stories]);

  async function refresh() {
    try {
      const [libraryData, annotationData, preferenceData] = await Promise.all([
        api<{ items: SavedRecord[] }>("/api/member/library"), api<{ items: Annotation[] }>("/api/member/annotations"), api<{ preferences: Preferences }>("/api/member/preferences"),
      ]);
      setLibrary(libraryData.items);
      setAnnotations(annotationData.items);
      setPreferences(preferenceData.preferences);
      setStatus("");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Member service is unavailable."); }
  }
  useEffect(() => {
    Promise.all([
      api<{ items: SavedRecord[] }>("/api/member/library"),
      api<{ items: Annotation[] }>("/api/member/annotations"),
      api<{ preferences: Preferences }>("/api/member/preferences"),
    ]).then(([libraryData, annotationData, preferenceData]) => {
      setLibrary(libraryData.items); setAnnotations(annotationData.items); setPreferences(preferenceData.preferences); setStatus("");
    }).catch((error: unknown) => setStatus(error instanceof Error ? error.message : "Member service is unavailable."));
  }, []);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setStatus("Saving profile…");
    try { const data = await api<{ profile: Profile }>("/api/member/profile", { method: "PATCH", body: JSON.stringify(profile) }); setProfile(data.profile); setStatus("Profile saved."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Profile could not be saved."); }
    finally { setBusy(false); }
  }

  async function savePreferences(next = preferences) {
    setBusy(true); setStatus("Saving reading settings…");
    try { const data = await api<{ preferences: Preferences }>("/api/member/preferences", { method: "PUT", body: JSON.stringify(next) }); setPreferences(data.preferences); setStatus("Reading settings saved."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Settings could not be saved."); }
    finally { setBusy(false); }
  }

  async function importDeviceData() {
    setBusy(true); setStatus("Importing this browser’s library without removing local copies…");
    try {
      const localLibrary = readSaved(localStorage.getItem(LIBRARY_KEY));
      const localNotes = readNotes(localStorage.getItem(NOTES_KEY));
      for (const item of localLibrary) await api<{ ok: true }>("/api/member/library", { method: "PUT", body: JSON.stringify(item) });
      for (const item of localNotes) await api<{ ok: true }>("/api/member/annotations", { method: "POST", body: JSON.stringify(item) });
      await refresh();
      setStatus(`Imported ${localLibrary.length} saved ${localLibrary.length === 1 ? "story" : "stories"} and ${localNotes.length} ${localNotes.length === 1 ? "note" : "notes"}. Local copies remain on this device.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Import could not be completed."); }
    finally { setBusy(false); }
  }

  async function removeStory(slug: string) {
    setBusy(true);
    try { await api<{ ok: true }>(`/api/member/library?slug=${encodeURIComponent(slug)}`, { method: "DELETE" }); setLibrary((items) => items.filter((item) => item.slug !== slug)); setStatus("Story removed from your member library."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Story could not be removed."); }
    finally { setBusy(false); }
  }

  async function removeAnnotation(id: string) {
    setBusy(true);
    try { await api<{ ok: true }>(`/api/member/annotations?id=${encodeURIComponent(id)}`, { method: "DELETE" }); setAnnotations((items) => items.filter((item) => item.id !== id)); setStatus("Private note deleted."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Note could not be deleted."); }
    finally { setBusy(false); }
  }

  return <div className="member-dashboard">
    <p className="member-status" role="status">{status}</p>
    <section className="member-summary" aria-label="Member library summary">
      <div><strong>{library.length}</strong><span>saved records</span></div>
      <div><strong>{annotations.length}</strong><span>private notes</span></div>
      <div><strong>{library.filter((item) => item.state === "Finished").length}</strong><span>finished</span></div>
    </section>
    <section className="member-panel member-import"><div><span className="eyebrow">Bring your reading with you</span><h2>Import this browser</h2><p>Copy locally saved stories and highlights into your account. Nothing is removed from this device, and matching records are updated rather than duplicated.</p></div><button disabled={busy} onClick={importDeviceData}>Import local reading</button></section>
    <div className="member-grid">
      <section className="member-panel"><span className="eyebrow">Account</span><h2>Your profile</h2><form onSubmit={saveProfile}><label>Display name<input value={profile.displayName} maxLength={80} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} /></label><label>Email<input value={profile.email} readOnly /></label><label>About you<textarea value={profile.bio} maxLength={500} rows={4} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} /></label><label>Optional brief preference<select value={profile.digestFrequency} onChange={(event) => setProfile({ ...profile, digestFrequency: event.target.value })}><option value="none">No digest</option><option value="weekly">Weekly preference</option><option value="monthly">Monthly preference</option></select></label><small>This preference does not subscribe you to email or promise delivery.</small><button disabled={busy}>Save profile</button></form></section>
      <section className="member-panel"><span className="eyebrow">Across devices</span><h2>Reading settings</h2><label>Text size<select value={preferences.textSize} onChange={(event) => setPreferences({ ...preferences, textSize: event.target.value })}><option value="standard">Standard</option><option value="large">Large</option><option value="larger">Larger</option></select></label><label>Theme<select value={preferences.theme} onChange={(event) => setPreferences({ ...preferences, theme: event.target.value })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><button disabled={busy} onClick={() => savePreferences()}>Save settings</button><p className="member-privacy">Member records are private to your signed-in account. Obscured Records does not sell this reading data or infer payment status from sign-in.</p></section>
    </div>
    <section className="member-panel"><div className="member-panel-heading"><div><span className="eyebrow">Library</span><h2>Saved records</h2></div><Link href="/archive">Explore the archive →</Link></div>{library.length === 0 ? <p>No synced records yet. Import this browser or save a record while signed in.</p> : <div className="member-list">{library.map((item) => { const story = storyMap.get(item.slug); return <article key={item.slug}><div><span>{story?.section || "Record"} · {item.state}</span><h3>{story ? <Link href={`/article/${item.slug}`}>{story.title}</Link> : item.slug}</h3><small>Saved {new Date(item.savedAt).toLocaleDateString()}</small></div><button disabled={busy} onClick={() => removeStory(item.slug)}>Remove</button></article>; })}</div>}</section>
    <section className="member-panel"><span className="eyebrow">Notebook</span><h2>Highlights &amp; private notes</h2>{annotations.length === 0 ? <p>No synced highlights yet.</p> : <div className="member-list">{annotations.map((item) => <article key={item.id}><div><blockquote>{item.text}</blockquote>{item.note && <p>{item.note}</p>}<Link href={`/article/${item.slug}#${item.anchor}`}>Return to record →</Link></div><button disabled={busy} onClick={() => removeAnnotation(item.id)}>Delete</button></article>)}</div>}</section>
  </div>;
}
