import { createNewsletterHandler } from "@/lib/newsletter-handler";
import { saveNewsletterSubscriber } from "@/lib/newsletter-store";

export const dynamic = "force-dynamic";
export const POST = createNewsletterHandler(saveNewsletterSubscriber);
