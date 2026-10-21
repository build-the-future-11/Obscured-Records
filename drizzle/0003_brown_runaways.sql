CREATE TABLE `member_profile_details` (
	`user_id` text PRIMARY KEY NOT NULL,
	`skills` text DEFAULT '[]' NOT NULL,
	`interests` text DEFAULT '[]' NOT NULL,
	`accomplishments` text DEFAULT '' NOT NULL,
	`portfolio_url` text DEFAULT '' NOT NULL,
	`directory_visible` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`author_user_id` text NOT NULL,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_event_registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`status` text DEFAULT 'registered' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_event_registration` ON `portal_event_registrations` (`event_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `portal_events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`starts_at` text NOT NULL,
	`location` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_learning_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'started' NOT NULL,
	`completed_at` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_learning_progress` ON `portal_learning_progress` (`resource_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `portal_mentor_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`bio` text NOT NULL,
	`expertise` text DEFAULT '[]' NOT NULL,
	`availability` text NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_mentor_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`mentor_user_id` text NOT NULL,
	`requester_user_id` text NOT NULL,
	`requester_name` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`feedback` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_mentor_request` ON `portal_mentor_requests` (`mentor_user_id`,`requester_user_id`);--> statement-breakpoint
CREATE TABLE `portal_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`due_date` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`category` text NOT NULL,
	`deadline` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_opportunity_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`opportunity_id` text NOT NULL,
	`applicant_user_id` text NOT NULL,
	`applicant_name` text NOT NULL,
	`statement` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`reviewer_note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_opportunity_application` ON `portal_opportunity_applications` (`opportunity_id`,`applicant_user_id`);--> statement-breakpoint
CREATE TABLE `portal_portfolio_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_user_id` text NOT NULL,
	`author_name` text NOT NULL,
	`channel` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_program_enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`statement` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`reviewer_note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_program_enrollment` ON `portal_program_enrollments` (`program_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `portal_programs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`format` text NOT NULL,
	`enrollment_mode` text DEFAULT 'apply' NOT NULL,
	`deadline` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_project_members` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'contributor' NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_project_member` ON `portal_project_members` (`project_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `portal_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`needs` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_by` text NOT NULL,
	`leader_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`url` text NOT NULL,
	`path` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
