import { describe, expect, it } from "vitest";
import { parseThemePreference, resolveIsDark } from "./theme";

describe("parseThemePreference", () => {
	it("accepts light, dark and system", () => {
		expect(parseThemePreference("light")).toBe("light");
		expect(parseThemePreference("dark")).toBe("dark");
		expect(parseThemePreference("system")).toBe("system");
	});

	it("defaults unknown or missing values to system", () => {
		expect(parseThemePreference(null)).toBe("system");
		expect(parseThemePreference(undefined)).toBe("system");
		expect(parseThemePreference("")).toBe("system");
		expect(parseThemePreference("auto")).toBe("system");
	});
});

describe("resolveIsDark", () => {
	it("follows the OS setting in system mode", () => {
		expect(resolveIsDark("system", true)).toBe(true);
		expect(resolveIsDark("system", false)).toBe(false);
	});

	it("overrides the OS setting in manual modes", () => {
		expect(resolveIsDark("dark", false)).toBe(true);
		expect(resolveIsDark("light", true)).toBe(false);
	});
});
