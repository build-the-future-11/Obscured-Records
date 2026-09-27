"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="discovery-page" id="main-content"><span className="eyebrow">The record is temporarily unavailable</span><h1>Something interrupted this page.</h1><p>Please try loading it again, or return to the archive.</p><div className="dialog-actions"><button onClick={reset}>Try again</button><Link href="/archive">Go to Archive</Link></div></main>; }
