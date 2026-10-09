import { discardRequestBody, intakeJson, isSameOriginSignup, readBody, RequestBodyTimeout, RequestTooLarge } from "./newsletter-handler.ts";
import { IntakeRateLimit } from "./intake-policy.ts";

export type Submission = { email: string; kind: string; title: string; message: string; sourceUrl: string };
export const submissionKinds = ["Correction", "Source", "Rights", "Pitch", "Contributor"] as const;
const maxSubmissionBytes = 16384;
export function createSubmissionHandler(save: (submission: Submission) => Promise<string>) {
  return async (request: Request) => {
    if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
      discardRequestBody(request);
      return intakeJson("Send the submission as JSON.", 415);
    }
    if (!isSameOriginSignup(request)) {
      discardRequestBody(request);
      return intakeJson("Submit from the publication website.", 403);
    }
    const contentLength = request.headers.get("content-length");
    if (contentLength !== null) {
      if (!/^\d+$/.test(contentLength)) {
        discardRequestBody(request);
        return intakeJson("Send a valid submission.", 400);
      }
      if (Number(contentLength) > maxSubmissionBytes) {
        discardRequestBody(request);
        return intakeJson("Submission is too large.", 413);
      }
    }
    let value: unknown;
    try { value = JSON.parse(await readBody(request, maxSubmissionBytes)); }
    catch (error) {
      if (error instanceof RequestBodyTimeout) return intakeJson("The submission upload timed out. Your text is still in this form; please try again.", 408);
      return intakeJson(error instanceof RequestTooLarge ? "Submission is too large." : "Send a valid submission.", error instanceof RequestTooLarge ? 413 : 400);
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) return intakeJson("Send a valid submission.", 400);
    const fields = value as Record<string, unknown>;
    if (fields.website !== undefined && typeof fields.website !== "string") return intakeJson("Send a valid submission.", 400);
    if (typeof fields.website === "string" && fields.website.trim()) return intakeJson("Submission received.");
    if (fields.consent !== true) return intakeJson("Confirm that the editor may store and review this submission.", 400);
    const submission = Object.fromEntries(["email", "kind", "title", "message", "sourceUrl"].map((key) => [key, typeof fields[key] === "string" ? fields[key].trim() : ""])) as Submission;
    submission.email = submission.email.toLowerCase();
    if (submission.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email) || /[\x00-\x1f\x7f]/.test(submission.email)) return intakeJson("Enter a valid email address.", 400);
    if (!submissionKinds.some((kind) => kind === submission.kind)) return intakeJson("Choose a submission type.", 400);
    if (submission.title.length < 5 || submission.title.length > 160) return intakeJson("Use a title between 5 and 160 characters.", 400);
    if (submission.message.length < 80 || submission.message.length > 6000) return intakeJson("Include between 80 and 6,000 characters of context.", 400);
    try {
      // Beginners may apply without a portfolio. Source-led pitches still require evidence.
      if (submission.kind !== "Contributor" || submission.sourceUrl) {
        const url = new URL(submission.sourceUrl);
        if (submission.sourceUrl.length > 2048 || url.protocol !== "https:" || url.username || url.password) throw new Error();
      }
    } catch { return intakeJson("Include a direct HTTPS source or record link without credentials.", 400); }
    try {
      const id = await save(submission);
      return intakeJson(`Saved for editorial review. Reference: ${id}. Receipt does not imply acceptance or publication.`, 201);
    } catch (error) {
      if (error instanceof IntakeRateLimit) return intakeJson("Too many requests. Please try again in an hour.", 429);
      return intakeJson("Submissions are temporarily unavailable. Your text has been kept in this form. You can email the editor instead.", 503);
    }
  };
}
