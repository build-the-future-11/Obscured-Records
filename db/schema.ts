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
