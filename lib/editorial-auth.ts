import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { notFound } from "next/navigation";

const DEFAULT_EDITOR_EMAIL = "ryangomez.hs@gmail.com";

export function isEditorialOwnerEmail(email: string) {
  const configured = process.env.EDITORIAL_OWNER_EMAIL?.trim().toLowerCase();
  return email.trim().toLowerCase() === (configured || DEFAULT_EDITOR_EMAIL);
}

export async function requireEditorialOwner(returnTo: string) {
  const user = await requireChatGPTUser(returnTo);
  if (!isEditorialOwnerEmail(user.email)) notFound();
  return user;
}
