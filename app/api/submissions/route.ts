import { createSubmissionHandler } from "@/lib/submission-handler";
import { saveSubmission } from "@/lib/submission-store";
export const dynamic = "force-dynamic";
export const POST = createSubmissionHandler(saveSubmission);
