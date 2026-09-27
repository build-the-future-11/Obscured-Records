export type EditorialEventName = "story_impression" | "story_open" | "article_depth" | "completion_proxy" | "archive_use" | "search_success" | "save" | "share" | "newsletter_capture" | "topic_exploration" | "series_continuation";
/** Integration hook only: no cookies, network requests, queries, notes or personal data. */
export function editorialEvent(name: EditorialEventName, detail: { slug?: string; depth?: number; action?: string } = {}) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("or:editorial", { detail: { name, ...detail } }));
}
