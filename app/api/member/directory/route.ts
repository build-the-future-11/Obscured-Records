import { eq } from "drizzle-orm";
import { memberProfileDetails, memberProfiles, portalMentorProfiles } from "@/db/schema";
import { memberJson, requireMemberApi } from "@/lib/member-api";

export const dynamic = "force-dynamic";
const getDb = async () => (await import("@/db")).getDb();
const asList = (value: string) => { try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; } };

export async function GET(request: Request) {
  const auth = await requireMemberApi(); if ("response" in auth) return auth.response;
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";
  if (query.length > 80) return memberJson({ error: "Search is too long." }, 400);
  const db = await getDb();
  const [details, profiles, mentors] = await Promise.all([
    db.select().from(memberProfileDetails).where(eq(memberProfileDetails.directoryVisible, true)),
    db.select({ userId: memberProfiles.userId, displayName: memberProfiles.displayName, bio: memberProfiles.bio }).from(memberProfiles),
    db.select().from(portalMentorProfiles).where(eq(portalMentorProfiles.active, true)),
  ]);
  const profileById = new Map(profiles.map((profile) => [profile.userId, profile]));
  const mentorById = new Map(mentors.map((mentor) => [mentor.userId, mentor]));
  const members = details.flatMap((detail) => {
    const profile = profileById.get(detail.userId); if (!profile) return [];
    const mentor = mentorById.get(detail.userId); const skills = asList(detail.skills), interests = asList(detail.interests);
    const searchable = [profile.displayName, profile.bio, ...skills, ...interests].join(" ").toLowerCase();
    if (query && !searchable.includes(query)) return [];
    return [{ userId: detail.userId, displayName: profile.displayName, bio: profile.bio, skills, interests, accomplishments: detail.accomplishments, portfolioUrl: detail.portfolioUrl, mentor: mentor ? { bio: mentor.bio, expertise: asList(mentor.expertise), availability: mentor.availability } : null }];
  });
  return memberJson({ members: members.slice(0, 100) });
}
