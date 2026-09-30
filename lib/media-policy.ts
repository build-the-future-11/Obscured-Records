/** Temporary rendering holds, not legal conclusions. Source files are retained for review.
 * Revisit only with a documented provenance decision in the release checklist.
 */
export const mediaHolds: Readonly<Record<string, string>> = {
  "therac-25": "Cover withheld while contradictory image-provenance records are reviewed.",
  "wirecard-missing-billions": "Cover withheld pending review of the retained image derivative and its provenance.",
  "lake-nyos": "Cover withheld pending review of the retained image derivative and its provenance.",
};
export function displayCover(article: { slug: string; cover?: string }): string | undefined {
  return mediaHolds[article.slug] ? undefined : article.cover;
}
