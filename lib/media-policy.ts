/** Temporary rendering holds, not legal conclusions. Source files are retained for review.
 * Revisit only with a documented provenance decision in the release checklist.
 */
export const mediaHolds: Readonly<Record<string, string>> = {
  "therac-25": "Cover withheld while contradictory image-provenance records are reviewed.",
  "wirecard-missing-billions": "Cover withheld pending review of the retained image derivative and its provenance.",
  "lake-nyos": "Cover withheld pending review of the retained image derivative and its provenance.",
};
const hostedCovers = new Set(["/triangle-factory-illustration.webp", "/apollo-1-illustration.webp", "/ixtoc-1-illustration.webp", "/fedex-705.webp", "/wirecard.webp", "/goiania-source.webp", "/lake-nyos.webp", "/therac-25.webp"]);
const coverDimensions: Readonly<Record<string, readonly [number, number]>> = {
  "/triangle-factory-illustration.webp": [1536, 1024], "/apollo-1-illustration.webp": [1536, 1024], "/ixtoc-1-illustration.webp": [1536, 1024],
  "/fedex-705.webp": [1280, 853], "/wirecard.webp": [1800, 1199],
  "/goiania-source.webp": [1403, 1174], "/lake-nyos.webp": [532, 402], "/therac-25.webp": [850, 1138],
};

/** Keep source inventory paths intact while using typed responses for delivery. */
export function readerImagePath(source: string): string {
  return hostedCovers.has(source) ? `/media${source}` : source;
}

/** Lightweight display projection; the encoded bytes stay in the server route. */
export function readerImageSources(source: string) {
  const original = source.startsWith("/media/") ? source.slice("/media".length) : source;
  const [width, height] = Object.hasOwn(coverDimensions, original) ? coverDimensions[original] : [];
  const src = readerImagePath(source);
  const srcSet = width ? [`${src.replace(".webp", "-480.webp")} 480w`, ...(width > 960 ? [`${src.replace(".webp", "-960.webp")} 960w`] : []), `${src} ${width}w`].join(", ") : undefined;
  return { src, srcSet, width, height };
}

export function displayCover(article: { slug: string; cover?: string }): string | undefined {
  return mediaHolds[article.slug] || !article.cover ? undefined : readerImagePath(article.cover);
}
