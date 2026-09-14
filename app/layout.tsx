import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default:"Obscured Records", template:"%s — Obscured Records" },
  description:"Important stories that are undercovered, emerging, or poorly explained elsewhere.",
  metadataBase: new URL("https://obscured-records.ryangomez-hs.chatgpt.site"),
  openGraph:{ title:"Obscured Records", description:"The stories underneath the headlines.", type:"website" },
  twitter:{ card:"summary_large_image", title:"Obscured Records", description:"The stories underneath the headlines." },
  icons:{ icon:"/favicon.svg", shortcut:"/favicon.svg" },
};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
