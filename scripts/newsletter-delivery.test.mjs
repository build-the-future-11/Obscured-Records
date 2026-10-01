import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { createNewsletterToken, readNewsletterToken, newsletterTokenSecret } from "../lib/newsletter-tokens.ts";
import { newsletterDeliveryConfig, newsletterDeliveryConfigured, sendNewsletterConfirmation } from "../lib/newsletter-delivery.ts";
import { createNewsletterStatusStore, createNewsletterStore } from "../lib/newsletter-store.ts";

const secret = "0123456789abcdef0123456789abcdef";
const email = "reader@example.com";

test("confirmation and unsubscribe tokens round-trip without exposing the email", async () => {
  const confirm = await createNewsletterToken(email, "confirm", secret, 10_000);
  const unsubscribe = await createNewsletterToken(email, "unsubscribe", secret, 10_000);
  assert.doesNotMatch(confirm, /reader|example/i);
  assert.notEqual(confirm, unsubscribe);
  assert.equal(await readNewsletterToken(confirm, "confirm", secret, 1_000), email);
  assert.equal(await readNewsletterToken(unsubscribe, "unsubscribe", secret, 1_000), email);
  assert.equal(await readNewsletterToken(confirm, "unsubscribe", secret, 1_000), undefined);
});

test("newsletter tokens fail closed when expired, tampered or signed with another secret", async () => {
  const token = await createNewsletterToken(email, "confirm", secret, 2_000);
  assert.equal(await readNewsletterToken(token, "confirm", secret, 2_001), undefined);
  const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
  assert.equal(await readNewsletterToken(tampered, "confirm", secret, 1_000), undefined);
  assert.equal(await readNewsletterToken(token, "confirm", "abcdef0123456789abcdef0123456789", 1_000), undefined);
  assert.equal(await readNewsletterToken("not.a.valid.token", "confirm", secret, 1_000), undefined);
});

test("newsletter token secret is optional when delivery is off and strict when provided", () => {
  assert.equal(newsletterTokenSecret({}), undefined);
  assert.throws(() => newsletterTokenSecret({ NEWSLETTER_TOKEN_SECRET: "short" }));
  assert.equal(newsletterTokenSecret({ NEWSLETTER_TOKEN_SECRET: secret }), secret);
});

test("delivery stays off unless explicitly enabled with complete valid server configuration", () => {
  assert.equal(newsletterDeliveryConfigured({}), false);
  assert.equal(newsletterDeliveryConfig({}), undefined);
  assert.equal(newsletterDeliveryConfig({ NEWSLETTER_DELIVERY_ENABLED: "false" }), undefined);
  assert.throws(() => newsletterDeliveryConfig({ NEWSLETTER_DELIVERY_ENABLED: "true" }));
  assert.throws(() => newsletterDeliveryConfig({
    NEWSLETTER_DELIVERY_ENABLED: "true",
    RESEND_API_KEY: "re_test_123456789",
    NEWSLETTER_FROM_EMAIL: "brief@example.com",
    NEWSLETTER_SITE_ORIGIN: "http://publication.example",
    NEWSLETTER_TOKEN_SECRET: secret,
  }));
  const config = newsletterDeliveryConfig({
    NEWSLETTER_DELIVERY_ENABLED: "true",
    RESEND_API_KEY: "re_test_123456789",
    NEWSLETTER_FROM_EMAIL: "brief@example.com",
    NEWSLETTER_SITE_ORIGIN: "https://publication.example",
    NEWSLETTER_TOKEN_SECRET: secret,
  });
  assert.equal(config.siteOrigin, "https://publication.example");
  assert.equal(config.fromEmail, "brief@example.com");
});

test("disabled delivery makes no provider request", async () => {
  let requests = 0;
  assert.equal(await sendNewsletterConfirmation(email, undefined, async () => { requests++; return new Response(); }), false);
  assert.equal(requests, 0);
});

test("confirmation delivery sends only to Resend with opaque confirmation and unsubscribe links", async () => {
  const calls = [];
  const config = {
    apiKey: "re_test_123456789",
    fromEmail: "brief@example.com",
    siteOrigin: "https://publication.example",
    tokenSecret: secret,
  };
  assert.equal(await sendNewsletterConfirmation(email, config, async (url, init) => {
    calls.push({ url, init });
    return Response.json({ id: "email_123" });
  }, 1_000), true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.match(calls[0].init.headers.authorization, /^Bearer /);
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.to, [email]);
  assert.match(body.text, /\/api\/newsletter\/confirm\?token=/);
  assert.match(body.text, /\/api\/newsletter\/unsubscribe\?token=/);
  assert.doesNotMatch(body.text, /token=.*reader%40example|token=.*reader@example/i);
});

test("provider rejection and malformed acknowledgements fail closed", async () => {
  const config = { apiKey: "re_test_123456789", fromEmail: "brief@example.com", siteOrigin: "https://publication.example", tokenSecret: secret };
  await assert.rejects(sendNewsletterConfirmation(email, config, async () => new Response("no", { status: 500 })));
  await assert.rejects(sendNewsletterConfirmation(email, config, async () => Response.json({})));
});

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      consented_at TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'website'
    );
  `);
  const adapter = {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              const result = sqlite.prepare(sql).run(...values);
              return { success: true, meta: { changes: Number(result.changes) } };
            },
          };
        },
      };
    },
  };
  return { sqlite, adapter };
}

test("newsletter lifecycle requires pending confirmation, preserves protected states and supports idempotent unsubscribe", async () => {
  const { sqlite, adapter } = database();
  try {
    const save = createNewsletterStore(async () => adapter);
    const status = createNewsletterStatusStore(async () => adapter);

    assert.equal(await save(email), true);
    assert.equal(sqlite.prepare("SELECT status FROM newsletter_subscribers WHERE email = ?").get(email).status, "pending_confirmation");
    assert.equal(await status.confirm(email), true);
    assert.equal(sqlite.prepare("SELECT status FROM newsletter_subscribers WHERE email = ?").get(email).status, "active");
    assert.equal(await save(email), false);
    assert.equal(await status.unsubscribe(email), true);
    assert.equal(sqlite.prepare("SELECT status FROM newsletter_subscribers WHERE email = ?").get(email).status, "unsubscribed");
    assert.equal(await save(email), false);
    assert.equal(await status.unsubscribe(email), true);

    for (const protectedState of ["suppressed", "bounced", "complained"]) {
      const protectedEmail = protectedState + "@example.com";
      sqlite.prepare("INSERT INTO newsletter_subscribers (email, status, consented_at, source) VALUES (?, ?, ?, ?)").run(protectedEmail, protectedState, "2026-10-01", "test");
      assert.equal(await save(protectedEmail), false);
      assert.equal(await status.confirm(protectedEmail), false);
      assert.equal(await status.unsubscribe(protectedEmail), false);
      assert.equal(sqlite.prepare("SELECT status FROM newsletter_subscribers WHERE email = ?").get(protectedEmail).status, protectedState);
    }
  } finally {
    sqlite.close();
  }
});
