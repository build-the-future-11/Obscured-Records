import { and, eq, inArray, sql, desc } from "drizzle-orm";
import * as s from "@/db/schema";
import { isMemberId, isOneOf, isPortalId, portalText, portalUrl } from "@/lib/portal-contract";
import { memberJson } from "@/lib/member-api";
type Db = ReturnType<typeof import("@/db").getDb>;
type Actor = { userId: string; displayName: string };
const id = () => crypto.randomUUID();
const bad = (error: string, status = 400) => memberJson({ error }, status);
export async function audit(db: Db, actor: string, action: string, referenceId: string, reason: string, stamp: string) {
  await db.insert(s.portalAudit).values({ id: id(), actorUserId: actor, action, referenceId, reason, createdAt: stamp });
}
export async function acceptedTeam(db: Db, projectId: string, userId: string) {
  return (await db.select().from(s.portalProjectMembers).where(and(eq(s.portalProjectMembers.projectId, projectId), eq(s.portalProjectMembers.userId, userId), eq(s.portalProjectMembers.status, "accepted"))).limit(1))[0];
}
export async function portalExtras(db: Db, userId: string, admin: boolean) {
  const memberships = await db.select().from(s.portalProjectMembers).where(and(eq(s.portalProjectMembers.userId, userId), eq(s.portalProjectMembers.status, "accepted")));
  const projectIds = memberships.map(row => row.projectId);
  const [preferences, evidence, messages, taskProgress, attendance, auditRows, assignedRoles] = await Promise.all([
    db.select().from(s.portalNotificationPreferences).where(eq(s.portalNotificationPreferences.userId, userId)).limit(1),
    projectIds.length ? db.select().from(s.portalProjectEvidence).where(inArray(s.portalProjectEvidence.projectId, projectIds)) : [],
    projectIds.length ? db.select().from(s.portalProjectMessages).where(inArray(s.portalProjectMessages.projectId, projectIds)).orderBy(desc(s.portalProjectMessages.createdAt)).limit(100) : [],
    db.select().from(s.portalTaskProgress).where(eq(s.portalTaskProgress.userId, userId)),
    db.select().from(s.portalAttendance).where(eq(s.portalAttendance.userId, userId)),
    admin ? db.select().from(s.portalAudit).orderBy(desc(s.portalAudit.createdAt)).limit(100) : [],
    db.select().from(s.portalRoles).where(eq(s.portalRoles.userId, userId)),
  ]);
  const counts = admin ? {
    applications: (await db.select({ total: sql<number>`count(*)` }).from(s.portalOpportunityApplications))[0].total,
    registrations: (await db.select({ total: sql<number>`count(*)` }).from(s.portalEventRegistrations).where(eq(s.portalEventRegistrations.status, "registered")))[0].total,
    activeProjects: (await db.select({ total: sql<number>`count(*)` }).from(s.portalProjects).where(eq(s.portalProjects.status, "active")))[0].total,
  } : null;
  return { notificationPreferences: preferences[0] ?? { reminders: false }, evidence, messages, taskProgress, attendance, audit: auditRows, assignedRoles, engagement: counts };
}

// Returns null for the original action dispatcher, true after a successful write,
// or an error response. All identity values come from the authenticated server.
export async function applyPortalWorkflow(db: Db, actor: Actor, admin: boolean, body: Record<string, unknown>, stamp: string): Promise<Response | true | null> {
  const action = body.action;
  if (action === "confirm-contribution") {
    if (!isPortalId(body.contributionId)) return bad("Choose a contribution.");
    await db.update(s.portalProjectContributions).set({ status: "confirmed", updatedAt: stamp }).where(and(eq(s.portalProjectContributions.id, body.contributionId), eq(s.portalProjectContributions.memberUserId, actor.userId)));
  } else if (action === "notification-preferences") {
    if (typeof body.reminders !== "boolean") return bad("Choose whether to show event reminders.");
    await db.insert(s.portalNotificationPreferences).values({ userId: actor.userId, reminders: body.reminders, updatedAt: stamp }).onConflictDoUpdate({ target: s.portalNotificationPreferences.userId, set: { reminders: body.reminders, updatedAt: stamp } });
  } else if (action === "register-event") {
    if (!isPortalId(body.eventId)) return bad("Choose an event.");
    // One SQL statement arbitrates the last seat. D1 serializes writes; two
    // requests cannot both observe and claim the same remaining capacity.
    await db.run(sql`INSERT INTO portal_event_registrations (id,event_id,user_id,display_name,status,created_at)
      SELECT ${id()},id,${actor.userId},${actor.displayName},
        CASE WHEN capacity IS NULL OR (SELECT count(*) FROM portal_event_registrations WHERE event_id=portal_events.id AND status='registered') < capacity THEN 'registered' ELSE 'waitlisted' END,${stamp}
      FROM portal_events WHERE id=${body.eventId} AND status='published' AND starts_at > ${stamp}
      ON CONFLICT(event_id,user_id) DO UPDATE SET status=excluded.status, created_at=excluded.created_at
      WHERE portal_event_registrations.status='cancelled'`);
    const row = (await db.select().from(s.portalEventRegistrations).where(and(eq(s.portalEventRegistrations.eventId, body.eventId), eq(s.portalEventRegistrations.userId, actor.userId))).limit(1))[0];
    if (!row || row.status === "cancelled") return bad("Registration is closed for this event.");
  } else if (action === "cancel-event-registration") {
    if (!isPortalId(body.eventId)) return bad("Choose an event.");
    await db.batch([
      db.update(s.portalEventRegistrations).set({ status: "cancelled" }).where(and(eq(s.portalEventRegistrations.eventId, body.eventId), eq(s.portalEventRegistrations.userId, actor.userId))),
      db.update(s.portalEventRegistrations).set({ status: "registered" }).where(sql`id IN (
        SELECT r.id FROM portal_event_registrations r JOIN portal_events e ON e.id=r.event_id
        WHERE r.event_id=${body.eventId} AND r.status='waitlisted' AND e.status='published' AND e.starts_at > ${stamp}
        AND (e.capacity IS NULL OR (SELECT count(*) FROM portal_event_registrations WHERE event_id=e.id AND status='registered') < e.capacity)
        ORDER BY r.created_at,r.rowid LIMIT 1)`),
    ]);
  } else if (action === "project-evidence" || action === "project-message") {
    if (!isPortalId(body.projectId)) return bad("Choose a project.");
    const team = await acceptedTeam(db, body.projectId, actor.userId);
    const project = (await db.select().from(s.portalProjects).where(eq(s.portalProjects.id, body.projectId)).limit(1))[0];
    if (!team || project?.status !== "active") return bad("Only accepted teammates on an active project can contribute.", 403);
    if (action === "project-message") {
      const text = portalText(body.body, 2000, 2); if (!text) return bad("Write a message of 2–2000 characters.");
      await db.insert(s.portalProjectMessages).values({ id: id(), projectId: body.projectId, authorUserId: actor.userId, authorName: actor.displayName, body: text, createdAt: stamp });
    } else {
      const title = portalText(body.title, 160, 3), url = portalUrl(body.url), uncertainty = portalText(body.uncertainty, 1200, 10);
      if (!title || !url || !uncertainty) return bad("Include a source link and explain what remains uncertain.");
      await db.insert(s.portalProjectEvidence).values({ id: id(), projectId: body.projectId, authorUserId: actor.userId, title, url, uncertainty, status: "unreviewed", createdAt: stamp, updatedAt: stamp });
    }
  } else if (action === "review-project-evidence") {
    if (!isPortalId(body.evidenceId) || !isOneOf(body.status, ["unreviewed", "reviewed", "disputed"] as const)) return bad("Choose an evidence review state.");
    const row = (await db.select().from(s.portalProjectEvidence).where(eq(s.portalProjectEvidence.id, body.evidenceId)).limit(1))[0];
    if (!row || !(await acceptedTeam(db, row.projectId, actor.userId))) return bad("Only accepted teammates can review this evidence.", 403);
    const reason = portalText(body.reason, 1000, 10); if (!reason) return bad("Explain the review decision.");
    await db.update(s.portalProjectEvidence).set({ status: body.status, updatedAt: stamp }).where(eq(s.portalProjectEvidence.id, row.id));
    await audit(db, actor.userId, action, row.id, reason, stamp);
  } else if (action === "complete-program-task") {
    if (!isPortalId(body.taskId) || !isOneOf(body.status, ["started", "completed"] as const)) return bad("Choose a task and progress state.");
    const task = (await db.select().from(s.portalProgramTasks).where(eq(s.portalProgramTasks.id, body.taskId)).limit(1))[0];
    if (!task) return bad("Task not found.");
    const enrolled = (await db.select().from(s.portalProgramEnrollments).where(and(eq(s.portalProgramEnrollments.programId, task.programId), eq(s.portalProgramEnrollments.userId, actor.userId), inArray(s.portalProgramEnrollments.status, ["accepted", "enrolled"]))).limit(1))[0];
    if (!enrolled) return bad("Only enrolled participants can record task progress.", 403);
    await db.insert(s.portalTaskProgress).values({ id: id(), taskId: task.id, userId: actor.userId, status: body.status, updatedAt: stamp }).onConflictDoUpdate({ target: [s.portalTaskProgress.taskId, s.portalTaskProgress.userId], set: { status: body.status, updatedAt: stamp } });
  } else if (action === "admin-verify-attendance") {
    if (!admin) return bad("Administrator access is required.", 403);
    if (!isPortalId(body.eventId) || !isMemberId(body.userId)) return bad("Choose an event and member.");
    const evidenceUrl = portalUrl(body.evidenceUrl); if (!evidenceUrl) return bad("Attendance verification requires an evidence URL.");
    const event = (await db.select().from(s.portalEvents).where(eq(s.portalEvents.id, body.eventId)).limit(1))[0];
    const registration = (await db.select().from(s.portalEventRegistrations).where(and(eq(s.portalEventRegistrations.eventId, body.eventId), eq(s.portalEventRegistrations.userId, body.userId), eq(s.portalEventRegistrations.status, "registered"))).limit(1))[0];
    if (!event || event.startsAt > stamp || !registration) return bad("Verify a registered attendee after the event starts.");
    await db.insert(s.portalAttendance).values({ id: id(), eventId: event.id, userId: body.userId, evidenceUrl, verifiedBy: actor.userId, verifiedAt: stamp }).onConflictDoUpdate({ target: [s.portalAttendance.eventId, s.portalAttendance.userId], set: { evidenceUrl, verifiedBy: actor.userId, verifiedAt: stamp } });
    await audit(db, actor.userId, action, event.id, evidenceUrl, stamp);
  } else if (action === "admin-revoke-role") {
    if (!admin) return bad("Administrator access is required.", 403);
    if (!isPortalId(body.roleId)) return bad("Choose a role.");
    await db.delete(s.portalRoles).where(eq(s.portalRoles.id, body.roleId));
    await audit(db, actor.userId, action, body.roleId, "Role revoked by owner", stamp);
  } else return null;
  return true;
}
