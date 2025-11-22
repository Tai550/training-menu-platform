CREATE TABLE `userProfiles` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`profilePhoto` text,
	`bio` text,
	`height` int,
	`weight` int,
	`age` int,
	`gender` enum('male','female','other'),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`)
);
