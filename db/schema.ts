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
