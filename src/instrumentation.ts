import {
	SESSION_SECRET_MIN_LENGTH,
	sessionSecretError,
} from "@/lib/admin-auth";

/**
 * Runs once when the server starts. Fails loudly in the CapRover logs when
 * the admin session secret is missing or too short, instead of surfacing it
 * only at the first login attempt. Does not crash the boot: practice mode
 * works without admin sessions.
 */
export function register() {
	const problem = sessionSecretError();
	if (problem === "missing") {
		console.error(
			"[marixtotle] SESSION_SECRET is not set — /admin login is disabled until it is configured (and the app redeployed).",
		);
	} else if (problem === "too-short") {
		console.error(
			`[marixtotle] SESSION_SECRET is too short (minimum ${SESSION_SECRET_MIN_LENGTH} characters) — /admin login is disabled until it is lengthened (and the app redeployed).`,
		);
	}
}
