-- Initial schema: anonymous question reports + admin users.
-- Applied idempotently on boot by src/lib/db/client.ts (IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`chapter_id` text NOT NULL,
	`item_key` text NOT NULL,
	`exercise_id` text NOT NULL,
	`level` integer,
	`prompt` text NOT NULL,
	`answer` text NOT NULL,
	`user_input` text,
	`reason` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`admin_note` text DEFAULT '' NOT NULL
);
CREATE INDEX IF NOT EXISTS `reports_status_created_idx` ON `reports` (`status`,`created_at` DESC);
CREATE INDEX IF NOT EXISTS `reports_chapter_item_idx` ON `reports` (`chapter_id`,`item_key`);
CREATE TABLE IF NOT EXISTS `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL UNIQUE,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
