import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "marixtotle_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_ISSUER = "marixtotle-admin";

function getSecret(): Uint8Array {
	const secret = process.env.SESSION_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error(
			"SESSION_SECRET must be set to at least 32 characters for admin sessions.",
		);
	}
	return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): string {
	return hashSync(password, genSaltSync(12));
}

export function verifyPassword(password: string, hash: string): boolean {
	return compareSync(password, hash);
}

/** Failed-login tracking for lockout (in-memory, single instance). */
const failures = new Map<string, { count: number; lockedUntil: number }>();

export function isLockedOut(key: string, now = Date.now()): boolean {
	const hit = failures.get(key);
	return !!hit && hit.lockedUntil > now;
}

export function recordFailedLogin(key: string, now = Date.now()): void {
	const hit = failures.get(key) ?? { count: 0, lockedUntil: 0 };
	hit.count += 1;
	if (hit.count >= 5) {
		hit.lockedUntil = now + 15 * 60 * 1000;
		hit.count = 0;
	}
	failures.set(key, hit);
}

export function clearFailedLogins(key: string): void {
	failures.delete(key);
}

export async function signSession(adminId: string): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	return new SignJWT({ sub: adminId })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuer(SESSION_ISSUER)
		.setIssuedAt(now)
		.setExpirationTime(now + SESSION_TTL_SECONDS)
		.setJti(crypto.randomUUID())
		.sign(getSecret());
}

/** Returns the admin id for a valid session token, or null. Edge-safe (no DB/crypto imports beyond jose). */
export async function verifySession(token: string): Promise<string | null> {
	try {
		const { payload } = await jwtVerify(token, getSecret(), {
			issuer: SESSION_ISSUER,
		});
		return typeof payload.sub === "string" && payload.sub.length > 0
			? payload.sub
			: null;
	} catch {
		return null;
	}
}

export function sessionCookieHeader(token: string, secure: boolean): string {
	const parts = [
		`${SESSION_COOKIE}=${token}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		`Max-Age=${SESSION_TTL_SECONDS}`,
	];
	if (secure) parts.push("Secure");
	return parts.join("; ");
}

export function clearSessionCookieHeader(): string {
	return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
