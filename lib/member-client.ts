import type { Annotation, ReadingState, SavedRecord } from "./reader-storage.ts";
import { LIBRARY_KEY, NOTES_KEY } from "./reader-storage.ts";

export type MemberPreferences = { textSize: string; theme: string };
export type MemberSnapshot = { library: SavedRecord[]; annotations: Annotation[]; preferences: MemberPreferences };

/** Bound the whole exchange, including a response body that never completes. */
export async function memberRequest<T>(path: string, init: RequestInit = {}, timeoutMs = 10_000): Promise<T> {
  const controller = new AbortController();
  const upstream = init.signal;
  const cancel = () => controller.abort(new Error("Member request cancelled."));
  let rejectInterrupted: (error: unknown) => void = () => {};
  const interrupted = new Promise<never>((_, reject) => { rejectInterrupted = reject; });
  const onAbort = () => rejectInterrupted(controller.signal.reason);
  controller.signal.addEventListener("abort", onAbort, { once: true });
  upstream?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => controller.abort(new Error("The member request timed out. Please try again.")), timeoutMs);
  // Register the race before an already-aborted signal can reject it.
  const exchange = Promise.resolve().then(async () => {
    if (controller.signal.aborted) throw controller.signal.reason;
    const headers = new Headers(init.headers);
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    const response = await fetch(path, { ...init, headers, signal: controller.signal });
    const payload: unknown = await response.json().catch(() => null);
    const error = payload && typeof payload === "object" && "error" in payload ? payload.error : undefined;
    if (!response.ok) throw new Error(typeof error === "string" ? error : "Member service is unavailable.");
    if (!payload || typeof payload !== "object") throw new Error("The member service returned an unreadable response. Please try again.");
    return payload as T;
  });
  const result = Promise.race([exchange, interrupted]);
  if (upstream?.aborted) cancel();
  try { return await result; }
  finally {
    clearTimeout(timer);
    upstream?.removeEventListener("abort", cancel);
    controller.signal.removeEventListener("abort", onAbort);
  }
}

export async function loadMemberSnapshot(signal?: AbortSignal): Promise<MemberSnapshot> {
  const [library, annotations, preferences] = await Promise.all([
    memberRequest<{ items: SavedRecord[] }>("/api/member/library", { signal }),
    memberRequest<{ items: Annotation[] }>("/api/member/annotations", { signal }),
    memberRequest<{ preferences: MemberPreferences }>("/api/member/preferences", { signal }),
  ]);
  if (!Array.isArray(library.items) || !Array.isArray(annotations.items) || !preferences.preferences ||
      typeof preferences.preferences.textSize !== "string" || typeof preferences.preferences.theme !== "string") {
    throw new Error("The member library response was incomplete. Please try again.");
  }
  return { library: library.items, annotations: annotations.items, preferences: preferences.preferences };
}

export async function updateMemberReadingState(item: SavedRecord, state: ReadingState, signal?: AbortSignal): Promise<SavedRecord> {
  const receipt = await memberRequest<{ ok: boolean; item: SavedRecord }>("/api/member/library", {
    method: "PUT", body: JSON.stringify({ ...item, state }), signal,
  });
  if (receipt.ok !== true || receipt.item?.slug !== item.slug || receipt.item.state !== state || typeof receipt.item.savedAt !== "string") {
    throw new Error("The member service did not confirm the reading state. Your previous state is still shown.");
  }
  return receipt.item;
}

type MemberRecordKind = "story" | "annotation";

/** Delete only this identity, preserving even older or unrecognized local rows. */
export function removeLocalMemberCopy(kind: MemberRecordKind, identity: string, storage: Pick<Storage, "getItem" | "setItem"> = localStorage, notify = () => window.dispatchEvent(new Event("or-library-change"))) {
  const key = kind === "story" ? LIBRARY_KEY : NOTES_KEY;
  const raw = storage.getItem(key);
  if (raw === null) return;
  const items: unknown = JSON.parse(raw);
  if (!Array.isArray(items)) throw new Error("The local reading data could not be read safely.");
  const field = kind === "story" ? "slug" : "id";
  const retained = items.filter((item) => !item || typeof item !== "object" || item[field] !== identity);
  if (retained.length === items.length) return;
  storage.setItem(key, JSON.stringify(retained));
  notify();
}

export async function deleteMemberRecord(kind: MemberRecordKind, identity: string, signal?: AbortSignal, cleanup = removeLocalMemberCopy) {
  const path = kind === "story" ? `library?slug=${encodeURIComponent(identity)}` : `annotations?id=${encodeURIComponent(identity)}`;
  const receipt = await memberRequest<{ ok: boolean }>(`/api/member/${path}`, { method: "DELETE", signal });
  if (receipt.ok !== true) throw new Error("The member service did not confirm deletion. Please try again.");
  try { cleanup(kind, identity); return { accountDeleted: true, deviceCleared: true }; }
  catch { return { accountDeleted: true, deviceCleared: false }; }
}

export async function importMemberReading(library: SavedRecord[], annotations: Annotation[], signal?: AbortSignal) {
  let stories = 0;
  let notes = 0;
  try {
    for (const item of library) {
      const receipt = await memberRequest<{ ok: boolean }>("/api/member/library", { method: "PUT", body: JSON.stringify(item), signal });
      if (receipt.ok !== true) throw new Error("A saved-story write was not confirmed.");
      stories += 1;
    }
    for (const item of annotations) {
      const receipt = await memberRequest<{ ok: boolean }>("/api/member/annotations", { method: "POST", body: JSON.stringify(item), signal });
      if (receipt.ok !== true) throw new Error("A note write was not confirmed.");
      notes += 1;
    }
  } catch (error) {
    throw new Error(`Import stopped after ${stories} saved stories and ${notes} notes were confirmed. ${error instanceof Error ? error.message : "Please try again."} Local copies remain on this device; retrying updates matching records.`);
  }
  try { return { stories, notes, snapshot: await loadMemberSnapshot(signal), refreshError: null }; }
  catch (error) {
    // Writes have already been acknowledged. Failure to refresh must not undo
    // that acknowledgement or be swallowed by a later success message.
    return { stories, notes, snapshot: null, refreshError: error instanceof Error ? error.message : "The library could not be refreshed." };
  }
}

export async function saveReaderAnnotation(item: Annotation, accountSync: boolean, cache: (item: Annotation) => void, signal?: AbortSignal) {
  let saved = item;
  if (accountSync) {
    const receipt = await memberRequest<{ ok: boolean; item: Annotation }>("/api/member/annotations", { method: "POST", body: JSON.stringify(item), signal });
    if (receipt.ok !== true || receipt.item?.id !== item.id || receipt.item.slug !== item.slug) throw new Error("The member service did not confirm this highlight. Please retry.");
    saved = receipt.item;
  }
  try { cache(saved); return { accountSaved: accountSync, deviceCached: true }; }
  catch (error) {
    if (!accountSync) throw error;
    return { accountSaved: true, deviceCached: false };
  }
}
