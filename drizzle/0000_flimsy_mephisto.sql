CREATE TABLE `account_settings` (
	`account_key` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ai_usage` (
	`account_key` text NOT NULL,
	`bucket` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`account_key`, `bucket`)
);
--> statement-breakpoint
CREATE TABLE `complaints` (
	`id` text PRIMARY KEY NOT NULL,
	`account_key` text NOT NULL,
	`customer` text DEFAULT '' NOT NULL,
	`order_number` text DEFAULT '' NOT NULL,
	`product` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`payload` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `complaints_account_updated` ON `complaints` (`account_key`,`updated_at`);