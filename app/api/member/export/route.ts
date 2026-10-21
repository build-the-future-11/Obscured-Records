import { eq } from "drizzle-orm";
import * as s from "@/db/schema";
import { requireMemberApi } from "@/lib/member-api";
export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await requireMemberApi(); if ("response" in auth) return auth.response;
  const db = (await import("@/db")).getDb(), user = auth.user.userId;
  // Each query is owner-scoped. Never serialize the shared/admin snapshot.
  const data = {
    profile: await db.select().from(s.memberProfiles).where(eq(s.memberProfiles.userId, user)),
    details: await db.select().from(s.memberProfileDetails).where(eq(s.memberProfileDetails.userId, user)),
    preferences: await db.select().from(s.memberPreferences).where(eq(s.memberPreferences.userId, user)),
    library: await db.select().from(s.memberLibrary).where(eq(s.memberLibrary.userId, user)),
    annotations: await db.select().from(s.memberAnnotations).where(eq(s.memberAnnotations.userId, user)),
    applications: await db.select().from(s.portalOpportunityApplications).where(eq(s.portalOpportunityApplications.applicantUserId, user)),
    enrollments: await db.select().from(s.portalProgramEnrollments).where(eq(s.portalProgramEnrollments.userId, user)),
    memberships: await db.select().from(s.portalProjectMembers).where(eq(s.portalProjectMembers.userId, user)),
    contributions: await db.select().from(s.portalProjectContributions).where(eq(s.portalProjectContributions.memberUserId, user)),
    projects: await db.select().from(s.portalProjects).where(eq(s.portalProjects.createdBy, user)),
    registrations: await db.select().from(s.portalEventRegistrations).where(eq(s.portalEventRegistrations.userId, user)),
    learning: await db.select().from(s.portalLearningProgress).where(eq(s.portalLearningProgress.userId, user)),
    tasks: await db.select().from(s.portalTaskProgress).where(eq(s.portalTaskProgress.userId, user)),
    portfolio: await db.select().from(s.portalPortfolioItems).where(eq(s.portalPortfolioItems.userId, user)),
    mentorProfile: await db.select().from(s.portalMentorProfiles).where(eq(s.portalMentorProfiles.userId, user)),
    mentorRequests: await db.select().from(s.portalMentorRequests).where(eq(s.portalMentorRequests.requesterUserId, user)),
    mentorFeedback: await db.select().from(s.portalMentorFeedback).where(eq(s.portalMentorFeedback.authorUserId, user)),
    mentorSessions: await db.select().from(s.portalMentorSessions).where(eq(s.portalMentorSessions.authorUserId, user)),
    evidence: await db.select().from(s.portalProjectEvidence).where(eq(s.portalProjectEvidence.authorUserId, user)),
    messages: await db.select().from(s.portalProjectMessages).where(eq(s.portalProjectMessages.authorUserId, user)),
    posts: await db.select().from(s.portalPosts).where(eq(s.portalPosts.authorUserId, user)),
    comments: await db.select().from(s.portalComments).where(eq(s.portalComments.authorUserId, user)),
    reports: await db.select().from(s.portalPostReports).where(eq(s.portalPostReports.reporterUserId, user)),
    reactions: await db.select().from(s.portalReactions).where(eq(s.portalReactions.userId, user)),
    notifications: await db.select().from(s.portalNotifications).where(eq(s.portalNotifications.userId, user)),
    notificationPreferences: await db.select().from(s.portalNotificationPreferences).where(eq(s.portalNotificationPreferences.userId, user)),
    invitations: await db.select().from(s.portalInvitations).where(eq(s.portalInvitations.recipientUserId, user)),
    achievements: await db.select().from(s.portalAchievements).where(eq(s.portalAchievements.userId, user)),
    attendance: await db.select().from(s.portalAttendance).where(eq(s.portalAttendance.userId, user)),
    roles: await db.select().from(s.portalRoles).where(eq(s.portalRoles.userId, user)),
  };
  return Response.json({ exportedAt: new Date().toISOString(), data }, { headers: { "cache-control": "private, no-store", "content-disposition": "attachment; filename=obscured-records-participation.json" } });
}
