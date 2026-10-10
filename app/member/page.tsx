import { Footer, Masthead } from "@/components/editorial";
import { MemberDashboard } from "@/components/member-dashboard";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { getCatalog } from "@/lib/catalog";
import { memberProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Member space", robots: { index: false, follow: false } };

export default async function MemberPage() {
  const user = await requireChatGPTUser("/member");
  const { getDb } = await import("@/db");
  const [stored] = await getDb().select().from(memberProfiles).where(eq(memberProfiles.userId, user.userId)).limit(1);
  const profile = stored ? { displayName: stored.displayName, email: stored.email, bio: stored.bio, digestFrequency: stored.digestFrequency } : { displayName: user.displayName, email: user.email, bio: "", digestFrequency: "none" };
  const stories = getCatalog().map(({ slug, title, section }) => ({ slug, title, section }));
  return <main><Masthead /><section className="member-page" id="main-content" tabIndex={-1}><header className="member-heading"><div><span className="eyebrow">Private member space</span><h1>Welcome, {profile.displayName}</h1><p>Your account-synced reading library and notebook.</p></div><a href={chatGPTSignOutPath("/")} target="_top">Sign out</a></header><MemberDashboard initialProfile={profile} stories={stories} /></section><Footer /></main>;
}
