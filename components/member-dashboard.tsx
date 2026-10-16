"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LIBRARY_KEY, NOTES_KEY, readNotes, readSaved, type Annotation, type ReadingState, type SavedRecord } from "@/lib/reader-storage";
import { deleteMemberRecord, importMemberReading, loadMemberSnapshot, memberRequest as api, updateMemberReadingState, type MemberSnapshot } from "@/lib/member-client";
import { readingStates } from "@/lib/member-contract";

type Profile = { displayName: string; email: string; bio: string; digestFrequency: string };
type Preferences = { textSize: string; theme: string };
type Story = { slug: string; title: string; section: string };

export function MemberDashboard({ initialProfile, stories }: { initialProfile: Profile; stories: Story[] }) {
  const [profile, setProfile] = useState(initialProfile);
  const [preferences, setPreferences] = useState<Preferences>({ textSize: "standard", theme: "system" });
  const [library, setLibrary] = useState<SavedRecord[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [status, setStatus] = useState("Loading your private member library…");
  const [busy, setBusy] = useState(true);
  const operation = useRef<AbortController | null>(null);
  const storyMap = useMemo(() => new Map(stories.map((story) => [story.slug, story])), [stories]);

  function applySnapshot(snapshot: MemberSnapshot) {
    setLibrary(snapshot.library);
    setAnnotations(snapshot.annotations);
    setPreferences(snapshot.preferences);
  }
  function beginOperation() {
    if (operation.current) return null;
    const controller = new AbortController();
    operation.current = controller;
    setBusy(true);
    return controller;
  }
  function endOperation(controller: AbortController) {
    if (operation.current === controller) { operation.current = null; setBusy(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    operation.current = controller;
    loadMemberSnapshot(controller.signal).then((snapshot) => {
      if (controller.signal.aborted) return;
      applySnapshot(snapshot); setStatus("");
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : "Member service is unavailable.");
    }).finally(() => endOperation(controller));
    return () => { operation.current?.abort(); operation.current = null; };
  }, []);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); const controller = beginOperation(); if (!controller) return; setStatus("Saving profile…");
    try { const data = await api<{ profile: Profile }>("/api/member/profile", { method: "PATCH", body: JSON.stringify(profile), signal: controller.signal }); if (!controller.signal.aborted) { setProfile(data.profile); setStatus("Profile saved."); } }
    catch (error) { if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : "Profile could not be saved."); }
    finally { endOperation(controller); }
  }

  async function savePreferences(next = preferences) {
    const controller = beginOperation(); if (!controller) return; setStatus("Saving reading settings…");
    try { const data = await api<{ preferences: Preferences }>("/api/member/preferences", { method: "PUT", body: JSON.stringify(next), signal: controller.signal }); if (!controller.signal.aborted) { setPreferences(data.preferences); setStatus("Reading settings saved."); } }
    catch (error) { if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : "Settings could not be saved."); }
    finally { endOperation(controller); }
  }

  async function importDeviceData() {
    const controller = beginOperation(); if (!controller) return; setStatus("Importing this browser’s library without removing local copies…");
    try {
      const localLibrary = readSaved(localStorage.getItem(LIBRARY_KEY));
      const localNotes = readNotes(localStorage.getItem(NOTES_KEY));
      const result = await importMemberReading(localLibrary, localNotes, controller.signal);
      if (controller.signal.aborted) return;
      if (result.snapshot) applySnapshot(result.snapshot);
      setStatus(`Imported ${result.stories} saved ${result.stories === 1 ? "story" : "stories"} and ${result.notes} ${result.notes === 1 ? "note" : "notes"}. Local copies remain on this device.${result.refreshError ? ` The account view could not be refreshed: ${result.refreshError} Reload to see the confirmed imports.` : ""}`);
    } catch (error) { if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : "Import could not be completed."); }
    finally { endOperation(controller); }
  }

  async function removeStory(slug: string) {
    const controller = beginOperation(); if (!controller) return;
    try {
      const result = await deleteMemberRecord("story", slug, controller.signal);
      if (!controller.signal.aborted) {
        setLibrary((items) => items.filter((item) => item.slug !== slug));
        setStatus(result.deviceCleared ? "Story removed from your member library and this browser’s saved stories. Independent local copies on other devices may remain." : "Story removed from your member library, but this browser’s saved copy could not be cleared. Remove it from Saved stories before importing again. Other-device copies may remain.");
      }
    }
    catch (error) { if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : "Story could not be removed."); }
    finally { endOperation(controller); }
  }

  async function changeReadingState(item: SavedRecord, state: ReadingState) {
    const controller = beginOperation(); if (!controller) return; setStatus("Saving reading state…");
    try {
      const saved = await updateMemberReadingState(item, state, controller.signal);
      if (controller.signal.aborted) return;
      setLibrary((items) => items.map((entry) => entry.slug === saved.slug ? saved : entry));
      setStatus(`Reading state saved as ${saved.state.toLowerCase()}.`);
    } catch (error) { if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : "Reading state could not be saved."); }
    finally { endOperation(controller); }
  }

  async function removeAnnotation(id: string) {
    const controller = beginOperation(); if (!controller) return;
    try {
      const result = await deleteMemberRecord("annotation", id, controller.signal);
      if (!controller.signal.aborted) {
        setAnnotations((items) => items.filter((item) => item.id !== id));
        setStatus(result.deviceCleared ? "Private note deleted from your member notebook and this browser. Independent local copies on other devices may remain." : "Private note deleted from your member notebook, but this browser’s cached copy could not be cleared. Remove it from Saved stories before importing again. Other-device copies may remain.");
      }
    }
    catch (error) { if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : "Note could not be deleted."); }
    finally { endOperation(controller); }
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
    <section className="member-panel"><div className="member-panel-heading"><div><span className="eyebrow">Library</span><h2>Saved records</h2></div><Link href="/archive">Explore the archive →</Link></div>{library.length === 0 ? <p>No synced records yet. Import this browser or save a record while signed in.</p> : <div className="member-list">{library.map((item) => { const story = storyMap.get(item.slug); return <article key={item.slug}><div><span>{story?.section || "Record"} · {item.state}</span><h3>{story ? <Link href={`/article/${item.slug}`}>{story.title}</Link> : item.slug}</h3><small>Saved {new Date(item.savedAt).toLocaleDateString()}</small></div><div><label>Reading state<select disabled={busy} aria-label={`Reading state for ${story?.title || item.slug}`} value={item.state} onChange={(event) => changeReadingState(item, event.target.value as ReadingState)}>{readingStates.map((state) => <option key={state} value={state}>{state}</option>)}</select></label><button disabled={busy} onClick={() => removeStory(item.slug)}>Remove</button></div></article>; })}</div>}</section>
    <section className="member-panel"><span className="eyebrow">Notebook</span><h2>Highlights &amp; private notes</h2>{annotations.length === 0 ? <p>No synced highlights yet.</p> : <div className="member-list">{annotations.map((item) => <article key={item.id}><div><blockquote>{item.text}</blockquote>{item.note && <p>{item.note}</p>}<Link href={`/article/${item.slug}#${item.anchor}`}>Return to record →</Link></div><button disabled={busy} onClick={() => removeAnnotation(item.id)}>Delete</button></article>)}</div>}</section>
  </div>;
}
