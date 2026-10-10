import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./admin-auth";
import { ensureSeededAdmin, getDb } from "./db/client";
import { admins } from "./db/schema";

/** Returns the logged-in admin row, or null. Seeds first admin from env if needed. */
export async function getAdminFromRequest(request: NextRequest) {
	const token = request.cookies.get(SESSION_COOKIE)?.value;
	if (!token) return null;
	const adminId = await verifySession(token);
	if (!adminId) return null;
	try {
		ensureSeededAdmin();
		const rows = await getDb()
			.select()
			.from(admins)
			.where(eq(admins.id, adminId))
			.limit(1);
		return rows[0] ?? null;
	} catch {
		return null;
	}
}
