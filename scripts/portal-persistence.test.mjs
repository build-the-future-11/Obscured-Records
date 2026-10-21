import test, { after, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/d1";

// Exercise the actual handlers, schema and pinned D1 driver. Only the hosting
// identity and D1 transport are replaced; SQL executes in an isolated SQLite DB.
const root = new URL("../", import.meta.url);
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/app/chatgpt-auth") {
      return { shortCircuit: true, url: "data:text/javascript,export async function getChatGPTUser(){return globalThis.__memberPersistenceUser}" };
    }
    if (specifier === "@/lib/editorial-auth") return { shortCircuit: true, url: "data:text/javascript,export function isEditorialOwnerEmail(email){return email==='owner@example.test'}" };
    if (specifier.startsWith(".") && context.parentURL?.startsWith(root.href) && !context.parentURL.includes("node_modules")) {
      const resolved = new URL(specifier + ".ts", context.parentURL);
      if (existsSync(resolved)) return nextResolve(resolved.href, context);
    }
    if (specifier === "@/db") {
      return { shortCircuit: true, url: "data:text/javascript,export function getDb(){return globalThis.__memberPersistenceDb}" };
    }
    // Native Node needs the extension for the shared upload-reader re-export.
    if (specifier === "./member-request" && context.parentURL === new URL("lib/member-api.ts", root).href) {
      return nextResolve(new URL("lib/member-request.ts", root).href, context);
    }
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`${specifier.slice(2)}.ts`, root).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const portal = await import("../app/api/member/portal/route.ts");
const exporter = await import("../app/api/member/export/route.ts");
const directory = await import("../app/api/member/directory/route.ts");
let sqlite;
function member(userId = "member-a") {
  globalThis.__memberPersistenceUser = { userId, email: `${userId}@example.test`, displayName: userId, fullName: null };
}
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  for (const file of readdirSync(new URL("drizzle/", root)).filter(f => f.endsWith(".sql")).sort()) sqlite.exec(readFileSync(new URL(`drizzle/${file}`, root), "utf8"));
  globalThis.__memberPersistenceDb = drizzle({
    prepare(sql) {
      function statement(params = []) {
        function execute(raw = false, run = false) {
          const query = sqlite.prepare(sql);
          if (run) { const result = query.run(...params); return { success: true, results: [], meta: { changes: Number(result.changes) } }; }
          const rows = query.all(...params);
          return raw ? rows.map(row => Object.values(row)) : { success: true, results: rows, meta: { changes: Number(sqlite.prepare("SELECT changes() n").get().n) } };
        }
        return { bind: (...params) => statement(params), run: () => execute(false, true), all: () => execute(), raw: () => execute(true) };
      }
      return statement();
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try { const result = statements.map(statement => statement.all()); sqlite.exec("COMMIT"); return result; }
      catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  });
  member();
});
afterEach(() => { sqlite.close(); delete globalThis.__memberPersistenceDb; delete globalThis.__memberPersistenceUser; });
after(() => hook.deregister());
async function act(action, body = {}, expected = 200) {
  const response = await portal.POST(new Request("https://obscured.example.test/api/member/portal", { method: "POST", headers: { "content-type": "application/json", origin: "https://obscured.example.test" }, body: JSON.stringify({ action, ...body }) }));
  const data = await response.json(); assert.equal(response.status, expected, JSON.stringify(data)); return data.portal || data;
}
async function read() { const response = await portal.GET(); assert.equal(response.status, 200); return response.json(); }
async function publish(type, fields = {}) {
  member("owner");
  const state = await act("admin-publish", { type, title: "Real test listing", summary: "A real bounded test description with sufficient detail.", category: "Research", deadline: "", format: "Workshop", enrollmentMode: "apply", startsAt: "2099-10-24T12:00:00Z", location: "Online", path: "Methods", url: "https://example.test/source", ...fields });
  const key = { opportunity: "opportunities", program: "programs", event: "events", resource: "resources" }[type];
  return state[key].find(row => row.title === (fields.title || "Real test listing")).id;
}
const statement = "I can review primary records and document uncertainties carefully.";
async function createProject() { member(); const state = await act("create-project", { title: "Archive project", summary: statement, needs: "Source review" }); return state.projects[0].id; }
async function join(projectId, user = "member-b") {
  member(user); let state = await act("join-project", { projectId, note: statement });
  const memberId = state.memberships[0].id;
  member(); await act("update-project-member", { projectId, memberId, status: "accepted" });
}
test("portal denies anonymous and cross-origin writes", async () => {
  globalThis.__memberPersistenceUser = null; assert.equal((await portal.GET()).status, 401);
  assert.equal((await exporter.GET()).status, 401);
  member(); const response = await portal.POST(new Request("https://obscured.example.test/api/member/portal", { method: "POST", headers: { "content-type": "application/json", origin: "https://evil.example" }, body: JSON.stringify({ action: "create-project" }) })); assert.equal(response.status, 403);
  await act("admin-publish", { type: "announcement", title: "Invalid admin", summary: statement }, 403);
});
test("reviewed applications and accepted memberships survive repeat submission", async () => {
  const opportunityId = await publish("opportunity"); member(); let state = await act("apply-opportunity", { opportunityId, statement }); const application = state.applications[0];
  member("owner"); await act("admin-review", { kind: "opportunity", id: application.id, status: "accepted", note: "Reviewed evidence" });
  member(); state = await act("apply-opportunity", { opportunityId, statement: statement + " updated" }); assert.equal(state.applications[0].status, "accepted"); assert.equal(state.applications[0].reviewerNote, "Reviewed evidence");
  const projectId = await createProject(); await join(projectId); member("member-b"); state = await act("join-project", { projectId, note: statement }); assert.equal(state.memberships[0].status, "accepted");
});
test("project creation is atomic if lead membership fails", async () => {
  sqlite.exec("CREATE TRIGGER reject_lead BEFORE INSERT ON portal_project_members BEGIN SELECT RAISE(ABORT, 'injected failure'); END");
  await assert.rejects(createProject(), /injected failure/); assert.equal(sqlite.prepare("SELECT count(*) n FROM portal_projects").get().n, 0);
});
test("event capacity, waitlist promotion, cancellation and re-registration persist", async () => {
  const eventId = await publish("event", { capacity: 1 }); member(); let state = await act("register-event", { eventId }); assert.equal(state.registrations[0].status, "registered");
  member("member-b"); state = await act("register-event", { eventId }); assert.equal(state.registrations[0].status, "waitlisted");
  member(); await act("cancel-event-registration", { eventId }); member("member-b"); assert.equal((await read()).registrations[0].status, "registered");
  member(); state = await act("register-event", { eventId }); assert.equal(state.registrations[0].status, "waitlisted");
  assert.equal(sqlite.prepare("SELECT count(*) n FROM portal_event_registrations WHERE status='registered'").get().n, 1);
});
test("past events and expired programs reject new participation", async () => {
  const eventId = await publish("event", { startsAt: "2000-01-01T00:00:00Z" }); member(); await act("register-event", { eventId }, 400);
  const programId = await publish("program", { deadline: "2000-01-01T00:00:00Z" }); member(); await act("enroll-program", { programId, statement }, 400);
});
test("team evidence, messages and milestones exclude unrelated members", async () => {
  const projectId = await createProject(); await act("add-milestone", { projectId, title: "Review source", dueDate: "" });
  await act("project-evidence", { projectId, title: "Primary source", url: "https://example.test/evidence", uncertainty: "Authorship still needs independent verification." });
  await act("project-message", { projectId, body: "Private team message" });
  member("member-c"); let state = await read(); assert.equal(state.evidence.length, 0); assert.equal(state.messages.length, 0); assert.equal(state.milestones.length, 0);
  await act("project-message", { projectId, body: "Uninvited message" }, 403);
  await join(projectId); member("member-b"); state = await read(); assert.equal(state.evidence.length, 1); assert.equal(state.messages.length, 1);
  await act("update-milestone", { milestoneId: state.milestones[0].id, status: "done" });
});
test("learning prerequisites and member export preserve account boundaries", async () => {
  const first = await publish("resource", { title: "First module", position: 1 }); const second = await publish("resource", { title: "Second module", position: 2 });
  member(); await act("track-resource", { resourceId: second, status: "completed" }, 400); await act("track-resource", { resourceId: first, status: "completed" }); await act("track-resource", { resourceId: second, status: "completed" });
  const exported = await exporter.GET(); assert.match(exported.headers.get("content-disposition"), /attachment/); assert.equal((await exported.json()).data.learning.length, 2);
  member("member-b"); assert.equal((await (await exporter.GET()).json()).data.learning.length, 0);
});
test("program schedules and task progress require accepted enrollment", async () => {
  const programId = await publish("program"); await act("admin-add-schedule", { programId, kind: "task", title: "Source review task", when: "", materialUrl: "" });
  const taskId = (await read()).programTasks[0].id;
  member(); await act("complete-program-task", { taskId, status: "completed" }, 403); let state = await act("enroll-program", { programId, statement }); assert.equal(state.programTasks.length, 0);
  member("owner"); await act("admin-review", { kind: "program", id: state.enrollments[0].id, status: "accepted", note: "Accepted" });
  member(); state = await act("complete-program-task", { taskId, status: "completed" }); assert.equal(state.taskProgress.length, 1);
  state = await act("enroll-program", { programId, statement }); assert.equal(state.enrollments[0].status, "accepted");
});
test("moderation is reasoned, auditable, restorable and scoped", async () => {
  let state = await act("create-post", { channel: "Source finding", body: "Please review this primary source." }); const postId = state.posts[0].id;
  await act("react-post", { postId, reaction: "useful" }); state = await act("react-post", { postId, reaction: "useful" }); assert.equal(state.reactions.length, 0);
  await act("admin-moderate-post", { postId, status: "hidden", resolution: "A reasoned moderator decision." }, 403);
  member("owner"); await act("admin-grant-role", { userId: "member-b", role: "moderator", scope: "community" });
  member("member-b"); await act("admin-moderate-post", { postId, status: "hidden", resolution: "A reasoned moderator decision." });
  member(); assert.equal((await read()).posts.length, 0);
  member("owner"); state = await act("admin-moderate-post", { postId, status: "published", resolution: "Restored after checking the context." }); assert.ok(state.audit.length >= 3);
});
test("mentor session privacy differs from author-only feedback", async () => {
  await act("save-mentor-profile", { bio: statement, expertise: ["Archives"], availability: "Weekends", active: true });
  member("member-b"); let state = await act("request-mentor", { mentorUserId: "member-a", message: statement }); const requestId = state.mentorRequests[0].id;
  member(); await act("respond-mentor-request", { requestId, status: "accepted", feedback: "Let us review sources" });
  await act("log-mentor-session", { requestId, sessionAt: "2026-10-01T12:00:00Z", goal: "Source review", nextStep: "Find independent corroboration" });
  await act("leave-mentor-feedback", { requestId, rating: 4, body: "Useful private reflection" });
  member("member-b"); state = await read(); assert.equal(state.mentorSessions.length, 1); assert.equal(state.mentorFeedback.length, 0);
  member("member-c"); assert.equal((await read()).mentorSessions.length, 0);
});

test("invitation acceptance checks recipient, expiry and active project", async () => {
  const projectId = await createProject(); member("member-b");
  await act("update-profile", { displayName: "Member B", bio: "", skills: [], interests: [], accomplishments: "", portfolioUrl: "", directoryVisible: true });
  member(); await act("send-invitation", { projectId, recipientUserId: "member-b", message: "Join our archival review project", expiresAt: "2099-01-01T00:00:00Z" });
  member("member-b"); const invitationId = (await read()).invitations[0].id;
  member("member-c"); await act("respond-invitation", { invitationId, status: "accepted" }, 400);
  member("owner"); await act("admin-lifecycle", { kind: "project", id: projectId, status: "paused", reason: "Paused until source permissions are resolved." });
  member("member-b"); await act("respond-invitation", { invitationId, status: "accepted" }, 400);
  member("owner"); await act("admin-lifecycle", { kind: "project", id: projectId, status: "active", reason: "Permissions are now documented and reviewed." });
  member("member-b"); const state = await act("respond-invitation", { invitationId, status: "accepted" }); assert.equal(state.memberships[0].status, "accepted");
  await act("respond-invitation", { invitationId, status: "accepted" }, 400);
});
test("directory opt-out and non-contact fields are enforced", async () => {
  await act("update-profile", { displayName: "Researcher", bio: "Archive research", skills: ["Archives"], interests: [], accomplishments: "", portfolioUrl: "", directoryVisible: true });
  member("member-b"); let result = await directory.GET(new Request("https://obscured.example.test/api/member/directory?q=Researcher")); let data = await result.json(); assert.equal(data.members.length, 1); assert.equal(data.members[0].email, undefined);
  member(); await act("update-profile", { displayName: "Researcher", bio: "", skills: [], interests: [], accomplishments: "", portfolioUrl: "", directoryVisible: false });
  member("member-b"); result = await directory.GET(new Request("https://obscured.example.test/api/member/directory?q=Researcher")); data = await result.json(); assert.equal(data.members.length, 0);
});
test("attendance and achievements require owner verification with evidence", async () => {
  const eventId = await publish("event"); member(); await act("register-event", { eventId });
  await act("admin-verify-attendance", { eventId, userId: "member-a", evidenceUrl: "https://example.test/attendance" }, 403);
  member("owner"); await act("admin-verify-attendance", { eventId, userId: "member-a", evidenceUrl: "https://example.test/attendance" }, 400);
  sqlite.prepare("UPDATE portal_events SET starts_at=? WHERE id=?").run("2000-01-01T00:00:00Z", eventId);
  await act("admin-verify-attendance", { eventId, userId: "member-a", evidenceUrl: "https://example.test/attendance" });
  await act("admin-verify-achievement", { userId: "member-a", title: "Reviewed a real source", evidenceUrl: "" }, 400);
  member(); assert.equal((await read()).attendance.length, 1); member("member-b"); assert.equal((await read()).attendance.length, 0);
});
test("facilitator rights are limited to their assigned program and revocable", async () => {
  const first = await publish("program", { title: "First program" }); const second = await publish("program", { title: "Second program" });
  await act("admin-grant-role", { userId: "member-b", role: "facilitator", scope: first });
  const roleId = (await read()).roles[0].id;
  member("member-b"); await act("admin-add-schedule", { programId: first, kind: "task", title: "Review a source", when: "", materialUrl: "" });
  await act("admin-add-schedule", { programId: second, kind: "task", title: "Review a source", when: "", materialUrl: "" }, 403);
  member("owner"); await act("admin-revoke-role", { roleId });
  member("member-b"); await act("admin-add-schedule", { programId: first, kind: "task", title: "Review a source", when: "", materialUrl: "" }, 403);
});
test("optional reminders default off and write throttling is account scoped", async () => {
  assert.equal((await read()).notificationPreferences.reminders, false);
  let state = await act("notification-preferences", { reminders: true }); assert.equal(state.notificationPreferences.reminders, true);
  for (let i = 1; i < 60; i++) await act("notification-preferences", { reminders: true });
  await act("notification-preferences", { reminders: false }, 429);
  member("member-b"); state = await act("notification-preferences", { reminders: false }); assert.equal(state.notificationPreferences.reminders, false);
});
test("contribution credits require the affected member's confirmation", async () => {
  const projectId = await createProject(); await join(projectId);
  await act("set-project-contribution", { projectId, memberUserId: "member-b", responsibility: "Source verification", outcomeTitle: "Reviewed source", outcomeUrl: "https://example.test/outcome", evidenceNote: "Checked the original document" });
  member("member-b"); let state = await read(); const contributionId = state.contributions[0].id; assert.equal(state.contributions[0].status, "pending_confirmation");
  member("member-c"); await act("confirm-contribution", { contributionId });
  member("member-b"); assert.equal((await read()).contributions[0].status, "pending_confirmation"); state = await act("confirm-contribution", { contributionId }); assert.equal(state.contributions[0].status, "confirmed");
});
