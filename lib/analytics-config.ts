/** Opt-in configuration only. A token alone must never activate measurement. */
export function analyticsToken(enabled: string | undefined, token: string | undefined): string | undefined {
  return enabled === "true" && token && /^[a-f0-9]{32}$/i.test(token) ? token : undefined;
}
export function analyticsAllowed(preferences: { doNotTrack?: string | null; globalPrivacyControl?: boolean }): boolean {
  return preferences.doNotTrack !== "1" && preferences.doNotTrack !== "yes" && preferences.globalPrivacyControl !== true;
}
