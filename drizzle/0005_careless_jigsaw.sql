CREATE TABLE `portal_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`evidence_url` text NOT NULL,
	`verified_by` text NOT NULL,
	`verified_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_attendance` ON `portal_attendance` (`event_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `portal_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text NOT NULL,
	`action` text NOT NULL,
	`reference_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_notification_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`reminders` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_project_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`author_user_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`uncertainty` text NOT NULL,
	`status` text DEFAULT 'unreviewed' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_project_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`author_user_id` text NOT NULL,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_task_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_task_progress` ON `portal_task_progress` (`task_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `portal_events` ADD `capacity` integer;--> statement-breakpoint
ALTER TABLE `portal_resources` ADD `position` integer DEFAULT 0 NOT NULL;