CREATE TABLE `saved_project` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`homepage_url` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`tech` text DEFAULT '[]' NOT NULL,
	`searchable_text` text NOT NULL,
	`embedding` blob,
	`embedding_dimensions` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `saved_project_userId_idx` ON `saved_project` (`user_id`);--> statement-breakpoint
CREATE INDEX `saved_project_userId_updatedAt_idx` ON `saved_project` (`user_id`, `updated_at`);
