import { eq } from "drizzle-orm";
import { memberProfiles } from "@/db/schema";
import { boundedText, digestFrequencies, isOneOf } from "@/lib/member-contract";
import { memberJson, readMemberJson, requireMemberApi } from "@/lib/member-api";

export const dynamic = "force-dynamic";
const getMemberDb = async () => (await import("@/db")).getDb();

export async function GET() {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const [profile] = await (await getMemberDb()).select().from(memberProfiles).where(eq(memberProfiles.userId, auth.user.userId)).limit(1);
  return memberJson({ profile: profile ? { displayName: profile.displayName, email: profile.email, bio: profile.bio, digestFrequency: profile.digestFrequency } : { displayName: auth.user.displayName, email: auth.user.email, bio: "", digestFrequency: "none" } });
}

export async function PATCH(request: Request) {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const body = await readMemberJson(request) as Record<string, unknown> | null;
  const displayName = boundedText(body?.displayName, 80), bio = boundedText(body?.bio, 500);
  if (!displayName || bio === null || !isOneOf(body?.digestFrequency, digestFrequencies)) return memberJson({ error: "Invalid member profile." }, 400);
  const now = new Date().toISOString();
  await (await getMemberDb()).insert(memberProfiles).values({ userId: auth.user.userId, email: auth.user.email, displayName, bio, digestFrequency: body.digestFrequency, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: memberProfiles.userId, set: { email: auth.user.email, displayName, bio, digestFrequency: body.digestFrequency, updatedAt: now } });
  return memberJson({ ok: true, profile: { displayName, email: auth.user.email, bio, digestFrequency: body.digestFrequency } });
}
