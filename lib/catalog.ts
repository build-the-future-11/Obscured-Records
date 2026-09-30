import { displayCover } from "./media-policy.ts";
import { getPublicArticles } from "./articles.ts";
import { getFeature, getReadingLabel } from "./features.ts";
import { toIsoEditorialDate } from "./editorial-dates.ts";

export const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const topicName = (value: string) => value === "fbi" ? "FBI" : value.replace(/(^|[ -])\w/g, (letter) => letter.toUpperCase());
const descriptions: Record<string, string> = {
  aviation: "Aircraft, crews and the decisions made under pressure. Follow the investigation beyond the remembered moment.",
  fraud: "Reported balances, missing evidence and the institutions entrusted with checking the accounts.",
  accounting: "How financial records are made, challenged and corrected when the numbers cease to hold up.",
  environment: "The long consequences of decisions about land, water and the places people call home.",
  radiation: "Invisible hazards, exposed safeguards and the evidence used to reconstruct what happened.",
  japan: "Records of industrial harm, corporate governance and political history in Japan.",
};

// Deliberate reading orders through existing records, not an invented investigation.
export const readingSeries = [
  { slug: "in-the-air", title: "In the air, under pressure", description: "A reading path from crew survival to hostage negotiation and the evidence recovered after an attack.", slugs: ["fedex-flight-705", "air-france-8969", "ethiopian-airlines-961", "flight-629-suitcase-bomb"] },
  { slug: "the-paper-trail", title: "When the accounts unravel", description: "Read across four cases to examine cash balances, confirmations and the limits of institutional oversight.", slugs: ["wirecard-missing-billions", "satyam-confession", "parmalat-fictional-cash", "olympus-two-decade-coverup"] },
  { slug: "invisible-hazards", title: "Hazards out of sight", description: "Radiation, software, water and gas: four records about danger that was difficult to recognize before people were harmed.", slugs: ["goiania-blue-powder", "therac-25", "minamata-food-chain", "lake-nyos"] },
] as const;
export function getSeries(): { slug: string; title: string; description: string; slugs: string[] }[] {
  const publicSlugs = new Set(getPublicArticles().map((a) => a.slug));
  return readingSeries.map((series) => ({ ...series, slugs: series.slugs.filter((slug) => publicSlugs.has(slug)) })).filter((series) => series.slugs.length);
}
export function getCatalog() {
  const collections = getSeries();
  return getPublicArticles().map((article) => ({
    slug: article.slug, title: article.title, excerpt: article.excerpt, section: article.section,
    author: article.author, authorSlug: article.authorSlug, tags: article.tags, recordId: article.recordId,
    date: article.date, isoDate: toIsoEditorialDate(article.date), eventDate: article.eventDate,
    format: getFeature(article.slug) ? "feature" : "brief", readingLabel: getReadingLabel(article.slug),
    cover: displayCover(article), coverCredit: displayCover(article) ? article.coverCredit : undefined,
    series: collections.filter((series) => series.slugs.includes(article.slug)).map((series) => series.slug),
  })).sort((a, b) => b.isoDate.localeCompare(a.isoDate) || b.recordId.localeCompare(a.recordId));
}
export type CatalogStory = ReturnType<typeof getCatalog>[number];
export function getTopics() {
  const stories = getCatalog();
  return [...new Set(stories.flatMap((story) => story.tags))].map((tag) => ({
    tag, slug: slugify(tag), name: topicName(tag), count: stories.filter((story) => story.tags.includes(tag)).length,
    description: descriptions[tag] || `Explore the ${tag} thread through the archive: the events, their consequences and the documents behind them.`,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
