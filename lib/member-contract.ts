export const readingStates = ["Unread", "Reading", "Finished", "Archived"] as const;
export const readerThemes = ["system", "light", "dark"] as const;
export const readerSizes = ["standard", "large", "larger"] as const;
export const digestFrequencies = ["none", "weekly", "monthly"] as const;

export type ReadingState = (typeof readingStates)[number];

export function isSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]{1,120}$/.test(value);
}

export function isReadingState(value: unknown): value is ReadingState {
  return typeof value === "string" && readingStates.includes(value as ReadingState);
}

export function boundedText(value: unknown, maximum: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length <= maximum ? normalized : null;
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value));
}

export function isOneOf<const T extends readonly string[]>(value: unknown, choices: T): value is T[number] {
  return typeof value === "string" && choices.includes(value);
}
