/** Resolve a datetime-local field in the browser before sending it to a server. */
export function localPortalDateTime(value: string): string {
  if (!value) return "";
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value);
  const date = new Date(value);
  if (!parts || !Number.isFinite(date.getTime()) ||
      date.getFullYear() !== Number(parts[1]) || date.getMonth() + 1 !== Number(parts[2]) ||
      date.getDate() !== Number(parts[3]) || date.getHours() !== Number(parts[4]) ||
      date.getMinutes() !== Number(parts[5]) || date.getSeconds() !== Number(parts[6] || 0)) {
    // This also rejects local times skipped by a daylight-saving clock change.
    throw new Error("Choose a valid date and time in your device's time zone.");
  }
  return date.toISOString();
}

/** Convert only the datetime-local fields used by this action, leaving copy and date-only milestones intact. */
export function preparePortalPayload(action: string, payload: Record<string, unknown>): Record<string, unknown> {
  let fields: string[] = [];
  if (action === "admin-publish") {
    if (payload.type === "event") fields = ["startsAt"];
    else if (payload.type === "opportunity" || payload.type === "program") fields = ["deadline"];
  } else if (action === "log-mentor-session") fields = ["sessionAt"];
  else if (action === "send-invitation") fields = ["expiresAt"];
  else if (action === "admin-add-schedule") fields = ["when"];

  const prepared = { ...payload };
  for (const field of fields) {
    const value = prepared[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") throw new Error("Choose a valid date and time.");
    prepared[field] = localPortalDateTime(value);
  }
  return prepared;
}
