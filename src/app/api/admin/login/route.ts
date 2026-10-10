import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
	clearFailedLogins,
	isLockedOut,
	recordFailedLogin,
	sessionCookieHeader,
	signSession,
	verifyPassword,
} from "@/lib/admin-auth";
import { ensureSeededAdmin, getDb } from "@/lib/db/client";
import { admins } from "@/lib/db/schema";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
	username: z.string().trim().min(1).max(100),
	password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
	const ip = clientIp(request.headers);
	if (isRateLimited(`login:min:${ip}`, 10, 60_000)) {
		return Response.json(
			{ error: "Te veel pogingen, probeer later opnieuw." },
			{ status: 429 },
		);
	}
	if (isLockedOut(`login:lock:${ip}`)) {
		return Response.json(
			{ error: "Tijdelijk geblokkeerd na te veel foute pogingen." },
			{ status: 429 },
		);
	}
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Ongeldige aanvraag." }, { status: 400 });
	}
	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ error: "Vul gebruikersnaam en wachtwoord in." },
			{ status: 400 },
		);
	}
	try {
		ensureSeededAdmin();
		const rows = getDb()
			.select()
			.from(admins)
			.where(eq(admins.username, parsed.data.username))
			.limit(1)
			.all();
		const admin = rows[0];
		// Constant-shape failure: same message + same work whether user exists or not.
		const ok = admin
			? verifyPassword(parsed.data.password, admin.passwordHash)
			: false;
		if (!admin || !ok) {
			recordFailedLogin(`login:lock:${ip}`);
			return Response.json(
				{ error: "Onjuiste gebruikersnaam of wachtwoord." },
				{ status: 401 },
			);
		}
		clearFailedLogins(`login:lock:${ip}`);
		const token = await signSession(admin.id);
		const secure = request.nextUrl.protocol === "https:";
		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Set-Cookie": sessionCookieHeader(token, secure),
			},
		});
	} catch (e) {
		if (e instanceof Error && e.message.includes("SESSION_SECRET")) {
			return Response.json(
				{ error: "Serverconfiguratie ontbreekt (SESSION_SECRET)." },
				{ status: 500 },
			);
		}
		return Response.json({ error: "Inloggen mislukt." }, { status: 500 });
	}
}
