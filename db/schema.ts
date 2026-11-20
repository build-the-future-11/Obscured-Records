import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  status: text("status").notNull().default("active"),
  consentedAt: text("consented_at").notNull(),
  source: text("source").notNull().default("website"),
}, (table) => [
  uniqueIndex("idx_newsletter_subscribers_email").on(table.email),
]);

export const intakeLimits = sqliteTable("intake_limits", {
  bucket: text("bucket").primaryKey(),
  hits: integer("hits").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
export const editorialSubmissions = sqliteTable("editorial_submissions", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  sourceUrl: text("source_url").notNull(),
  status: text("status").notNull().default("received"),
  consentedAt: text("consented_at").notNull(),
});

export const memberProfiles = sqliteTable("member_profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio").notNull().default(""),
  digestFrequency: text("digest_frequency").notNull().default("none"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const memberLibrary = sqliteTable("member_library", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull(),
  readingState: text("reading_state").notNull().default("Unread"),
  savedAt: text("saved_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_member_library_owner_slug").on(table.userId, table.slug),
]);

export const memberAnnotations = sqliteTable("member_annotations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull(),
  text: text("text").notNull(),
  note: text("note").notNull().default(""),
  anchor: text("anchor").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const memberPreferences = sqliteTable("member_preferences", {
  userId: text("user_id").primaryKey(),
  textSize: text("text_size").notNull().default("standard"),
  theme: text("theme").notNull().default("system"),
  updatedAt: text("updated_at").notNull(),
});

// Portal tables are deliberately separate from the reader library. Nothing in
// this schema grants a role: editor authority is still established server-side
// from the configured owner identity.
export const memberProfileDetails = sqliteTable("member_profile_details", {
  userId: text("user_id").primaryKey(),
  skills: text("skills").notNull().default("[]"),
  interests: text("interests").notNull().default("[]"),
  accomplishments: text("accomplishments").notNull().default(""),
  portfolioUrl: text("portfolio_url").notNull().default(""),
  directoryVisible: integer("directory_visible", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});

export const portalOpportunities = sqliteTable("portal_opportunities", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(),
  deadline: text("deadline"),
  status: text("status").notNull().default("draft"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const portalOpportunityApplications = sqliteTable("portal_opportunity_applications", {
  id: text("id").primaryKey(),
  opportunityId: text("opportunity_id").notNull(),
  applicantUserId: text("applicant_user_id").notNull(),
  applicantName: text("applicant_name").notNull(),
  statement: text("statement").notNull(),
  status: text("status").notNull().default("submitted"),
  reviewerNote: text("reviewer_note").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_opportunity_application").on(table.opportunityId, table.applicantUserId)]);

export const portalProjects = sqliteTable("portal_projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  needs: text("needs").notNull().default(""),
  status: text("status").notNull().default("active"),
  createdBy: text("created_by").notNull(),
  leaderName: text("leader_name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const portalProjectMembers = sqliteTable("portal_project_members", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  userId: text("user_id").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("contributor"),
  status: text("status").notNull().default("requested"),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_project_member").on(table.projectId, table.userId)]);

export const portalMilestones = sqliteTable("portal_milestones", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
  dueDate: text("due_date"),
  status: text("status").notNull().default("planned"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const portalPrograms = sqliteTable("portal_programs", {
  id: text("id").primaryKey(), title: text("title").notNull(), summary: text("summary").notNull(),
  format: text("format").notNull(), enrollmentMode: text("enrollment_mode").notNull().default("apply"),
  deadline: text("deadline"), status: text("status").notNull().default("draft"), createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
});

export const portalProgramEnrollments = sqliteTable("portal_program_enrollments", {
  id: text("id").primaryKey(), programId: text("program_id").notNull(), userId: text("user_id").notNull(),
  displayName: text("display_name").notNull(), statement: text("statement").notNull().default(""),
  status: text("status").notNull().default("submitted"), reviewerNote: text("reviewer_note").notNull().default(""),
  createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_program_enrollment").on(table.programId, table.userId)]);

export const portalEvents = sqliteTable("portal_events", {
  id: text("id").primaryKey(), title: text("title").notNull(), description: text("description").notNull(),
  capacity: integer("capacity"), startsAt: text("starts_at").notNull(), location: text("location").notNull(), status: text("status").notNull().default("draft"),
  createdBy: text("created_by").notNull(), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
});

export const portalEventRegistrations = sqliteTable("portal_event_registrations", {
  id: text("id").primaryKey(), eventId: text("event_id").notNull(), userId: text("user_id").notNull(),
  displayName: text("display_name").notNull(), status: text("status").notNull().default("registered"), createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_event_registration").on(table.eventId, table.userId)]);

export const portalMentorProfiles = sqliteTable("portal_mentor_profiles", {
  userId: text("user_id").primaryKey(), displayName: text("display_name").notNull(), bio: text("bio").notNull(),
  expertise: text("expertise").notNull().default("[]"), availability: text("availability").notNull(), active: integer("active", { mode: "boolean" }).notNull().default(false), updatedAt: text("updated_at").notNull(),
});

export const portalMentorRequests = sqliteTable("portal_mentor_requests", {
  id: text("id").primaryKey(), mentorUserId: text("mentor_user_id").notNull(), requesterUserId: text("requester_user_id").notNull(),
  requesterName: text("requester_name").notNull(), message: text("message").notNull(), status: text("status").notNull().default("requested"),
  feedback: text("feedback").notNull().default(""), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_mentor_request").on(table.mentorUserId, table.requesterUserId)]);

export const portalPosts = sqliteTable("portal_posts", {
  id: text("id").primaryKey(), authorUserId: text("author_user_id").notNull(), authorName: text("author_name").notNull(),
  channel: text("channel").notNull(), body: text("body").notNull(), status: text("status").notNull().default("published"), createdAt: text("created_at").notNull(),
});

export const portalComments = sqliteTable("portal_comments", {
  id: text("id").primaryKey(), postId: text("post_id").notNull(), authorUserId: text("author_user_id").notNull(), authorName: text("author_name").notNull(),
  body: text("body").notNull(), createdAt: text("created_at").notNull(),
});

export const portalResources = sqliteTable("portal_resources", {
  id: text("id").primaryKey(), title: text("title").notNull(), description: text("description").notNull(), url: text("url").notNull(),
  position: integer("position").notNull().default(0), path: text("path").notNull(), status: text("status").notNull().default("draft"), createdBy: text("created_by").notNull(), createdAt: text("created_at").notNull(),
});

export const portalLearningProgress = sqliteTable("portal_learning_progress", {
  id: text("id").primaryKey(), resourceId: text("resource_id").notNull(), userId: text("user_id").notNull(), status: text("status").notNull().default("started"), completedAt: text("completed_at"), updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_learning_progress").on(table.resourceId, table.userId)]);

export const portalPortfolioItems = sqliteTable("portal_portfolio_items", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), title: text("title").notNull(), url: text("url").notNull(), description: text("description").notNull(), createdAt: text("created_at").notNull(),
});

export const portalAnnouncements = sqliteTable("portal_announcements", {
  id: text("id").primaryKey(), title: text("title").notNull(), body: text("body").notNull(), status: text("status").notNull().default("draft"),
  createdBy: text("created_by").notNull(), createdAt: text("created_at").notNull(),
});

export const portalNotifications = sqliteTable("portal_notifications", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), type: text("type").notNull(),
  body: text("body").notNull(), href: text("href").notNull().default(""), readAt: text("read_at"), createdAt: text("created_at").notNull(),
});

export const portalInvitations = sqliteTable("portal_invitations", {
  id: text("id").primaryKey(), kind: text("kind").notNull(), referenceId: text("reference_id").notNull(),
  recipientUserId: text("recipient_user_id").notNull(), senderUserId: text("sender_user_id").notNull(), senderName: text("sender_name").notNull(),
  message: text("message").notNull(), status: text("status").notNull().default("pending"), expiresAt: text("expires_at").notNull(), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
});

export const portalProjectContributions = sqliteTable("portal_project_contributions", {
  id: text("id").primaryKey(), projectId: text("project_id").notNull(), memberUserId: text("member_user_id").notNull(),
  responsibility: text("responsibility").notNull().default(""), outcomeTitle: text("outcome_title").notNull().default(""), outcomeUrl: text("outcome_url").notNull().default(""),
  evidenceNote: text("evidence_note").notNull().default(""), status: text("status").notNull().default("active"), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_project_contribution").on(table.projectId, table.memberUserId)]);

export const portalProgramSessions = sqliteTable("portal_program_sessions", {
  id: text("id").primaryKey(), programId: text("program_id").notNull(), title: text("title").notNull(), startsAt: text("starts_at"), materialUrl: text("material_url").notNull().default(""), createdAt: text("created_at").notNull(),
});

export const portalProgramTasks = sqliteTable("portal_program_tasks", {
  id: text("id").primaryKey(), programId: text("program_id").notNull(), title: text("title").notNull(), dueAt: text("due_at"), createdAt: text("created_at").notNull(),
});

export const portalEventResources = sqliteTable("portal_event_resources", {
  id: text("id").primaryKey(), eventId: text("event_id").notNull(), title: text("title").notNull(), url: text("url").notNull(), attendeeOnly: integer("attendee_only", { mode: "boolean" }).notNull().default(false), createdAt: text("created_at").notNull(),
});

export const portalMentorSessions = sqliteTable("portal_mentor_sessions", {
  id: text("id").primaryKey(), requestId: text("request_id").notNull(), authorUserId: text("author_user_id").notNull(), sessionAt: text("session_at").notNull(), goal: text("goal").notNull(), nextStep: text("next_step").notNull(), createdAt: text("created_at").notNull(),
});

export const portalMentorFeedback = sqliteTable("portal_mentor_feedback", {
  id: text("id").primaryKey(), requestId: text("request_id").notNull(), authorUserId: text("author_user_id").notNull(), rating: integer("rating").notNull(), body: text("body").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_mentor_feedback").on(table.requestId, table.authorUserId)]);

export const portalPostReports = sqliteTable("portal_post_reports", {
  id: text("id").primaryKey(), reporterUserId: text("reporter_user_id").notNull(), postId: text("post_id").notNull(), reason: text("reason").notNull(), status: text("status").notNull().default("open"), resolution: text("resolution").notNull().default(""), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_post_report").on(table.reporterUserId, table.postId)]);

export const portalReactions = sqliteTable("portal_reactions", {
  id: text("id").primaryKey(), postId: text("post_id").notNull(), userId: text("user_id").notNull(), reaction: text("reaction").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_reaction").on(table.postId, table.userId, table.reaction)]);

export const portalAchievements = sqliteTable("portal_achievements", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), title: text("title").notNull(), evidenceUrl: text("evidence_url").notNull().default(""),
  verifiedBy: text("verified_by").notNull(), verifiedAt: text("verified_at").notNull(), createdAt: text("created_at").notNull(),
});

export const portalRoles = sqliteTable("portal_roles", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), role: text("role").notNull(), scope: text("scope").notNull().default("membership"), grantedBy: text("granted_by").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_role").on(table.userId, table.role, table.scope)]);

export const portalNotificationPreferences = sqliteTable("portal_notification_preferences", {
  userId: text("user_id").primaryKey(), reminders: integer("reminders", { mode: "boolean" }).notNull().default(false), updatedAt: text("updated_at").notNull(),
});
export const portalAudit = sqliteTable("portal_audit", {
  id: text("id").primaryKey(), actorUserId: text("actor_user_id").notNull(), action: text("action").notNull(), referenceId: text("reference_id").notNull(), reason: text("reason").notNull(), createdAt: text("created_at").notNull(),
});
export const portalProjectEvidence = sqliteTable("portal_project_evidence", {
  id: text("id").primaryKey(), projectId: text("project_id").notNull(), authorUserId: text("author_user_id").notNull(), title: text("title").notNull(), url: text("url").notNull(), uncertainty: text("uncertainty").notNull(), status: text("status").notNull().default("unreviewed"), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
});
export const portalProjectMessages = sqliteTable("portal_project_messages", {
  id: text("id").primaryKey(), projectId: text("project_id").notNull(), authorUserId: text("author_user_id").notNull(), authorName: text("author_name").notNull(), body: text("body").notNull(), createdAt: text("created_at").notNull(),
});
export const portalTaskProgress = sqliteTable("portal_task_progress", {
  id: text("id").primaryKey(), taskId: text("task_id").notNull(), userId: text("user_id").notNull(), status: text("status").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_task_progress").on(table.taskId, table.userId)]);
export const portalAttendance = sqliteTable("portal_attendance", {
  id: text("id").primaryKey(), eventId: text("event_id").notNull(), userId: text("user_id").notNull(), evidenceUrl: text("evidence_url").notNull(), verifiedBy: text("verified_by").notNull(), verifiedAt: text("verified_at").notNull(),
}, (table) => [uniqueIndex("idx_portal_attendance").on(table.eventId, table.userId)]);
