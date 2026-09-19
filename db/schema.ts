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
