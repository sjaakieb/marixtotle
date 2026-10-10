import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable("reports", {
	id: text("id").primaryKey(),
	createdAt: integer("created_at").notNull(),
	chapterId: text("chapter_id").notNull(),
	itemKey: text("item_key").notNull(),
	exerciseId: text("exercise_id").notNull(),
	level: integer("level"),
	prompt: text("prompt").notNull(),
	answer: text("answer").notNull(),
	userInput: text("user_input"),
	reason: text("reason").notNull(),
	message: text("message").notNull().default(""),
	status: text("status").notNull().default("open"),
	adminNote: text("admin_note").notNull().default(""),
});

export const admins = sqliteTable("admins", {
	id: text("id").primaryKey(),
	username: text("username").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: integer("created_at").notNull(),
});

export type ReportRow = typeof reports.$inferSelect;
export type AdminRow = typeof admins.$inferSelect;
