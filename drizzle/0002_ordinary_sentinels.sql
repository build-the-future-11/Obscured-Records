CREATE TABLE `member_annotations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slug` text NOT NULL,
	`text` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`anchor` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `member_library` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`slug` text NOT NULL,
	`reading_state` text DEFAULT 'Unread' NOT NULL,
	`saved_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_member_library_owner_slug` ON `member_library` (`user_id`,`slug`);--> statement-breakpoint
CREATE TABLE `member_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`text_size` text DEFAULT 'standard' NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `member_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`digest_frequency` text DEFAULT 'none' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
