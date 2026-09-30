import { loadIntakeDatabase } from "./intake-database.ts";
import type { Submission } from "./submission-handler.ts";
import { enforceIntakeLimit, type IntakeDatabase } from "./intake-policy.ts";

export function createSubmissionStore(load: () => Promise<IntakeDatabase | undefined>) {
  return async (submission: Submission) => {
    const database = await load();
    if (!database) throw new Error("Submission storage unavailable.");
    await enforceIntakeLimit(database, submission.email, "submission");
    const id = crypto.randomUUID();
    const result = await database.prepare(`INSERT INTO editorial_submissions
      (id, email, kind, title, message, source_url, status, consented_at)
      VALUES (?, ?, ?, ?, ?, ?, 'received', ?)`)
      .bind(id, submission.email, submission.kind, submission.title, submission.message, submission.sourceUrl, new Date().toISOString()).run();
    if (!result.success) throw new Error("Submission write not confirmed.");
    return id;
  };
}
export const saveSubmission = createSubmissionStore(loadIntakeDatabase);
