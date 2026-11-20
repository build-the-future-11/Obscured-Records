import { MemberWorkspacePage } from "@/components/member-workspace-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Member space", robots: { index: false, follow: false } };

export default function MemberPage() { return <MemberWorkspacePage />; }
