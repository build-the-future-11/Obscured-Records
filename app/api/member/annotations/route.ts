import { and, desc, eq } from "drizzle-orm";
import { memberAnnotations } from "@/db/schema";
import { boundedText, isIsoDate, isSlug } from "@/lib/member-contract";
import { memberJson, readMemberJson, requireMemberApi } from "@/lib/member-api";

export const dynamic = "force-dynamic";
const getMemberDb = async () => (await import("@/db")).getDb();

export async function GET(request: Request) {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const slug = new URL(request.url).searchParams.get("slug");
  const where = slug && isSlug(slug)
    ? and(eq(memberAnnotations.userId, auth.user.userId), eq(memberAnnotations.slug, slug))
    : eq(memberAnnotations.userId, auth.user.userId);
  const items = await (await getMemberDb()).select({ id: memberAnnotations.id, slug: memberAnnotations.slug, text: memberAnnotations.text, note: memberAnnotations.note, anchor: memberAnnotations.anchor, createdAt: memberAnnotations.createdAt })
    .from(memberAnnotations).where(where).orderBy(desc(memberAnnotations.createdAt));
  const prefix = `${auth.user.userId}:`;
  return memberJson({ items: items.map((item) => ({ ...item, id: item.id.startsWith(prefix) ? item.id.slice(prefix.length) : item.id })) });
}

export async function POST(request: Request) {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const body = await readMemberJson(request) as Record<string, unknown> | null;
  const id = boundedText(body?.id, 80), text = boundedText(body?.text, 2000), note = boundedText(body?.note, 3000), anchor = boundedText(body?.anchor, 160);
  if (!body || !id || !/^[a-zA-Z0-9-]+$/.test(id) || !isSlug(body.slug) || !text || note === null || !anchor || !/^[a-z0-9-]+$/.test(anchor)) return memberJson({ error: "Invalid annotation." }, 400);
  const now = new Date().toISOString();
  const createdAt = isIsoDate(body.createdAt) ? body.createdAt : now;
  const storedId = `${auth.user.userId}:${id}`;
  await (await getMemberDb()).insert(memberAnnotations).values({ id: storedId, userId: auth.user.userId, slug: body.slug, text, note, anchor, createdAt, updatedAt: now })
    .onConflictDoUpdate({ target: memberAnnotations.id, set: { text, note, anchor, updatedAt: now } });
  return memberJson({ ok: true, item: { id, slug: body.slug, text, note, anchor, createdAt } }, 201);
}

export async function DELETE(request: Request) {
  const auth = await requireMemberApi();
  if ("response" in auth) return auth.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9-]{1,80}$/.test(id)) return memberJson({ error: "Invalid annotation." }, 400);
  await (await getMemberDb()).delete(memberAnnotations).where(and(eq(memberAnnotations.userId, auth.user.userId), eq(memberAnnotations.id, `${auth.user.userId}:${id}`)));
  return memberJson({ ok: true });
}
