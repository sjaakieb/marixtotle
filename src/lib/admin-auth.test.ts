import { afterEach, describe, expect, it } from "vitest";
import {
	SESSION_SECRET_MIN_LENGTH,
	sessionSecretError,
	verifySession,
} from "./admin-auth";

const ORIGINAL = process.env.SESSION_SECRET;

afterEach(() => {
	if (ORIGINAL === undefined) delete process.env.SESSION_SECRET;
	else process.env.SESSION_SECRET = ORIGINAL;
});

describe("sessionSecretError", () => {
	it("reports missing when unset", () => {
		delete process.env.SESSION_SECRET;
		expect(sessionSecretError()).toBe("missing");
	});

	it("reports too-short below the minimum", () => {
		process.env.SESSION_SECRET = "x".repeat(SESSION_SECRET_MIN_LENGTH - 1);
		expect(sessionSecretError()).toBe("too-short");
	});

	it("flags a realistic 31-char secret as too short", () => {
		process.env.SESSION_SECRET = "ObO9H02Zxc6cHvRBemleRykPu2KpAXw";
		expect(process.env.SESSION_SECRET).toHaveLength(31);
		expect(sessionSecretError()).toBe("too-short");
	});

	it("accepts exactly the minimum length", () => {
		process.env.SESSION_SECRET = "x".repeat(SESSION_SECRET_MIN_LENGTH);
		expect(sessionSecretError()).toBeNull();
	});
});

describe("verifySession", () => {
	it("returns null for garbage tokens", async () => {
		process.env.SESSION_SECRET = "x".repeat(32);
		await expect(verifySession("not-a-token")).resolves.toBeNull();
	});
});
