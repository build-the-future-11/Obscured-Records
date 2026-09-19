CREATE TABLE `newsletter_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`consented_at` text NOT NULL,
	`source` text DEFAULT 'website' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_newsletter_subscribers_email` ON `newsletter_subscribers` (`email`);