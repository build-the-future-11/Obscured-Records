export const portalCategories = ["Research", "Editorial", "Collaboration", "Volunteer", "Competition"] as const;
export const projectMemberStates = ["requested", "accepted", "declined"] as const;
export const applicationStates = ["submitted", "under_review", "accepted", "declined"] as const;

export function portalText(value: unknown, maximum: number, minimum = 0) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length >= minimum && cleaned.length <= maximum ? cleaned : null;
}

export function portalUrl(value: unknown) {
  const cleaned = portalText(value, 2048);
  if (cleaned === null) return null;
  if (!cleaned) return "";
  try { const url = new URL(cleaned); return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null; }
  catch { return null; }
}

export function portalDate(value: unknown, required = false) {
  if (value === "" || value === null || value === undefined) return required ? null : "";
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

export function portalList(value: unknown, maximumItems = 12, maximumItemLength = 48) {
  if (!Array.isArray(value) || value.length > maximumItems) return null;
  const items = value.map((item) => portalText(item, maximumItemLength, 1));
  return items.every((item): item is string => item !== null) ? [...new Set(items)] : null;
}

export function isPortalId(value: unknown): value is string { return typeof value === "string" && /^[a-z0-9-]{8,80}$/i.test(value); }
// Identity providers choose their own opaque subject formats, so member IDs
// must not be constrained to UUID-looking values.
export function isMemberId(value: unknown): value is string { return typeof value === "string" && value.length > 0 && value.length <= 256 && !/[\x00-\x1f\x7f]/.test(value); }
export function isOneOf<T extends readonly string[]>(value: unknown, values: T): value is T[number] { return typeof value === "string" && values.includes(value); }
