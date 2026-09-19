"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { Check, Copy, Menu, MessageCircle, Search, Send, Share2, X } from "lucide-react";

const subscribeToLocation = () => () => {};\nconst getLocationHref = () => window.location.href;\nconst getServerLocationHref = () => "";\n\nconst sectionLinks = [
  ["World", "/world"],
  ["Business", "/business"],
  ["Technology", "/technology"],
  ["Science", "/science"],
  ["Culture", "/culture"],
  ["Underreported", "/underreported"],
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", closeOnEscape); };
  }, [open]);

  return <>
    <button className="menu-trigger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
      {open ? <X /> : <Menu />}
    </button>
    {open && <div className="menu-panel" role="dialog" aria-modal="true" aria-label="Site navigation">
      <div className="menu-panel-top"><span>Browse the record</span><button aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
      <nav>{sectionLinks.map(([label, href], index) => <Link key={href} href={href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}</Link>)}</nav>
      <div className="menu-panel-meta">
        <Link href="/search" onClick={() => setOpen(false)}><Search /> Search the archive</Link>
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

export function ShareTools({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(window.location.href), []);
  const links = useMemo(() => ({
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  }), [title, url]);
  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <aside className="share" aria-label="Share this record">
    <span>Share</span>
    <button onClick={copyLink} aria-label="Copy article link" title="Copy link">{copied ? <Check /> : <Copy />}</button>
    <a href={links.linkedin} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn"><Share2 /></a>
    <a href={links.x} target="_blank" rel="noreferrer" aria-label="Share on X" title="Share on X"><Send /></a>
    <a href={links.whatsapp} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp" title="Share on WhatsApp"><MessageCircle /></a>
    {copied && <small role="status">Copied</small>}
  </aside>;
}

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, website: form.get("website") }),
      });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message || "Unable to subscribe right now.");
      setStatus("success");
      setMessage(data.message || "You are on the list.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    }
  }

  return <form className={compact ? "newsletter-form compact" : "newsletter-form"} onSubmit={submit}>
    <label htmlFor={compact ? "newsletter-email-compact" : "newsletter-email"}>Email address</label>
    <input name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <div>
      <input id={compact ? "newsletter-email-compact" : "newsletter-email"} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" />
      <button type="submit" disabled={status === "loading"}>{status === "loading" ? "Saving…" : "Subscribe"}</button>
    </div>
    <small>One considered dispatch. Unsubscribe any time.</small>
    {message && <p className={`form-status ${status}`} role="status">{message}</p>}
  </form>;
}
