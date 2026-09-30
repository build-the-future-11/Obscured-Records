"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
const subscribe = () => () => {};

export function SubmissionForm({ mode = "submission" }: { mode?: "submission" | "contributor" }) {
  const contributor = mode === "contributor";
  const id = useId();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => { pending.current?.abort(); pending.current = null; }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const controller = new AbortController(); pending.current = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    setState("saving"); setMessage("");
    try {
      const response = await fetch("/api/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(data), consent: data.get("consent") === "on" }), signal: controller.signal });
      const result = await response.json();
      const responseMessage = result && typeof result === "object" && "message" in result && typeof result.message === "string" ? result.message : "";
      if (!response.ok || !responseMessage) throw new Error(responseMessage || "Unable to save your submission. Please try again.");
      if (pending.current !== controller) return;
      setState("success"); setMessage(responseMessage); form.reset();
    } catch (error) {
      if (pending.current !== controller) return;
      setState("error");
      setMessage(controller.signal.aborted ? "The request timed out. Your text is still here; please retry or email the editor." : error instanceof SyntaxError ? "Unable to save your submission. Please try again." : error instanceof Error ? error.message : "Unable to save your submission.");
    } finally { clearTimeout(timeout); if (pending.current === controller) pending.current = null; }
  }
  return <form className="submission-form" method="post" action="/api/submissions" onSubmit={submit} aria-busy={state === "saving"}>
    <h2>{contributor ? "Introduce yourself to the editorial desk" : "Send a source-led submission"}</h2>
    <p id={`${id}-privacy`}>The editor will store and review your contact details and message. Do not send confidential material. <Link href="/privacy">Privacy and removal requests</Link>.</p>
    {!hydrated && <p>The form requires JavaScript. You can email the editor using the address below.</p>}
    <fieldset disabled={!hydrated || state === "saving"} aria-describedby={`${id}-privacy`}>
      <legend className="sr-only">Submission details</legend>
      <input name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {contributor ? <input type="hidden" name="kind" value="Contributor" /> : <><label htmlFor={`${id}-kind`}>Submission type</label><select id={`${id}-kind`} name="kind">{["Source", "Correction", "Rights", "Pitch"].map((kind) => <option key={kind}>{kind}</option>)}</select></>}
      <label htmlFor={`${id}-email`}>Your email</label><input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254}/>
      <label htmlFor={`${id}-title`}>{contributor ? "Your name and area of interest" : "Record or proposed title"}</label><input id={`${id}-title`} name="title" required minLength={5} maxLength={160}/>
      <label htmlFor={`${id}-source`}>{contributor ? "Public work sample or source link (optional)" : "Source or existing record link"}</label><input id={`${id}-source`} name="sourceUrl" type="url" pattern="https://.*" placeholder="https://" required={!contributor} maxLength={2048}/>
      <label htmlFor={`${id}-message`}>What should the editor know?</label><textarea id={`${id}-message`} name="message" required minLength={80} maxLength={6000} rows={9} aria-describedby={`${id}-length`}/><small id={`${id}-length`}>{contributor ? "80–6,000 characters. Share your interests, skills, availability and an overlooked story you would explore. No portfolio is required. Do not include your home address, identification documents or private records." : "80–6,000 characters. Describe the evidence, uncertainty and what is missing."}</small>
      <label className="submission-consent"><input type="checkbox" name="consent" required/>I agree that the editor may store and review this submission and contact me about it.</label>
      <button type="submit">{state === "saving" ? "Saving…" : contributor ? "Send introduction" : "Send for review"}</button>
    </fieldset>
    {state === "error" && <p className="intake-alternative">Your text is still in this form. Copy it into an <a href="mailto:ryangomez.hs@gmail.com?subject=Obscured%20Records%20editorial%20desk">email to the editor</a> instead. Sending an email does not guarantee acceptance.</p>}
    {message && <p className="form-status" role={state === "error" ? "alert" : "status"}>{message}</p>}
  </form>;
}
