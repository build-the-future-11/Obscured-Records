import React from "react";
import { createRoot } from "react-dom/client";
import { MemberPortal } from "@/components/member-portal";

createRoot(document.getElementById("root")!).render(<MemberPortal initialView="profile" />);
