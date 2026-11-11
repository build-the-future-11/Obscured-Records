import React from "react";
import { createRoot } from "react-dom/client";
import { MemberPortal } from "@/components/member-portal";
import { MemberDashboard } from "@/components/member-dashboard";

const requestedView = new URLSearchParams(window.location.search).get("view");
const initialView = requestedView === "projects" || requestedView === "admin" || requestedView === "community" || requestedView === "directory" ? requestedView : "profile";
createRoot(document.getElementById("root")!).render(requestedView === "member-account"
  ? <MemberDashboard initialProfile={{ displayName: "Initial Name", email: "fixture@example.test", bio: "Initial bio", digestFrequency: "none" }} stories={[]} />
  : <MemberPortal initialView={initialView} />);
