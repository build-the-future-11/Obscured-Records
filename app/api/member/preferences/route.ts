import { eq } from "drizzle-orm";
import { memberPreferences } from "@/db/schema";
import { isOneOf, readerSizes, readerThemes } from "@/lib/member-contract";
import { memberJson, readMemberJson, requireMemberApi } from "@/lib/member-api";

export const dynamic = "force-dynamic";
const getMemberDb = async () => (await import("@/db")).getDb();

export async function GET() {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const [preferences] = await (await getMemberDb()).select().from(memberPreferences).where(eq(memberPreferences.userId, auth.user.userId)).limit(1);
  return memberJson({ preferences: preferences ? { textSize: preferences.textSize, theme: preferences.theme } : { textSize: "standard", theme: "system" } });
}

export async function PUT(request: Request) {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const body = await readMemberJson(request) as Record<string, unknown> | null;
  if (!body || !isOneOf(body.textSize, readerSizes) || !isOneOf(body.theme, readerThemes)) return memberJson({ error: "Invalid reader preferences." }, 400);
  const now = new Date().toISOString();
  await (await getMemberDb()).insert(memberPreferences).values({ userId: auth.user.userId, textSize: body.textSize, theme: body.theme, updatedAt: now })
    .onConflictDoUpdate({ target: memberPreferences.userId, set: { textSize: body.textSize, theme: body.theme, updatedAt: now } });
  return memberJson({ ok: true, preferences: { textSize: body.textSize, theme: body.theme } });
}
