import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default:"Obscured Records", template:"%s — Obscured Records" },
  description:"Documented histories that were overlooked, flattened into trivia or never explained with enough care.",
  metadataBase: new URL("https://obscured-records.ryangomez-hs.chatgpt.site"),
  openGraph:{ title:"Obscured Records", description:"The record beneath the remembered story.", type:"website" },
  twitter:{ card:"summary", title:"Obscured Records", description:"The record beneath the remembered story." },
  icons:{ icon:"/favicon.svg", shortcut:"/favicon.svg" },
};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
