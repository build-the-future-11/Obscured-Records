"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { editorialEvent } from "@/lib/editorial-events";
export function EditorialEvents() {
  const path = usePathname();
  useEffect(() => {
    if (path?.startsWith("/article/")) editorialEvent("story_open", { slug: path.split("/")[2] });
    if (path === "/archive") editorialEvent("archive_use");
    if (path?.startsWith("/topic/")) editorialEvent("topic_exploration", { slug: path.split("/")[2] });
    const seen = new Set<string>();
    const observer = new IntersectionObserver((entries) => { for (const entry of entries) { const slug = entry.target.getAttribute("data-story-slug"); if (entry.isIntersecting && slug && !seen.has(slug)) { seen.add(slug); editorialEvent("story_impression", { slug }); } } }, { threshold: .5 });
    document.querySelectorAll("[data-story-slug]").forEach((node) => observer.observe(node));
    const click = (event: MouseEvent) => { const target = event.target instanceof Element ? event.target.closest(".series-continuation a") : null; if (target) editorialEvent("series_continuation"); };
    document.addEventListener("click", click);
    return () => { observer.disconnect(); document.removeEventListener("click", click); };
  }, [path]);
  return null;
}
