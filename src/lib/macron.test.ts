import { describe, expect, it } from "vitest";
import { insertAtCursor, toggleMacronBeforeCursor } from "./macron";

describe("insertAtCursor", () => {
	it("inserts at cursor", () => {
		expect(insertAtCursor("puella", 6, 6, "ā")).toEqual({
			value: "puellaā",
			cursor: 7,
		});
		expect(insertAtCursor("puela", 3, 3, "l")).toEqual({
			value: "puella",
			cursor: 4,
		});
	});
	it("replaces selection", () => {
		// "puella" select 2-4 = "el" -> replace with ā => "puāla" (pu + ā + la)
		expect(insertAtCursor("puella", 2, 4, "ā")).toEqual({
			value: "puāla",
			cursor: 3,
		});
	});
});

describe("toggleMacronBeforeCursor", () => {
	it("toggles base to macron", () => {
		expect(toggleMacronBeforeCursor("puella", 6)?.value).toBe("puellā");
	});
	it("toggles macron to base", () => {
		expect(toggleMacronBeforeCursor("puellā", 6)?.value).toBe("puella");
	});
	it("returns null if no vowel", () => {
		expect(toggleMacronBeforeCursor("puell", 5)).toBeNull();
		expect(toggleMacronBeforeCursor("", 0)).toBeNull();
	});
});
