import { getChatGPTUser } from "@/app/chatgpt-auth";
export { readMemberJson } from "./member-request";

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
