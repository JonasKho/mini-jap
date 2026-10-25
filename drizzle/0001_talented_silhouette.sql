CREATE TABLE `case_versions` (
	`case_id` text NOT NULL,
	`account_key` text NOT NULL,
	`version` integer NOT NULL,
	`status` text NOT NULL,
	`payload` text NOT NULL,
	`actor` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`case_id`, `version`)
);
--> statement-breakpoint
CREATE INDEX `versions_account_case` ON `case_versions` (`account_key`,`case_id`);