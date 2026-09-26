"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { Check, Copy, Mail, Menu, MessageCircle, Search, Send, Share2, X } from "lucide-react";

const subscribeToHydration = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

const sectionLinks = [
  ["World", "/world"], ["Business", "/business"], ["Technology", "/technology"],
  ["Science", "/science"], ["Culture", "/culture"], ["Underreported", "/underreported"],
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current;
    const panel = panelRef.current;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLButtonElement>("button")?.focus();
    // Mark every outside branch inert without hiding the dialog's ancestors.
    const inertState: Array<[HTMLElement, boolean]> = [];
    let branch: HTMLElement | null = panel;
    while (branch && branch !== document.body) {
      const parent: HTMLElement | null = branch.parentElement;
      if (!parent) break;
      for (const sibling of parent.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          inertState.push([sibling, sibling.inert]); sibling.inert = true;
        }
      }
      branch = parent;
    }
    const desktop = window.matchMedia("(min-width: 1101px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => { if (event.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
      if (event.key !== "Tab" || !panel) return;
      const controls = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]'));
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) { event.preventDefault(); panel.focus(); return; }
      if (!panel.contains(document.activeElement)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      for (const [element, wasInert] of inertState) element.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [open]);

  return <>
    <button ref={triggerRef} type="button" className="menu-trigger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls={dialogId} onClick={() => setOpen(!open)}>
      {open ? <X /> : <Menu />}
    </button>
    {open && <div ref={panelRef} id={dialogId} className="menu-panel" role="dialog" aria-modal="true" aria-label="Site navigation" tabIndex={-1}>
      <div className="menu-panel-top"><span>Browse the record</span><button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
      <nav>{sectionLinks.map(([label, href], index) => <Link key={href} href={href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}</Link>)}</nav>
      <div className="menu-panel-meta">
        <Link href="/latest" onClick={() => setOpen(false)}>Latest records</Link>
        <Link href="/search" onClick={() => setOpen(false)}><Search /> Search the archive</Link>
        <Link href="/newsletter" onClick={() => setOpen(false)}>Newsletter</Link>
        <Link href="/submit" onClick={() => setOpen(false)}>Submit a record</Link>
        <Link href="/about" onClick={() => setOpen(false)}>About</Link>
        <Link href="/standards" onClick={() => setOpen(false)}>Editorial standards</Link>
        <Link href="/corrections" onClick={() => setOpen(false)}>Corrections</Link>
      </div>
    </div>}
  </>;
}

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div className="reading-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>;
}

export function ShareTools({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);
  const links = useMemo(() => ({
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  }), [title, url]);
  async function copyLink() {
    if (!url) return;
    setCopyError("");
    setCopied(false);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    let success = false;
    try {
      await navigator.clipboard.writeText(url);
      success = true;
    } catch {
      const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      try { input.select(); success = document.execCommand("copy"); }
      catch { success = false; }
      finally { input.remove(); returnFocus?.focus(); }
    }
    if (!success) { setCopyError("Copy unavailable. Copy the address from your browser."); return; }
    setCopied(true);
    resetTimer.current = setTimeout(() => setCopied(false), 1800);
  }
  return <aside className="share" aria-label="Share this record">
    <span>Share</span>
    <button type="button" onClick={copyLink} aria-label="Copy article link" title="Copy link">{copied ? <Check /> : <Copy />}</button>
    <a href={links.email} aria-label="Share by email" title="Share by email"><Mail /></a>
    <a href={links.linkedin} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn"><Share2 /></a>
    <a href={links.x} target="_blank" rel="noreferrer" aria-label="Share on X" title="Share on X"><Send /></a>
    <a href={links.whatsapp} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp" title="Share on WhatsApp"><MessageCircle /></a>
    {copied && <small role="status">Copied</small>}
    {copyError && <small role="alert">{copyError}</small>}
  </aside>;
}

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const hydrated = useSyncExternalStore(subscribeToHydration, getHydrated, getServerHydrated);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => { requestRef.current?.abort(); requestRef.current = null; }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, website: form.get("website") ?? "" }),
        signal: controller.signal,
      });
      let data: unknown;
      try { data = await response.json(); } catch { throw new Error("Unable to subscribe right now. Please try again."); }
      const responseMessage = data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : "";
      if (!response.ok || !responseMessage) throw new Error(responseMessage || "Unable to subscribe right now. Please try again.");
      if (requestRef.current !== controller) return;
      setStatus("success");
      setMessage(responseMessage);
      setEmail("");
    } catch (error) {
      if (requestRef.current !== controller) return;
      setStatus("error");
      setMessage(controller.signal.aborted ? "The signup request timed out. Please try again." : error instanceof Error ? error.message : "Unable to subscribe right now.");
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
    }
  }

  return <form method="post" action="/api/newsletter" className={compact ? "newsletter-form compact" : "newsletter-form"} onSubmit={submit} aria-busy={status === "loading"}>
    <noscript><p>Newsletter signup requires JavaScript. You can <a href="/rss.xml">follow the RSS feed</a> instead.</p></noscript>
    <label htmlFor={`${id}-email`}>Email address</label>
    <input name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <div>
      <input id={`${id}-email`} name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required maxLength={254} autoComplete="email" disabled={!hydrated || status === "loading"} aria-describedby={`${id}-hint${message ? ` ${id}-status` : ""}`} />
      <button type="submit" disabled={!hydrated || status === "loading"}>{status === "loading" ? "Saving…" : "Subscribe"}</button>
    </div>
    <small id={`${id}-hint`}>Subscribe to the Obscured Brief. <Link href="/privacy">Read our privacy policy.</Link></small>
    {message && <p id={`${id}-status`} className={`form-status ${status}`} role={status === "error" ? "alert" : "status"}>{message}</p>}
  </form>;
}
