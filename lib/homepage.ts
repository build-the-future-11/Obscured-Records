/** Change this edition without touching page markup. Only published catalog entries resolve. */
export const homepageEdition = {
  lead: "fedex-flight-705",
  secondary: ["wirecard-missing-billions", "goiania-blue-powder"],
  feature: "therac-25",
};
type Story = { slug: string; format: string };
type Edition = { lead?: string; secondary?: readonly string[]; feature?: string };
export function selectHomepage<T extends Story>(catalog: readonly T[], edition: Edition = homepageEdition) {
  const used = new Set<string>();
  const take = (preferred?: string, featureOnly = false): T | undefined => {
    const eligible = catalog.filter((story) => !used.has(story.slug) && (!featureOnly || story.format === "feature"));
    const story = eligible.find((item) => item.slug === preferred) || eligible[0];
    if (story) used.add(story.slug);
    return story;
  };
  const lead = take(edition.lead);
  // Reserve the long-read slot before filling the secondary positions.
  const feature = take(edition.feature, true);
  const secondary = Array.from({ length: 2 }, (_, i) => take(edition.secondary?.[i])).filter((story): story is T => Boolean(story));
  const latest = catalog.filter((story) => !used.has(story.slug)).slice(0, 5);
  return { lead, secondary, feature, latest };
}
