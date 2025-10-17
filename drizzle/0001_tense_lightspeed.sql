CREATE TABLE `consultations` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`goals` text,
	`currentLevel` varchar(100),
	`tags` text,
	`status` enum('open','answered','closed') NOT NULL DEFAULT 'open',
	`isPaid` boolean NOT NULL DEFAULT false,
	`amount` int DEFAULT 0,
	`bestAnswerId` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` varchar(64) NOT NULL,
	`consultationId` varchar(64) NOT NULL,
	`trainerId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`program` text NOT NULL,
	`duration` varchar(100),
	`frequency` varchar(100),
	`isBestAnswer` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainerProfiles` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`bio` text,
	`specialties` text,
	`certifications` text,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `trainerProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('customer','trainer') DEFAULT 'customer' NOT NULL;