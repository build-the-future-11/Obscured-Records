import { and, desc, eq } from "drizzle-orm";
import { memberLibrary } from "@/db/schema";
import { isIsoDate, isReadingState, isSlug } from "@/lib/member-contract";
import { memberJson, readMemberJson, requireMemberApi } from "@/lib/member-api";

export const dynamic = "force-dynamic";
const getMemberDb = async () => (await import("@/db")).getDb();

export async function GET() {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const rows = await (await getMemberDb()).select({ slug: memberLibrary.slug, state: memberLibrary.readingState, savedAt: memberLibrary.savedAt })
    .from(memberLibrary).where(eq(memberLibrary.userId, auth.user.userId)).orderBy(desc(memberLibrary.updatedAt));
  return memberJson({ items: rows });
}

export async function PUT(request: Request) {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const body = await readMemberJson(request) as Record<string, unknown> | null;
  if (!body || !isSlug(body.slug) || !isReadingState(body.state)) return memberJson({ error: "Invalid saved-story record." }, 400);
  const now = new Date().toISOString();
  const savedAt = isIsoDate(body.savedAt) ? body.savedAt : now;
  const [item] = await (await getMemberDb()).insert(memberLibrary).values({ userId: auth.user.userId, slug: body.slug, readingState: body.state, savedAt, updatedAt: now })
    .onConflictDoUpdate({ target: [memberLibrary.userId, memberLibrary.slug], set: { readingState: body.state, updatedAt: now } })
    .returning({ slug: memberLibrary.slug, state: memberLibrary.readingState, savedAt: memberLibrary.savedAt });
  if (!item) return memberJson({ error: "The saved story could not be confirmed. Please try again." }, 503);
  return memberJson({ ok: true, item });
}

export async function DELETE(request: Request) {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const slug = new URL(request.url).searchParams.get("slug");
  if (!isSlug(slug)) return memberJson({ error: "Invalid story." }, 400);
  await (await getMemberDb()).delete(memberLibrary).where(and(eq(memberLibrary.userId, auth.user.userId), eq(memberLibrary.slug, slug)));
  return memberJson({ ok: true });
}
