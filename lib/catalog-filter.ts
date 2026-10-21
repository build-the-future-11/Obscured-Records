import type { CatalogStory } from "./catalog.ts";
export type Filters = { q: string; year: string; month: string; topic: string; author: string; section: string; format: string; series: string; sort: string };
export const emptyFilters: Filters = { q: "", year: "", month: "", topic: "", author: "", section: "", format: "", series: "", sort: "" };
export function parseFilters(params: Record<string, unknown> | URLSearchParams): Filters {
  return Object.fromEntries(Object.keys(emptyFilters).map((key) => {
    const supplied = params instanceof URLSearchParams ? params.getAll(key) : params[key];
    const raw = Array.isArray(supplied) ? supplied[0] : supplied;
    const value = typeof raw === "string" ? raw.trim().slice(0, 200) : "";
    return [key, key === "sort" && !["", "oldest", "title"].includes(value) ? "" : value];
  })) as Filters;
}
export function filterCatalog(stories: CatalogStory[], filters: Filters) {
  const terms = filters.q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const results = stories.filter((story) => {
    const text = [story.title, story.excerpt, story.author, story.section, story.eventDate, story.recordId, ...story.tags].join(" ").toLocaleLowerCase();
    return terms.every((term) => text.includes(term)) && (!filters.year || story.isoDate.slice(0, 4) === filters.year)
      && (!filters.month || story.isoDate.slice(5, 7) === filters.month) && (!filters.topic || story.tags.includes(filters.topic))
      && (!filters.author || story.authorSlug === filters.author) && (!filters.section || story.section === filters.section)
      && (!filters.format || story.format === filters.format) && (!filters.series || story.series.includes(filters.series));
  });
  return results.sort((a, b) => {
    const order = filters.sort === "title" ? a.title.localeCompare(b.title, "en")
      : filters.sort === "oldest" ? a.isoDate.localeCompare(b.isoDate) : b.isoDate.localeCompare(a.isoDate);
    return order || b.recordId.localeCompare(a.recordId) || a.slug.localeCompare(b.slug);
  });
}
