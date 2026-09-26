import Link from "next/link";
import { Footer, Masthead } from "@/components/editorial";
export default function NotFound() {
  return <main><Masthead/><section className="text-page" id="main-content" tabIndex={-1}><span>O.R / Record not found</span><h1>This record<br/>is not here.</h1><p>The address may be incorrect, or this record may no longer be available.</p><Link className="arrow-link" href="/search">Search the archive →</Link><p><Link href="/latest">Browse every filed record</Link></p></section><Footer/></main>;
}
