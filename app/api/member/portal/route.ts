import { and, desc, eq } from "drizzle-orm";
import { memberProfileDetails, memberProfiles, portalAchievements, portalAnnouncements, portalComments, portalEventRegistrations, portalEventResources, portalEvents, portalInvitations, portalLearningProgress, portalMentorFeedback, portalMentorProfiles, portalMentorRequests, portalMentorSessions, portalMilestones, portalNotifications, portalOpportunityApplications, portalOpportunities, portalPortfolioItems, portalPostReports, portalPosts, portalProgramEnrollments, portalPrograms, portalProgramSessions, portalProgramTasks, portalProjectContributions, portalProjectMembers, portalProjects, portalReactions, portalResources, portalRoles } from "@/db/schema";
import { isEditorialOwnerEmail } from "@/lib/editorial-auth";
import { memberJson, readMemberJson, requireMemberApi } from "@/lib/member-api";
import { applicationStates, isMemberId, isOneOf, isPortalId, portalCategories, portalDate, portalList, portalText, portalUrl, projectMemberStates } from "@/lib/portal-contract";
import { isSameOriginSignup } from "@/lib/newsletter-handler";

export const dynamic = "force-dynamic";
const getDb = async () => (await import("@/db")).getDb();
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const published = (table: { status: unknown }) => eq(table.status as never, "published");
async function notify(db: Awaited<ReturnType<typeof getDb>>, userId: string, type: string, body: string, href: string, createdAt: string) {
  await db.insert(portalNotifications).values({ id: id(), userId, type, body, href, readAt: null, createdAt });
}

async function snapshot(userId: string, email: string) {
  const db = await getDb(); const admin = isEditorialOwnerEmail(email);
  const [profileRow, detailRow, publicOpportunities, allOpportunities, projects, publicPrograms, allPrograms, publicEvents, allEvents, resources, announcements, posts, comments, applications, allApplications, memberships, allProjectMembers, milestones, enrollments, allEnrollments, registrations, mentors, myMentorProfile, mentorRequests, incomingMentorRequests, progress, portfolio, notifications, invitations, contributions, sessions, feedback, reactions, reports, achievements, roles, programSessions, programTasks, eventResources] = await Promise.all([
    db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1),
    db.select().from(memberProfileDetails).where(eq(memberProfileDetails.userId, userId)).limit(1),
    db.select().from(portalOpportunities).where(published(portalOpportunities)).orderBy(desc(portalOpportunities.createdAt)),
    admin ? db.select().from(portalOpportunities).orderBy(desc(portalOpportunities.createdAt)) : Promise.resolve([]),
    db.select().from(portalProjects).where(eq(portalProjects.status, "active")).orderBy(desc(portalProjects.createdAt)),
    db.select().from(portalPrograms).where(published(portalPrograms)).orderBy(desc(portalPrograms.createdAt)),
    admin ? db.select().from(portalPrograms).orderBy(desc(portalPrograms.createdAt)) : Promise.resolve([]),
    db.select().from(portalEvents).where(published(portalEvents)).orderBy(portalEvents.startsAt),
    admin ? db.select().from(portalEvents).orderBy(portalEvents.startsAt) : Promise.resolve([]),
    db.select().from(portalResources).where(published(portalResources)).orderBy(desc(portalResources.createdAt)),
    db.select().from(portalAnnouncements).where(published(portalAnnouncements)).orderBy(desc(portalAnnouncements.createdAt)),
    db.select().from(portalPosts).where(eq(portalPosts.status, "published")).orderBy(desc(portalPosts.createdAt)).limit(50),
    db.select().from(portalComments).orderBy(desc(portalComments.createdAt)).limit(150),
    db.select().from(portalOpportunityApplications).where(eq(portalOpportunityApplications.applicantUserId, userId)).orderBy(desc(portalOpportunityApplications.createdAt)),
    admin ? db.select().from(portalOpportunityApplications).orderBy(desc(portalOpportunityApplications.createdAt)) : Promise.resolve([]),
    db.select().from(portalProjectMembers).where(eq(portalProjectMembers.userId, userId)).orderBy(desc(portalProjectMembers.createdAt)),
    db.select().from(portalProjectMembers).orderBy(desc(portalProjectMembers.createdAt)),
    db.select().from(portalMilestones).orderBy(portalMilestones.dueDate),
    db.select().from(portalProgramEnrollments).where(eq(portalProgramEnrollments.userId, userId)).orderBy(desc(portalProgramEnrollments.createdAt)),
    admin ? db.select().from(portalProgramEnrollments).orderBy(desc(portalProgramEnrollments.createdAt)) : Promise.resolve([]),
    db.select().from(portalEventRegistrations).where(eq(portalEventRegistrations.userId, userId)),
    db.select().from(portalMentorProfiles).where(eq(portalMentorProfiles.active, true)),
    db.select().from(portalMentorProfiles).where(eq(portalMentorProfiles.userId, userId)).limit(1),
    db.select().from(portalMentorRequests).where(eq(portalMentorRequests.requesterUserId, userId)).orderBy(desc(portalMentorRequests.createdAt)),
    db.select().from(portalMentorRequests).where(eq(portalMentorRequests.mentorUserId, userId)).orderBy(desc(portalMentorRequests.createdAt)),
    db.select().from(portalLearningProgress).where(eq(portalLearningProgress.userId, userId)),
    db.select().from(portalPortfolioItems).where(eq(portalPortfolioItems.userId, userId)).orderBy(desc(portalPortfolioItems.createdAt)),
    db.select().from(portalNotifications).where(eq(portalNotifications.userId, userId)).orderBy(desc(portalNotifications.createdAt)).limit(50),
    db.select().from(portalInvitations).where(eq(portalInvitations.recipientUserId, userId)).orderBy(desc(portalInvitations.createdAt)),
    db.select().from(portalProjectContributions).where(eq(portalProjectContributions.memberUserId, userId)),
    db.select().from(portalMentorSessions).orderBy(desc(portalMentorSessions.sessionAt)),
    db.select().from(portalMentorFeedback).orderBy(desc(portalMentorFeedback.createdAt)),
    db.select().from(portalReactions),
    admin ? db.select().from(portalPostReports).where(eq(portalPostReports.status, "open")).orderBy(desc(portalPostReports.createdAt)) : Promise.resolve([]),
    db.select().from(portalAchievements).where(eq(portalAchievements.userId, userId)).orderBy(desc(portalAchievements.verifiedAt)),
    admin ? db.select().from(portalRoles).orderBy(desc(portalRoles.createdAt)) : Promise.resolve([]),
    db.select().from(portalProgramSessions).orderBy(portalProgramSessions.startsAt),
    db.select().from(portalProgramTasks).orderBy(portalProgramTasks.dueAt),
    db.select().from(portalEventResources).orderBy(desc(portalEventResources.createdAt)),
  ]);
  const ownProjectIds = new Set(projects.filter((project) => project.createdBy === userId).map((project) => project.id));
  const visiblePostIds = new Set(posts.map((post) => post.id));
  const enrolledProgramIds = new Set(enrollments.filter((enrollment) => ["enrolled", "accepted"].includes(enrollment.status)).map((enrollment) => enrollment.programId));
  const registeredEventIds = new Set(registrations.filter((registration) => registration.status === "registered").map((registration) => registration.eventId));
  const involvedMentorRequestIds = new Set([...mentorRequests, ...incomingMentorRequests].map((request) => request.id));
  return { admin, viewer: { userId }, profile: profileRow[0] ?? null, details: detailRow[0] ?? null, opportunities: publicOpportunities, adminOpportunities: allOpportunities, projects, programs: publicPrograms, adminPrograms: allPrograms, events: publicEvents, adminEvents: allEvents, resources, announcements, posts, comments: comments.filter((comment) => visiblePostIds.has(comment.postId)), applications, adminApplications: allApplications, memberships, teamRequests: allProjectMembers.filter((member) => ownProjectIds.has(member.projectId)), milestones, enrollments, adminEnrollments: allEnrollments, registrations, mentors: mentors.filter((mentor) => mentor.userId !== userId), myMentorProfile: myMentorProfile[0] ?? null, mentorRequests, incomingMentorRequests, progress, portfolio, notifications, invitations, contributions, mentorSessions: sessions.filter((session) => involvedMentorRequestIds.has(session.requestId)), mentorFeedback: feedback.filter((item) => involvedMentorRequestIds.has(item.requestId)), reactions, reports, achievements, roles, programSessions: programSessions.filter((session) => enrolledProgramIds.has(session.programId) || admin), programTasks: programTasks.filter((task) => enrolledProgramIds.has(task.programId) || admin), eventResources: eventResources.filter((resource) => !resource.attendeeOnly || registeredEventIds.has(resource.eventId) || admin) };
}

export async function GET() {
  const auth = await requireMemberApi(); if ("response" in auth) return auth.response;
  return memberJson(await snapshot(auth.user.userId, auth.user.email));
}

function bad(message = "Invalid portal request.") { return memberJson({ error: message }, 400); }
async function ownProject(db: Awaited<ReturnType<typeof getDb>>, projectId: string, userId: string, admin: boolean) {
  const rows = await db.select().from(portalProjects).where(eq(portalProjects.id, projectId)).limit(1);
  return rows[0] && (admin || rows[0].createdBy === userId) ? rows[0] : null;
}

export async function POST(request: Request) {
  const auth = await requireMemberApi(); if ("response" in auth) return auth.response;
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json" || !isSameOriginSignup(request)) return memberJson({ error: "Submit portal changes from the publication website." }, 403);
  const body = await readMemberJson(request, 20_000) as Record<string, unknown> | null;
  if (!body || typeof body.action !== "string") return bad();
  const db = await getDb(), actor = auth.user, admin = isEditorialOwnerEmail(actor.email), stamp = now();
  const profile = (await db.select().from(memberProfiles).where(eq(memberProfiles.userId, actor.userId)).limit(1))[0];
  const displayName = profile?.displayName || actor.displayName;

  if (body.action === "update-profile") {
    const name = portalText(body.displayName, 80, 1), bio = portalText(body.bio, 500), skills = portalList(body.skills), interests = portalList(body.interests), accomplishments = portalText(body.accomplishments, 700), portfolioUrl = portalUrl(body.portfolioUrl);
    if (!name || bio === null || !skills || !interests || accomplishments === null || portfolioUrl === null || typeof body.directoryVisible !== "boolean") return bad("Check your profile fields and directory setting.");
    await db.insert(memberProfiles).values({ userId: actor.userId, email: actor.email, displayName: name, bio, digestFrequency: profile?.digestFrequency || "none", createdAt: profile?.createdAt || stamp, updatedAt: stamp }).onConflictDoUpdate({ target: memberProfiles.userId, set: { email: actor.email, displayName: name, bio, updatedAt: stamp } });
    await db.insert(memberProfileDetails).values({ userId: actor.userId, skills: JSON.stringify(skills), interests: JSON.stringify(interests), accomplishments, portfolioUrl, directoryVisible: body.directoryVisible, updatedAt: stamp }).onConflictDoUpdate({ target: memberProfileDetails.userId, set: { skills: JSON.stringify(skills), interests: JSON.stringify(interests), accomplishments, portfolioUrl, directoryVisible: body.directoryVisible, updatedAt: stamp } });
  } else if (body.action === "apply-opportunity") {
    if (!isPortalId(body.opportunityId)) return bad(); const statement = portalText(body.statement, 2500, 40); if (!statement) return bad("Explain how you can contribute in at least 40 characters.");
    const opportunity = (await db.select().from(portalOpportunities).where(and(eq(portalOpportunities.id, body.opportunityId), eq(portalOpportunities.status, "published"))).limit(1))[0];
    if (!opportunity || (opportunity.deadline && Date.parse(opportunity.deadline) < Date.now())) return bad("This opportunity is no longer accepting applications.");
    await db.insert(portalOpportunityApplications).values({ id: id(), opportunityId: opportunity.id, applicantUserId: actor.userId, applicantName: displayName, statement, status: "submitted", reviewerNote: "", createdAt: stamp, updatedAt: stamp }).onConflictDoUpdate({ target: [portalOpportunityApplications.opportunityId, portalOpportunityApplications.applicantUserId], set: { applicantName: displayName, statement, status: "submitted", reviewerNote: "", updatedAt: stamp } });
  } else if (body.action === "create-project") {
    const title = portalText(body.title, 120, 5), summary = portalText(body.summary, 1600, 40), needs = portalText(body.needs, 500); if (!title || !summary || needs === null) return bad("Give the project a title, a clear summary, and optional collaborator needs.");
    const projectId = id(); await db.insert(portalProjects).values({ id: projectId, title, summary, needs, status: "active", createdBy: actor.userId, leaderName: displayName, createdAt: stamp, updatedAt: stamp });
    await db.insert(portalProjectMembers).values({ id: id(), projectId, userId: actor.userId, displayName, role: "lead", status: "accepted", note: "", createdAt: stamp, updatedAt: stamp });
  } else if (body.action === "join-project") {
    if (!isPortalId(body.projectId)) return bad(); const note = portalText(body.note, 1000, 20); if (!note) return bad("Include a short note about how you can help.");
    const project = (await db.select().from(portalProjects).where(and(eq(portalProjects.id, body.projectId), eq(portalProjects.status, "active"))).limit(1))[0]; if (!project || project.createdBy === actor.userId) return bad("That project is unavailable for a join request.");
    await db.insert(portalProjectMembers).values({ id: id(), projectId: project.id, userId: actor.userId, displayName, role: "contributor", status: "requested", note, createdAt: stamp, updatedAt: stamp }).onConflictDoUpdate({ target: [portalProjectMembers.projectId, portalProjectMembers.userId], set: { note, status: "requested", updatedAt: stamp } });
  } else if (body.action === "add-milestone") {
    if (!isPortalId(body.projectId)) return bad(); const project = await ownProject(db, body.projectId, actor.userId, admin), title = portalText(body.title, 160, 4), dueDate = portalDate(body.dueDate); if (!project || !title || dueDate === null) return bad("Only the project lead can add a valid milestone.");
    await db.insert(portalMilestones).values({ id: id(), projectId: project.id, title, dueDate: dueDate || null, status: "planned", createdAt: stamp, updatedAt: stamp });
  } else if (body.action === "update-project-member") {
    if (!isPortalId(body.projectId) || !isPortalId(body.memberId) || !isOneOf(body.status, projectMemberStates)) return bad(); if (!await ownProject(db, body.projectId, actor.userId, admin)) return memberJson({ error: "Only the project lead can review join requests." }, 403);
    const membership = (await db.select().from(portalProjectMembers).where(and(eq(portalProjectMembers.id, body.memberId), eq(portalProjectMembers.projectId, body.projectId))).limit(1))[0]; if (!membership) return bad("Project request not found.");
    await db.update(portalProjectMembers).set({ status: body.status, updatedAt: stamp }).where(and(eq(portalProjectMembers.id, body.memberId), eq(portalProjectMembers.projectId, body.projectId)));
    await notify(db, membership.userId, "project_join", `Your project join request was ${body.status}.`, "/member/projects", stamp);
  } else if (body.action === "enroll-program") {
    if (!isPortalId(body.programId)) return bad(); const program = (await db.select().from(portalPrograms).where(and(eq(portalPrograms.id, body.programId), eq(portalPrograms.status, "published"))).limit(1))[0], statement = portalText(body.statement, 2500);
    if (!program || statement === null || (program.enrollmentMode === "apply" && statement.length < 40)) return bad("This program needs a valid application statement.");
    await db.insert(portalProgramEnrollments).values({ id: id(), programId: program.id, userId: actor.userId, displayName, statement, status: program.enrollmentMode === "direct" ? "enrolled" : "submitted", reviewerNote: "", createdAt: stamp, updatedAt: stamp }).onConflictDoUpdate({ target: [portalProgramEnrollments.programId, portalProgramEnrollments.userId], set: { statement, status: program.enrollmentMode === "direct" ? "enrolled" : "submitted", reviewerNote: "", updatedAt: stamp } });
  } else if (body.action === "register-event") {
    if (!isPortalId(body.eventId)) return bad(); const event = (await db.select().from(portalEvents).where(and(eq(portalEvents.id, body.eventId), eq(portalEvents.status, "published"))).limit(1))[0]; if (!event) return bad("That event is unavailable.");
    await db.insert(portalEventRegistrations).values({ id: id(), eventId: event.id, userId: actor.userId, displayName, status: "registered", createdAt: stamp }).onConflictDoNothing();
  } else if (body.action === "save-mentor-profile") {
    const bio = portalText(body.bio, 800, 40), expertise = portalList(body.expertise), availability = portalText(body.availability, 200, 3); if (!bio || !expertise || !availability || typeof body.active !== "boolean") return bad("Complete your mentor profile before making it visible.");
    await db.insert(portalMentorProfiles).values({ userId: actor.userId, displayName, bio, expertise: JSON.stringify(expertise), availability, active: body.active, updatedAt: stamp }).onConflictDoUpdate({ target: portalMentorProfiles.userId, set: { displayName, bio, expertise: JSON.stringify(expertise), availability, active: body.active, updatedAt: stamp } });
  } else if (body.action === "request-mentor") {
    if (!isMemberId(body.mentorUserId) || body.mentorUserId === actor.userId) return bad(); const message = portalText(body.message, 1200, 30); if (!message) return bad("Write at least 30 characters for the mentor request.");
    const mentor = (await db.select().from(portalMentorProfiles).where(and(eq(portalMentorProfiles.userId, body.mentorUserId), eq(portalMentorProfiles.active, true))).limit(1))[0]; if (!mentor) return bad("That mentor is unavailable.");
    await db.insert(portalMentorRequests).values({ id: id(), mentorUserId: mentor.userId, requesterUserId: actor.userId, requesterName: displayName, message, status: "requested", feedback: "", createdAt: stamp, updatedAt: stamp }).onConflictDoUpdate({ target: [portalMentorRequests.mentorUserId, portalMentorRequests.requesterUserId], set: { message, status: "requested", updatedAt: stamp } });
  } else if (body.action === "create-post") {
    const channel = portalText(body.channel, 40, 2), postBody = portalText(body.body, 3000, 10); if (!channel || !postBody) return bad("Choose a channel and write a substantive post.");
    await db.insert(portalPosts).values({ id: id(), authorUserId: actor.userId, authorName: displayName, channel, body: postBody, status: "published", createdAt: stamp });
  } else if (body.action === "comment") {
    if (!isPortalId(body.postId)) return bad(); const comment = portalText(body.body, 1200, 2); if (!comment) return bad("Write a comment before posting."); const post = (await db.select().from(portalPosts).where(and(eq(portalPosts.id, body.postId), eq(portalPosts.status, "published"))).limit(1))[0]; if (!post) return bad("That discussion is unavailable.");
    await db.insert(portalComments).values({ id: id(), postId: post.id, authorUserId: actor.userId, authorName: displayName, body: comment, createdAt: stamp });
  } else if (body.action === "track-resource") {
    if (!isPortalId(body.resourceId) || !isOneOf(body.status, ["started", "completed"] as const)) return bad(); const resource = (await db.select().from(portalResources).where(and(eq(portalResources.id, body.resourceId), eq(portalResources.status, "published"))).limit(1))[0]; if (!resource) return bad("That resource is unavailable.");
    await db.insert(portalLearningProgress).values({ id: id(), resourceId: resource.id, userId: actor.userId, status: body.status, completedAt: body.status === "completed" ? stamp : null, updatedAt: stamp }).onConflictDoUpdate({ target: [portalLearningProgress.resourceId, portalLearningProgress.userId], set: { status: body.status, completedAt: body.status === "completed" ? stamp : null, updatedAt: stamp } });
  } else if (body.action === "add-portfolio") {
    const title = portalText(body.title, 120, 3), url = portalUrl(body.url), description = portalText(body.description, 700, 10); if (!title || !url || !description) return bad("Add a titled HTTPS link and a short description.");
    await db.insert(portalPortfolioItems).values({ id: id(), userId: actor.userId, title, url, description, createdAt: stamp });
  } else if (body.action === "mark-notification-read") {
    if (!isPortalId(body.notificationId)) return bad();
    await db.update(portalNotifications).set({ readAt: stamp }).where(and(eq(portalNotifications.id, body.notificationId), eq(portalNotifications.userId, actor.userId)));
  } else if (body.action === "cancel-event-registration") {
    if (!isPortalId(body.eventId)) return bad();
    await db.update(portalEventRegistrations).set({ status: "cancelled" }).where(and(eq(portalEventRegistrations.eventId, body.eventId), eq(portalEventRegistrations.userId, actor.userId)));
  } else if (body.action === "withdraw-program") {
    if (!isPortalId(body.programId)) return bad();
    await db.update(portalProgramEnrollments).set({ status: "withdrawn", updatedAt: stamp }).where(and(eq(portalProgramEnrollments.programId, body.programId), eq(portalProgramEnrollments.userId, actor.userId)));
  } else if (body.action === "update-milestone") {
    if (!isPortalId(body.milestoneId) || !isOneOf(body.status, ["planned", "in_progress", "done"] as const)) return bad();
    const milestone = (await db.select().from(portalMilestones).where(eq(portalMilestones.id, body.milestoneId)).limit(1))[0]; if (!milestone) return bad("Milestone not found.");
    const membership = (await db.select().from(portalProjectMembers).where(and(eq(portalProjectMembers.projectId, milestone.projectId), eq(portalProjectMembers.userId, actor.userId), eq(portalProjectMembers.status, "accepted"))).limit(1))[0];
    if (!membership && !admin) return memberJson({ error: "Only an accepted team member can update this milestone." }, 403);
    await db.update(portalMilestones).set({ status: body.status, updatedAt: stamp }).where(eq(portalMilestones.id, milestone.id));
  } else if (body.action === "set-project-contribution") {
    if (!isPortalId(body.projectId) || !isMemberId(body.memberUserId)) return bad(); const project = await ownProject(db, body.projectId, actor.userId, admin), responsibility = portalText(body.responsibility, 240), outcomeTitle = portalText(body.outcomeTitle, 160), outcomeUrl = portalUrl(body.outcomeUrl), evidenceNote = portalText(body.evidenceNote, 1200);
    if (!project || responsibility === null || outcomeTitle === null || outcomeUrl === null || evidenceNote === null) return bad("Only the project lead can save a valid contribution record.");
    const accepted = (await db.select().from(portalProjectMembers).where(and(eq(portalProjectMembers.projectId, project.id), eq(portalProjectMembers.userId, body.memberUserId), eq(portalProjectMembers.status, "accepted"))).limit(1))[0]; if (!accepted) return bad("Contributions can only be assigned to accepted team members.");
    await db.insert(portalProjectContributions).values({ id: id(), projectId: project.id, memberUserId: accepted.userId, responsibility, outcomeTitle, outcomeUrl, evidenceNote, status: "active", createdAt: stamp, updatedAt: stamp }).onConflictDoUpdate({ target: [portalProjectContributions.projectId, portalProjectContributions.memberUserId], set: { responsibility, outcomeTitle, outcomeUrl, evidenceNote, updatedAt: stamp } });
    await notify(db, accepted.userId, "project_contribution", `Your project responsibility for ${project.title} was updated.`, "/member/projects", stamp);
  } else if (body.action === "respond-mentor-request") {
    if (!isPortalId(body.requestId) || !isOneOf(body.status, ["accepted", "declined"] as const)) return bad(); const feedback = portalText(body.feedback, 1200); if (feedback === null) return bad();
    const mentorRequest = (await db.select().from(portalMentorRequests).where(eq(portalMentorRequests.id, body.requestId)).limit(1))[0]; if (!mentorRequest || mentorRequest.mentorUserId !== actor.userId) return memberJson({ error: "Only the requested mentor can respond." }, 403);
    await db.update(portalMentorRequests).set({ status: body.status, feedback, updatedAt: stamp }).where(eq(portalMentorRequests.id, mentorRequest.id));
    await notify(db, mentorRequest.requesterUserId, "mentor_request", `Your mentorship request was ${body.status}.`, "/member/mentorship", stamp);
  } else if (body.action === "log-mentor-session") {
    if (!isPortalId(body.requestId)) return bad(); const sessionAt = portalDate(body.sessionAt, true), goal = portalText(body.goal, 700, 5), nextStep = portalText(body.nextStep, 700, 5); if (!sessionAt || !goal || !nextStep) return bad();
    const mentorRequest = (await db.select().from(portalMentorRequests).where(eq(portalMentorRequests.id, body.requestId)).limit(1))[0]; if (!mentorRequest || mentorRequest.status !== "accepted" || ![mentorRequest.mentorUserId, mentorRequest.requesterUserId].includes(actor.userId)) return memberJson({ error: "Only matched participants can log a session." }, 403);
    await db.insert(portalMentorSessions).values({ id: id(), requestId: mentorRequest.id, authorUserId: actor.userId, sessionAt, goal, nextStep, createdAt: stamp });
  } else if (body.action === "leave-mentor-feedback") {
    const rating = Number(body.rating); if (!isPortalId(body.requestId) || !Number.isInteger(rating) || rating < 1 || rating > 5) return bad(); const feedbackBody = portalText(body.body, 1000, 10); if (!feedbackBody) return bad();
    const mentorRequest = (await db.select().from(portalMentorRequests).where(eq(portalMentorRequests.id, body.requestId)).limit(1))[0]; if (!mentorRequest || mentorRequest.status !== "accepted" || ![mentorRequest.mentorUserId, mentorRequest.requesterUserId].includes(actor.userId)) return memberJson({ error: "Only matched participants can provide feedback." }, 403);
    await db.insert(portalMentorFeedback).values({ id: id(), requestId: mentorRequest.id, authorUserId: actor.userId, rating, body: feedbackBody, createdAt: stamp }).onConflictDoUpdate({ target: [portalMentorFeedback.requestId, portalMentorFeedback.authorUserId], set: { rating, body: feedbackBody, createdAt: stamp } });
  } else if (body.action === "react-post") {
    if (!isPortalId(body.postId) || !isOneOf(body.reaction, ["useful", "thanks", "insightful"] as const)) return bad();
    const post = (await db.select().from(portalPosts).where(and(eq(portalPosts.id, body.postId), eq(portalPosts.status, "published"))).limit(1))[0]; if (!post) return bad("That discussion is unavailable.");
    await db.insert(portalReactions).values({ id: id(), postId: post.id, userId: actor.userId, reaction: body.reaction, createdAt: stamp }).onConflictDoNothing();
  } else if (body.action === "report-post") {
    if (!isPortalId(body.postId)) return bad(); const reason = portalText(body.reason, 800, 10); if (!reason) return bad("Tell moderators what needs review.");
    const post = (await db.select().from(portalPosts).where(eq(portalPosts.id, body.postId)).limit(1))[0]; if (!post) return bad("Post not found.");
    await db.insert(portalPostReports).values({ id: id(), reporterUserId: actor.userId, postId: post.id, reason, status: "open", resolution: "", createdAt: stamp, updatedAt: stamp }).onConflictDoUpdate({ target: [portalPostReports.reporterUserId, portalPostReports.postId], set: { reason, status: "open", resolution: "", updatedAt: stamp } });
  } else if (body.action === "send-invitation") {
    if (!isPortalId(body.projectId) || !isMemberId(body.recipientUserId)) return bad(); const project = await ownProject(db, body.projectId, actor.userId, admin), message = portalText(body.message, 800, 10), expiresAt = portalDate(body.expiresAt, true); if (!project || !message || !expiresAt || Date.parse(expiresAt) <= Date.now()) return bad("Use a future expiry and a valid project invitation.");
    const recipient = (await db.select().from(memberProfileDetails).where(and(eq(memberProfileDetails.userId, body.recipientUserId), eq(memberProfileDetails.directoryVisible, true))).limit(1))[0]; if (!recipient) return bad("Only opt-in directory members can receive an invitation.");
    const inviteId = id(); await db.insert(portalInvitations).values({ id: inviteId, kind: "project", referenceId: project.id, recipientUserId: recipient.userId, senderUserId: actor.userId, senderName: displayName, message, status: "pending", expiresAt, createdAt: stamp, updatedAt: stamp });
    await notify(db, recipient.userId, "project_invitation", `You were invited to ${project.title}.`, "/member/projects", stamp);
  } else if (body.action === "respond-invitation") {
    if (!isPortalId(body.invitationId) || !isOneOf(body.status, ["accepted", "declined"] as const)) return bad(); const invitation = (await db.select().from(portalInvitations).where(and(eq(portalInvitations.id, body.invitationId), eq(portalInvitations.recipientUserId, actor.userId))).limit(1))[0]; if (!invitation || invitation.status !== "pending" || Date.parse(invitation.expiresAt) < Date.now()) return bad("This invitation is no longer available.");
    await db.update(portalInvitations).set({ status: body.status, updatedAt: stamp }).where(eq(portalInvitations.id, invitation.id));
    if (body.status === "accepted" && invitation.kind === "project") await db.insert(portalProjectMembers).values({ id: id(), projectId: invitation.referenceId, userId: actor.userId, displayName, role: "contributor", status: "accepted", note: "Joined by invitation.", createdAt: stamp, updatedAt: stamp }).onConflictDoUpdate({ target: [portalProjectMembers.projectId, portalProjectMembers.userId], set: { status: "accepted", updatedAt: stamp } });
    await notify(db, invitation.senderUserId, "invitation_response", `${displayName} ${body.status} your invitation.`, "/member/projects", stamp);
  } else if (body.action === "admin-publish") {
    if (!admin) return memberJson({ error: "Administrator access is required." }, 403); const type = body.type, title = portalText(body.title, 140, 3), summary = portalText(body.summary, 2500, 20); if (!title || !summary) return bad("A title and clear member-facing description are required.");
    if (type === "opportunity") { const category = isOneOf(body.category, portalCategories) ? body.category : null, deadline = portalDate(body.deadline); if (!category || deadline === null) return bad(); await db.insert(portalOpportunities).values({ id: id(), title, summary, category, deadline: deadline || null, status: "published", createdBy: actor.userId, createdAt: stamp, updatedAt: stamp }); }
    else if (type === "program") { const format = portalText(body.format, 80, 3), deadline = portalDate(body.deadline), enrollmentMode = isOneOf(body.enrollmentMode, ["apply", "direct"] as const) ? body.enrollmentMode : null; if (!format || deadline === null || !enrollmentMode) return bad(); await db.insert(portalPrograms).values({ id: id(), title, summary, format, enrollmentMode, deadline: deadline || null, status: "published", createdBy: actor.userId, createdAt: stamp, updatedAt: stamp }); }
    else if (type === "event") { const startsAt = portalDate(body.startsAt, true), location = portalText(body.location, 160, 2); if (!startsAt || !location) return bad(); await db.insert(portalEvents).values({ id: id(), title, description: summary, startsAt, location, status: "published", createdBy: actor.userId, createdAt: stamp, updatedAt: stamp }); }
    else if (type === "resource") { const url = portalUrl(body.url), path = portalText(body.path, 100, 2); if (!url || !path) return bad(); await db.insert(portalResources).values({ id: id(), title, description: summary, url, path, status: "published", createdBy: actor.userId, createdAt: stamp }); }
    else if (type === "announcement") await db.insert(portalAnnouncements).values({ id: id(), title, body: summary, status: "published", createdBy: actor.userId, createdAt: stamp });
    else return bad("Unknown publish type.");
  } else if (body.action === "admin-review") {
    if (!admin || !isPortalId(body.id) || !isOneOf(body.status, applicationStates)) return admin ? bad() : memberJson({ error: "Administrator access is required." }, 403); const note = portalText(body.note, 1500); if (note === null) return bad();
    if (body.kind === "opportunity") { const application = (await db.select().from(portalOpportunityApplications).where(eq(portalOpportunityApplications.id, body.id)).limit(1))[0]; if (!application) return bad("Application not found."); await db.update(portalOpportunityApplications).set({ status: body.status, reviewerNote: note, updatedAt: stamp }).where(eq(portalOpportunityApplications.id, body.id)); await notify(db, application.applicantUserId, "opportunity_review", `Your opportunity application is now ${body.status.replaceAll("_", " ")}.`, "/member/opportunities", stamp); }
    else if (body.kind === "program") { const enrollment = (await db.select().from(portalProgramEnrollments).where(eq(portalProgramEnrollments.id, body.id)).limit(1))[0]; if (!enrollment) return bad("Enrollment not found."); await db.update(portalProgramEnrollments).set({ status: body.status, reviewerNote: note, updatedAt: stamp }).where(eq(portalProgramEnrollments.id, body.id)); await notify(db, enrollment.userId, "program_review", `Your program enrollment is now ${body.status.replaceAll("_", " ")}.`, "/member/programs", stamp); }
    else return bad();
  } else if (body.action === "admin-lifecycle") {
    if (!admin || !isPortalId(body.id) || !isOneOf(body.status, ["published", "closed", "paused", "archived"] as const)) return admin ? bad() : memberJson({ error: "Administrator access is required." }, 403);
    if (body.kind === "opportunity") await db.update(portalOpportunities).set({ status: body.status, updatedAt: stamp }).where(eq(portalOpportunities.id, body.id));
    else if (body.kind === "program") await db.update(portalPrograms).set({ status: body.status, updatedAt: stamp }).where(eq(portalPrograms.id, body.id));
    else if (body.kind === "project") await db.update(portalProjects).set({ status: body.status, updatedAt: stamp }).where(eq(portalProjects.id, body.id));
    else return bad();
  } else if (body.action === "admin-moderate-post") {
    if (!admin || !isPortalId(body.postId) || !isOneOf(body.status, ["published", "hidden"] as const)) return admin ? bad() : memberJson({ error: "Administrator access is required." }, 403); const resolution = portalText(body.resolution, 1000); if (resolution === null) return bad();
    await db.update(portalPosts).set({ status: body.status }).where(eq(portalPosts.id, body.postId));
    await db.update(portalPostReports).set({ status: "resolved", resolution, updatedAt: stamp }).where(eq(portalPostReports.postId, body.postId));
  } else if (body.action === "admin-add-schedule") {
    if (!admin || !isPortalId(body.programId) || !isOneOf(body.kind, ["session", "task"] as const)) return admin ? bad() : memberJson({ error: "Administrator access is required." }, 403); const title = portalText(body.title, 180, 3), when = portalDate(body.when), materialUrl = portalUrl(body.materialUrl); if (!title || when === null || materialUrl === null) return bad();
    const program = (await db.select().from(portalPrograms).where(eq(portalPrograms.id, body.programId)).limit(1))[0]; if (!program) return bad("Program not found.");
    if (body.kind === "session") await db.insert(portalProgramSessions).values({ id: id(), programId: program.id, title, startsAt: when || null, materialUrl, createdAt: stamp });
    else await db.insert(portalProgramTasks).values({ id: id(), programId: program.id, title, dueAt: when || null, createdAt: stamp });
  } else if (body.action === "admin-add-event-resource") {
    if (!admin || !isPortalId(body.eventId)) return admin ? bad() : memberJson({ error: "Administrator access is required." }, 403); const title = portalText(body.title, 180, 3), url = portalUrl(body.url); if (!title || !url || typeof body.attendeeOnly !== "boolean") return bad();
    const event = (await db.select().from(portalEvents).where(eq(portalEvents.id, body.eventId)).limit(1))[0]; if (!event) return bad("Event not found.");
    await db.insert(portalEventResources).values({ id: id(), eventId: event.id, title, url, attendeeOnly: body.attendeeOnly, createdAt: stamp });
  } else if (body.action === "admin-verify-achievement") {
    if (!admin || !isMemberId(body.userId)) return admin ? bad() : memberJson({ error: "Administrator access is required." }, 403); const title = portalText(body.title, 160, 3), evidenceUrl = portalUrl(body.evidenceUrl); if (!title || evidenceUrl === null) return bad();
    await db.insert(portalAchievements).values({ id: id(), userId: body.userId, title, evidenceUrl, verifiedBy: actor.userId, verifiedAt: stamp, createdAt: stamp });
    await notify(db, body.userId, "achievement", `An editor verified: ${title}.`, "/member", stamp);
  } else if (body.action === "admin-grant-role") {
    if (!admin || !isMemberId(body.userId) || !isOneOf(body.role, ["moderator", "facilitator"] as const)) return admin ? bad() : memberJson({ error: "Administrator access is required." }, 403); const scope = portalText(body.scope, 80, 2); if (!scope) return bad();
    await db.insert(portalRoles).values({ id: id(), userId: body.userId, role: body.role, scope, grantedBy: actor.userId, createdAt: stamp }).onConflictDoNothing();
  } else return bad("Unknown portal action.");
  return memberJson({ ok: true, portal: await snapshot(actor.userId, actor.email) });
}
