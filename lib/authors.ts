export type AuthorProfile = { slug: string; name: string; role: string; biography: string; contact?: string };
/** Add only real, approved profile details. A byline is not a fact-check certificate. */
export const authorProfiles: Readonly<Record<string, AuthorProfile>> = {
  "ryan-gomez": {
    slug: "ryan-gomez", name: "Ryan Gomez", role: "Founder & editor",
    biography: "Ryan founded Obscured Records to give overlooked events a permanent, source-led home. The archive includes AI-assisted archival synthesis; each record explains its method and limitations.",
    contact: "mailto:ryangomez.hs@gmail.com",
  },
};
export function authorInitials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase() || "OR";
}
export function getAuthorProfile(slug: string, name: string): AuthorProfile {
  const profile = authorProfiles[slug];
  if (profile?.name === name) return profile;
  return { slug, name, role: "Contributor", biography: "Read this contributor’s published records below. A detailed biography has not yet been supplied; see individual articles for their method and source notes." };
}
