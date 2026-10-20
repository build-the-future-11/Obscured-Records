export type SyncedLibraryItem = {
  slug: string;
  state: "Unread" | "Reading" | "Finished" | "Archived";
  savedAt: string;
};

const states = new Set<SyncedLibraryItem["state"]>(["Unread", "Reading", "Finished", "Archived"]);

function isSyncedLibraryItem(value: unknown): value is SyncedLibraryItem {
  return Boolean(value && typeof value === "object" &&
    typeof (value as SyncedLibraryItem).slug === "string" &&
    states.has((value as SyncedLibraryItem).state) &&
    typeof (value as SyncedLibraryItem).savedAt === "string");
}

export async function updateMemberReadingState(
  item: SyncedLibraryItem,
  state: SyncedLibraryItem["state"],
  fetcher: typeof fetch = fetch,
): Promise<SyncedLibraryItem> {
  const response = await fetcher("/api/member/library", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    // Keep the first-save timestamp; the API preserves it on existing records.
    body: JSON.stringify({ ...item, state }),
  });
  const payload: unknown = await response.json().catch(() => ({}));
  const error = payload && typeof payload === "object" && "error" in payload
    ? (payload as { error?: unknown }).error
    : undefined;
  if (!response.ok) {
    throw new Error(typeof error === "string" ? error : "Member service is unavailable.");
  }
  const updated = payload && typeof payload === "object" && "item" in payload
    ? (payload as { item?: unknown }).item
    : undefined;
  if (!isSyncedLibraryItem(updated)) {
    throw new Error("The saved story could not be confirmed. Please try again.");
  }
  return updated;
}
