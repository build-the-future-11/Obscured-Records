import type { getCatalog, getTopics, getSeries } from "./catalog.ts";

export type SearchIndex = { stories: ReturnType<typeof getCatalog>; topics: ReturnType<typeof getTopics>; series: ReturnType<typeof getSeries>; authors: { slug: string; name: string }[] };

export function nextSearchResult(current: number, count: number, direction: "ArrowDown" | "ArrowUp") {
  if (count <= 0) return -1;
  if (current < 0 || current >= count) return direction === "ArrowDown" ? 0 : count - 1;
  return (current + (direction === "ArrowDown" ? 1 : -1) + count) % count;
}

function validIndex(value: unknown): value is SearchIndex {
  if (!value || typeof value !== "object") return false;
  const index = value as Record<string, unknown>;
  const fields = (item: unknown, keys: string[]) => item !== null && typeof item === "object" && keys.every((key) => typeof (item as Record<string, unknown>)[key] === "string");
  return Array.isArray(index.stories) && index.stories.every((item) => fields(item, ["slug", "title", "excerpt", "author", "section", "date"]) && Array.isArray(item.tags) && item.tags.every((tag: unknown) => typeof tag === "string")) &&
    Array.isArray(index.topics) && index.topics.every((item) => fields(item, ["slug", "name"]) && Number.isFinite(item.count)) &&
    Array.isArray(index.series) && index.series.every((item) => fields(item, ["slug", "title", "description"])) &&
    Array.isArray(index.authors) && index.authors.every((item) => fields(item, ["slug", "name"]));
}

export async function fetchSearchIndex(signal: AbortSignal, timeoutMs = 10_000): Promise<SearchIndex> {
  const controller = new AbortController();
  const cancel = () => controller.abort(new Error("Search closed."));
  let rejectInterrupted: (error: unknown) => void = () => {};
  const interruption = new Promise<never>((_, reject) => { rejectInterrupted = reject; });
  const onAbort = () => rejectInterrupted(controller.signal.reason);
  controller.signal.addEventListener("abort", onAbort, { once: true });
  signal.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => controller.abort(new Error("Instant search timed out.")), timeoutMs);
  const exchange = Promise.resolve().then(async () => {
    if (controller.signal.aborted) throw controller.signal.reason;
    const response = await fetch("/api/search", { signal: controller.signal });
    if (!response.ok) throw new Error("Instant search is unavailable.");
    const data: unknown = await response.json();
    if (!validIndex(data)) throw new Error("The search index is incomplete.");
    return data;
  });
  const result = Promise.race([exchange, interruption]);
  if (signal.aborted) cancel();
  try { return await result; }
  finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
    controller.signal.removeEventListener("abort", onAbort);
  }
}
