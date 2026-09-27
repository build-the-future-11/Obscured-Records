import type { CatalogStory } from "./catalog.ts";
export type Filters = { q: string; year: string; month: string; topic: string; author: string; section: string; format: string; series: string };
export const emptyFilters: Filters = { q: "", year: "", month: "", topic: "", author: "", section: "", format: "", series: "" };
export function parseFilters(params: Record<string, unknown>): Filters {
  return Object.fromEntries(Object.keys(emptyFilters).map((key) => {
    const raw = Array.isArray(params[key]) ? params[key][0] : params[key];
    return [key, typeof raw === "string" ? raw.trim().slice(0, 200) : ""];
  })) as Filters;
}
export function filterCatalog(stories: CatalogStory[], filters: Filters) {
  const terms = filters.q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return stories.filter((story) => {
    const text = [story.title, story.excerpt, story.author, story.section, story.eventDate, story.recordId, ...story.tags].join(" ").toLocaleLowerCase();
    return terms.every((term) => text.includes(term)) && (!filters.year || story.isoDate.slice(0, 4) === filters.year)
      && (!filters.month || story.isoDate.slice(5, 7) === filters.month) && (!filters.topic || story.tags.includes(filters.topic))
      && (!filters.author || story.authorSlug === filters.author) && (!filters.section || story.section === filters.section)
      && (!filters.format || story.format === filters.format) && (!filters.series || story.series.includes(filters.series));
  });
}
