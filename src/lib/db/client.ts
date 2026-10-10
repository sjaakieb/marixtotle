import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { count } from "drizzle-orm";
import {
	type BetterSQLite3Database,
	drizzle,
} from "drizzle-orm/better-sqlite3";
import { hashPassword } from "@/lib/admin-auth";
import { admins } from "./schema";

export const DATA_DIR = process.env.DATA_DIR ?? "/app/data";
export const DATABASE_URL =
	process.env.DATABASE_URL ?? `file:${DATA_DIR}/app.db`;

function filePathFromUrl(url: string): string {
	return url.startsWith("file:") ? url.slice("file:".length) : url;
}

type GlobalDb = {
	db?: BetterSQLite3Database;
	raw?: Database.Database;
	path?: string;
};

const globalForDb = globalThis as unknown as { __marixtotleDb?: GlobalDb };

function init(): GlobalDb {
	const path = filePathFromUrl(DATABASE_URL);
	const cached = globalForDb.__marixtotleDb;
	if (cached?.db && cached.path === path) return cached;

	mkdirSync(dirname(path), { recursive: true });
	const raw = new Database(path);
	raw.pragma("journal_mode = WAL");
	raw.pragma("foreign_keys = ON");
	// Idempotent DDL — also checked in as drizzle/0001_init.sql for review.
	// IF NOT EXISTS keeps redeploys and volume remounts safe.
	raw.exec(`
		CREATE TABLE IF NOT EXISTS reports (
			id TEXT PRIMARY KEY,
			created_at INTEGER NOT NULL,
			chapter_id TEXT NOT NULL,
			item_key TEXT NOT NULL,
			exercise_id TEXT NOT NULL,
			level INTEGER,
			prompt TEXT NOT NULL,
			answer TEXT NOT NULL,
			user_input TEXT,
			reason TEXT NOT NULL,
			message TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT 'open',
			admin_note TEXT NOT NULL DEFAULT ''
		);
		CREATE INDEX IF NOT EXISTS reports_status_created_idx ON reports (status, created_at DESC);
		CREATE INDEX IF NOT EXISTS reports_chapter_item_idx ON reports (chapter_id, item_key);
		CREATE TABLE IF NOT EXISTS admins (
			id TEXT PRIMARY KEY,
			username TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			created_at INTEGER NOT NULL
		);
	`);
	const db = drizzle(raw);
	const entry: GlobalDb = { db, raw, path };
	globalForDb.__marixtotleDb = entry;
	return entry;
}

export function getDb(): BetterSQLite3Database {
	const entry = init();
	if (!entry.db) throw new Error("Database failed to initialize.");
	return entry.db;
}

/** Create the first admin from env on first boot. Safe to call on every auth request. */
export function ensureSeededAdmin(): void {
	const username = process.env.ADMIN_USERNAME?.trim();
	const password = process.env.ADMIN_PASSWORD;
	if (!username || !password) return;
	const db = getDb();
	const rows = db.select({ value: count() }).from(admins).all();
	if ((rows[0]?.value ?? 0) > 0) return;
	db.insert(admins)
		.values({
			id: randomUUID(),
			username,
			passwordHash: hashPassword(password),
			createdAt: Date.now(),
		})
		.run();
}
