import React from "react";
import { createRoot } from "react-dom/client";
import { MemberPortal } from "@/components/member-portal";

const requestedView = new URLSearchParams(window.location.search).get("view");
const initialView = requestedView === "projects" || requestedView === "admin" ? requestedView : "profile";
createRoot(document.getElementById("root")!).render(<MemberPortal initialView={initialView} />);
