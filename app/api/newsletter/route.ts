import { createNewsletterHandler } from "@/lib/newsletter-handler";
import { sendNewsletterConfirmation } from "@/lib/newsletter-delivery";
import { saveLimitedNewsletterSubscriber } from "@/lib/newsletter-store";

export const dynamic = "force-dynamic";
export const POST = createNewsletterHandler(saveLimitedNewsletterSubscriber, sendNewsletterConfirmation);
