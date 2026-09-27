CREATE TABLE `editorial_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`source_url` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`consented_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `intake_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`hits` integer NOT NULL,
	`expires_at` integer NOT NULL
);
