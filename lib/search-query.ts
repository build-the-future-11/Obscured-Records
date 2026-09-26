export const MAX_SEARCH_QUERY_LENGTH = 200;

/** Next.js represents repeated search parameters as arrays. */
export function normalizeSearchQuery(value: unknown): string {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" ? first.trim().slice(0, MAX_SEARCH_QUERY_LENGTH) : "";
}
