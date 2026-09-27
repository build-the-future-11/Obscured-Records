import { toIsoEditorialDate } from "./editorial-dates.ts";
/** Unknown, draft, review, held and future records are never public. */
export function isPublicRecord(record: { status?: string; date: string }, now = Date.now()) {
  if (record.status !== "published") return false;
  try { return Date.parse(`${toIsoEditorialDate(record.date)}T00:00:00Z`) <= now; }
  catch { return false; }
}
