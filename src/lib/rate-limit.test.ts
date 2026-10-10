import { describe, expect, it } from "vitest";
import { isRateLimited } from "./rate-limit";

describe("isRateLimited", () => {
	it("allows up to the limit, then blocks", () => {
		const key = `test-${Date.now()}-${Math.random()}`;
		expect(isRateLimited(key, 2, 60_000)).toBe(false);
		expect(isRateLimited(key, 2, 60_000)).toBe(false);
		expect(isRateLimited(key, 2, 60_000)).toBe(true);
	});

	it("resets after the window", () => {
		const key = `test-${Date.now()}-${Math.random()}`;
		expect(isRateLimited(key, 1, 100, 1000)).toBe(false);
		expect(isRateLimited(key, 1, 100, 1050)).toBe(true);
		expect(isRateLimited(key, 1, 100, 1200)).toBe(false);
	});
});
