import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
import { MemberPortal } from "@/components/member-portal";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { isEditorialOwnerEmail } from "@/lib/editorial-auth";

export function MemberWorkspacePage({ view = "home" }: { view?: "home" | "inbox" | "opportunities" | "projects" | "programs" | "mentorship" | "community" | "events" | "learning" | "directory" | "profile" | "admin" }) {
  return <Workspace view={view} />;
}

async function Workspace({ view }: { view: "home" | "inbox" | "opportunities" | "projects" | "programs" | "mentorship" | "community" | "events" | "learning" | "directory" | "profile" | "admin" }) {
  const user = await requireChatGPTUser(`/member${view === "home" ? "" : `/${view}`}`);
  return <main><Masthead /><section className="member-page" id="main-content" tabIndex={-1}><header className="member-heading"><div><span className="eyebrow">Obscured Records member workspace</span><h1>{view === "home" ? `Welcome, ${user.displayName}` : "Member workspace"}</h1><p>Private account tools for responsible research participation.</p>{isEditorialOwnerEmail(user.email) && <p><Link href="/member/admin">Open command center →</Link></p>}</div><div className="member-heading-links"><Link href="/saved">Reading library</Link><a href={chatGPTSignOutPath("/")} target="_top">Sign out</a></div></header><MemberPortal initialView={view} /></section><Footer /></main>;
}
