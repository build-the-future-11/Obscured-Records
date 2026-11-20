import assert from "node:assert/strict";

// Render the real portal components. Only the local API transport is replaced;
// held responses let an editor continue typing before the submitted copy saves.
const adminPortal = {
  admin: true, canModerate: false, assignedRoles: [],
  engagement: { applications: 0, registrations: 0, activeProjects: 0 },
  adminOpportunities: [], adminPrograms: [], projects: [], roles: [], audit: [],
  adminApplications: [], adminEnrollments: [], reports: [],
  adminEvents: [{ id: "event-1", title: "First event" }, { id: "event-2", title: "Second event" }],
};
const memberPortal = {
  admin: false, canModerate: false, assignedRoles: [], viewer: { userId: "fixture-member" },
  memberships: [], projects: [], teamRequests: [], contributions: [],
  comments: [], reactions: [], posts: [], portfolio: [],
};
const initialDescription = "The submitted description is a complete editorial draft.";
const newerDescription = "The newer description must survive completion of the previous save.";
const publish = {
  view: "admin", button: "Publish now", action: "admin-publish",
  initial: { Title: "Submitted title", "Member-facing description": initialDescription },
  payload: { type: "opportunity", title: "Submitted title", summary: initialDescription },
};
const resource = {
  view: "admin", button: "Publish attendee resource", action: "admin-add-event-resource",
  initial: { Event: "event-1", "Resource title": "Submitted resource", "HTTPS link": "https://example.test/first" },
  payload: { eventId: "event-1", title: "Submitted resource", url: "https://example.test/first", attendeeOnly: true },
};
const project = {
  view: "projects", button: "Create project", action: "create-project",
  initial: { "Working title": "Submitted project", "Research brief": initialDescription, "Collaborator needs": "Source reviewers" },
  payload: { title: "Submitted project", summary: initialDescription, needs: "Source reviewers" },
};
const community = {
  view: "community", button: "Post to community", action: "create-post",
  initial: { Channel: "Research methods", Post: "Submitted community post" },
  payload: { channel: "Research methods", body: "Submitted community post" },
};
const portfolio = {
  view: "directory", button: "Add portfolio item", action: "add-portfolio",
  initial: { "Work title": "Submitted portfolio work", "HTTPS link": "https://example.test/first", "Contribution description": initialDescription },
  payload: { title: "Submitted portfolio work", url: "https://example.test/first", description: initialDescription },
};
const scenarios = [
  {
    ...publish, name: "publish preserves newer title and description",
    edit: { Title: "Newer title", "Member-facing description": newerDescription },
  },
  {
    ...publish, name: "publish preserves a draft after only the item type changes",
    edit: { "Item type": "announcement" },
  },
  {
    ...publish, name: "publish preserves a draft after only an option changes",
    edit: { Category: "Editorial" },
  },
  {
    ...publish, name: "unchanged publish clears submitted copy and retains options",
    initial: { ...publish.initial, Category: "Editorial" },
    expected: { Title: "", "Member-facing description": "", Category: "Editorial" },
  },
  {
    ...publish, name: "failed publish retains newer edits until a manual retry",
    edit: { Title: "Retry title", "Member-facing description": newerDescription }, fail: true,
    retryPayload: { type: "opportunity", title: "Retry title", summary: newerDescription },
    retryExpected: { Title: "", "Member-facing description": "" },
  },
  {
    ...resource, name: "shared action form preserves newer fields and selected event",
    edit: { Event: "event-2", "Resource title": "Newer resource", "HTTPS link": "https://example.test/second" },
  },
  {
    ...resource, name: "shared action form preserves an option-only change",
    edit: { Event: "event-2" },
  },
  {
    ...resource, name: "unchanged shared action form clears all submitted fields",
    expected: { Event: "", "Resource title": "", "HTTPS link": "" },
  },
  {
    ...resource, name: "failed shared action form retains edits until a manual retry",
    edit: { "Resource title": "Retry resource" }, fail: true,
    retryPayload: { ...resource.payload, title: "Retry resource" },
    retryExpected: { Event: "", "Resource title": "", "HTTPS link": "" },
  },
  {
    ...project, name: "project creation preserves newer title, brief and collaborator needs",
    edit: { "Working title": "Newer project", "Research brief": newerDescription, "Collaborator needs": "Archive reviewers" },
  },
  {
    ...project, name: "unchanged project creation clears all submitted fields",
    expected: { "Working title": "", "Research brief": "", "Collaborator needs": "" },
  },
  {
    ...project, name: "failed project creation retains edits until a manual retry",
    edit: { "Working title": "Retry project", "Collaborator needs": "Archive reviewers" }, fail: true,
    retryPayload: { ...project.payload, title: "Retry project", needs: "Archive reviewers" },
    retryExpected: { "Working title": "", "Research brief": "", "Collaborator needs": "" },
  },
  {
    ...community, name: "community posting preserves a newer message and channel",
    edit: { Channel: "Project updates", Post: "Newer community message" },
  },
  {
    ...community, name: "community posting preserves a channel-only change",
    edit: { Channel: "Source finding" },
  },
  {
    ...community, name: "unchanged community posting clears the message and retains the channel",
    expected: { Channel: "Research methods", Post: "" },
  },
  {
    ...community, name: "failed community posting retains edits until a manual retry",
    edit: { Channel: "Project updates", Post: "Retry community message" }, fail: true,
    retryPayload: { channel: "Project updates", body: "Retry community message" },
    retryExpected: { Channel: "Project updates", Post: "" },
  },
  {
    ...portfolio, name: "portfolio creation preserves newer title, link and description",
    edit: { "Work title": "Newer portfolio work", "HTTPS link": "https://example.test/second", "Contribution description": newerDescription },
  },
  {
    ...portfolio, name: "unchanged portfolio creation clears all submitted fields",
    expected: { "Work title": "", "HTTPS link": "", "Contribution description": "" },
  },
  {
    ...portfolio, name: "failed portfolio creation retains edits until a manual retry",
    edit: { "Work title": "Retry portfolio work", "HTTPS link": "https://example.test/second" }, fail: true,
    retryPayload: { ...portfolio.payload, title: "Retry portfolio work", url: "https://example.test/second" },
    retryExpected: { "Work title": "", "HTTPS link": "", "Contribution description": "" },
  },
];

function fieldNamed(form, label) {
  // These implicit labels also contain select options or textarea text.
  return form.getByLabel(new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
}

async function editFields(form, values) {
  for (const [label, value] of Object.entries(values || {})) {
    const field = fieldNamed(form, label);
    if (await field.evaluate(element => element.tagName) === "SELECT") await field.selectOption(value);
    else await field.fill(value);
  }
}

async function checkFields(form, values) {
  for (const [label, value] of Object.entries(values)) {
    assert.equal(await fieldNamed(form, label).inputValue(), value, `${label}: draft must reflect only acknowledged resets`);
  }
}

function checkPayload(actual, action, expected) {
  assert.equal(actual.action, action);
  for (const [key, value] of Object.entries(expected)) assert.deepEqual(actual[key], value, `Submitted ${key} must be the clicked snapshot`);
}

export async function verifyPortalSaveDrafts({ browser, base }) {
  const failures = [];
  for (const scenario of scenarios) {
    const context = await browser.newContext();
    const portal = scenario.view === "admin" ? adminPortal : memberPortal;
    const pending = [];
    const requests = [];
    const browserErrors = [];
    try {
      await context.route("**/*", async route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== base) return route.abort("blockedbyclient");
        if (url.pathname !== "/api/member/portal") return route.continue();
        if (request.method() === "GET") return route.fulfill({ json: portal });
        assert.equal(request.method(), "POST");
        requests.push(request.postDataJSON());
        const response = await new Promise(resolveResponse => pending.push(resolveResponse));
        return route.fulfill(response);
      });
      const page = await context.newPage();
      page.setDefaultTimeout(5_000);
      page.on("pageerror", error => browserErrors.push(error.message));
      await page.goto(`${base}/portal-retry.html?view=${scenario.view}`);
      const form = page.locator("form").filter({ has: page.getByRole("button", { name: scenario.button, exact: true }) });
      await form.waitFor();
      const button = form.getByRole("button", { name: scenario.button, exact: true });
      await editFields(form, scenario.initial);

      async function startSave() {
        const started = page.waitForRequest(request => new URL(request.url()).pathname === "/api/member/portal" && request.method() === "POST");
        await button.click();
        await started;
        await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent === "Saving…");
        assert.equal(await button.isDisabled(), true, "Submit stays disabled while the request is pending");
      }
      async function finishSave(fail = false) {
        assert.ok(pending.length, "The local API must hold a real browser POST");
        pending.shift()(fail
          ? { status: 503, json: { error: "Fixture save failed. Please try again." } }
          : { status: 200, json: { ok: true, portal } });
        await page.waitForFunction(expected => document.querySelector('[role="status"]')?.textContent === expected,
          fail ? "Fixture save failed. Please try again." : "Saved.");
        // Let React flush the form handler's continuation as well as the parent.
        await page.evaluate(() => new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame))));
        assert.equal(await button.isDisabled(), false, "The form must unlock after completion");
      }

      await startSave();
      assert.equal(requests.length, 1);
      checkPayload(requests[0], scenario.action, scenario.payload);
      await editFields(form, scenario.edit);
      await finishSave(scenario.fail);
      await checkFields(form, scenario.expected || { ...scenario.initial, ...scenario.edit });
      assert.equal(requests.length, 1, "Preserving a newer draft must not automatically resubmit it");
      if (scenario.retryPayload) {
        await startSave();
        assert.equal(requests.length, 2, "Only a manual retry may send the edited draft");
        checkPayload(requests[1], scenario.action, scenario.retryPayload);
        await finishSave();
        await checkFields(form, scenario.retryExpected);
        assert.equal(requests.length, 2);
      }
      assert.deepEqual(browserErrors, []);
      console.log(`PASS portal save browser: ${scenario.name}`);
    } catch (error) {
      failures.push(`${scenario.name}: ${error.message}`);
      console.error(`FAIL portal save browser: ${scenario.name}: ${error.message}`);
      if (browserErrors.length) console.error(browserErrors.join("\n"));
    } finally {
      for (const release of pending) release({ status: 503, json: { error: "Fixture closed." } });
      await context.close();
    }
  }
  assert.equal(failures.length, 0, failures.join("\n"));
}
