import React from "react";
import { createRoot } from "react-dom/client";
import { MemberPortal } from "@/components/member-portal";

const initialView = new URLSearchParams(window.location.search).get("view") === "projects" ? "projects" : "profile";
createRoot(document.getElementById("root")!).render(<MemberPortal initialView={initialView} />);
