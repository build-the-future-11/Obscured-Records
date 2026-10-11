import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function requireMemberApi() {
  const user = await getChatGPTUser();
  if (!user) return { response: memberJson({ error: "Sign in to use member sync." }, 401) } as const;
  return { user } as const;
}

export function memberJson(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "cache-control": "private, no-store, max-age=0" },
  });
}

export async function readMemberJson(request: Request, maximumBytes = 12_000): Promise<unknown | null> {
  const length = Number(request.headers.get("content-length") || "0");
  if (!Number.isFinite(length) || length < 0 || length > maximumBytes) return null;
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maximumBytes) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
