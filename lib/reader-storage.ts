export type ReadingState = "Unread" | "Reading" | "Finished" | "Archived";
export type SavedRecord = { slug: string; state: ReadingState; savedAt: string };
export type Annotation = { id: string; slug: string; text: string; note: string; anchor: string; createdAt: string };
export const LIBRARY_KEY = "or-library-v1";
export const NOTES_KEY = "or-notes-v1";
export function readSaved(raw: string | null): SavedRecord[] {
  try { const data: unknown = JSON.parse(raw || "[]"); return Array.isArray(data) ? data.filter((item): item is SavedRecord => item && typeof item.slug === "string" && /^[a-z0-9-]+$/.test(item.slug) && ["Unread", "Reading", "Finished", "Archived"].includes(item.state) && typeof item.savedAt === "string").slice(-500) : []; } catch { return []; }
}
export function readNotes(raw: string | null): Annotation[] {
  try { const data: unknown = JSON.parse(raw || "[]"); return Array.isArray(data) ? data.filter((item): item is Annotation => item && typeof item.id === "string" && typeof item.slug === "string" && typeof item.text === "string" && item.text.length <= 2000 && typeof item.note === "string" && item.note.length <= 3000 && typeof item.anchor === "string" && /^[a-z0-9-]+$/.test(item.anchor) && typeof item.createdAt === "string").slice(-500) : []; } catch { return []; }
}
export function writeLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value.slice(-500) : value));
  window.dispatchEvent(new Event("or-library-change"));
}
