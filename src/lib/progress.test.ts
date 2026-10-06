import { describe, expect, it } from "vitest";
import { getChapterStats, isChapterComplete } from "./progress";
import type { MasteryItem } from "./words";

function vocab(key: string): MasteryItem {
	return {
		kind: "vocab",
		key,
		nl: key,
		foreign: key,
		nlAlternatives: [],
		foreignAlternatives: [],
		wrongNl: [],
		wrongForeign: [],
		language: "french",
	};
}

const items = [vocab("a"), vocab("b")];

describe("getChapterStats", () => {
	it("ignores orphaned keys so pct never exceeds 100", () => {
		// e.g. after a content edit renamed an item: old key lingers at 5.
		const stats = getChapterStats(items, { a: 5, b: 5, orphan: 5 });
		expect(stats.pct).toBe(100);
		expect(stats.sum).toBe(10);
		expect(stats.mastered).toBe(2);
	});

	it("computes partial mastery from known keys only", () => {
		const stats = getChapterStats(items, { a: 5, orphan: 5 });
		expect(stats.pct).toBe(50);
		expect(stats.mastered).toBe(1);
	});
});

describe("isChapterComplete", () => {
	it("true when every current item is at level 5", () => {
		expect(isChapterComplete(items, { a: 5, b: 5 })).toBe(true);
	});

	it("false when any item is below 5, unknown, or the chapter is empty", () => {
		expect(isChapterComplete(items, { a: 5, b: 4 })).toBe(false);
		expect(isChapterComplete(items, { a: 5 })).toBe(false);
		expect(isChapterComplete(items, { a: 5, b: 5, orphan: 5 })).toBe(true);
		expect(isChapterComplete([], {})).toBe(false);
	});
});
