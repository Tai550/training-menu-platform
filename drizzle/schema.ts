import { mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, int } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["customer", "trainer"]).default("customer").notNull(),
  isApprovedTrainer: boolean("isApprovedTrainer").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 一般ユーザープロフィール情報
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  profilePhoto: text("profilePhoto"), // S3 URL for profile photo
  bio: text("bio"),
  height: int("height"), // 身長（cm）
  weight: int("weight"), // 体重（kg）
  age: int("age"), // 年齢
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * トレーナープロフィール情報
 */
export const trainerProfiles = mysqlTable("trainerProfiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  profilePhoto: text("profilePhoto"), // S3 URL for profile photo
  bio: text("bio"),
  specialties: text("specialties"), // JSON array of specialties
  certifications: text("certifications"), // JSON array of certification info
  socialLinks: text("socialLinks"), // JSON object of social media links
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type TrainerProfile = typeof trainerProfiles.$inferSelect;
export type InsertTrainerProfile = typeof trainerProfiles.$inferInsert;

/**
 * 相談投稿（一般顧客からの質問）
 */
export const consultations = mysqlTable("consultations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  goals: text("goals"), // トレーニング目標
  currentLevel: varchar("currentLevel", { length: 100 }), // 現在のレベル
  tags: text("tags"), // JSON array of tags
  status: mysqlEnum("status", ["open", "answered", "closed"]).default("open").notNull(),
  isPaid: boolean("isPaid").default(false).notNull(),
  amount: int("amount").default(0), // 課金額（円）
  bestAnswerId: varchar("bestAnswerId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;

/**
 * トレーニングメニュー提案（トレーナーからの回答）
 */
export const proposals = mysqlTable("proposals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  consultationId: varchar("consultationId", { length: 64 }).notNull(),
  trainerId: varchar("trainerId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // メニューの詳細説明
  program: text("program"), // JSON形式のトレーニングプログラム
  duration: varchar("duration", { length: 100 }), // 期間（例：4週間）
  frequency: varchar("frequency", { length: 100 }), // 頻度（例：週3回）
  isBestAnswer: boolean("isBestAnswer").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;
