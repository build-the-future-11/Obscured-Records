CREATE TABLE `portal_achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`evidence_url` text DEFAULT '' NOT NULL,
	`verified_by` text NOT NULL,
	`verified_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_event_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`attendee_only` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`reference_id` text NOT NULL,
	`recipient_user_id` text NOT NULL,
	`sender_user_id` text NOT NULL,
	`sender_name` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_mentor_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`author_user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_mentor_feedback` ON `portal_mentor_feedback` (`request_id`,`author_user_id`);--> statement-breakpoint
CREATE TABLE `portal_mentor_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`author_user_id` text NOT NULL,
	`session_at` text NOT NULL,
	`goal` text NOT NULL,
	`next_step` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`body` text NOT NULL,
	`href` text DEFAULT '' NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_post_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`resolution` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_post_report` ON `portal_post_reports` (`reporter_user_id`,`post_id`);--> statement-breakpoint
CREATE TABLE `portal_program_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`title` text NOT NULL,
	`starts_at` text,
	`material_url` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_program_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`title` text NOT NULL,
	`due_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_project_contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`member_user_id` text NOT NULL,
	`responsibility` text DEFAULT '' NOT NULL,
	`outcome_title` text DEFAULT '' NOT NULL,
	`outcome_url` text DEFAULT '' NOT NULL,
	`evidence_note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_project_contribution` ON `portal_project_contributions` (`project_id`,`member_user_id`);--> statement-breakpoint
CREATE TABLE `portal_reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`reaction` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_reaction` ON `portal_reactions` (`post_id`,`user_id`,`reaction`);--> statement-breakpoint
CREATE TABLE `portal_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`scope` text DEFAULT 'membership' NOT NULL,
	`granted_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_role` ON `portal_roles` (`user_id`,`role`,`scope`);