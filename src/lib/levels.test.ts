import { describe, expect, it } from "vitest";
import {
	applyResult,
	averageLevel,
	buildQuestion,
	buildSession,
	masteryPct,
	nextLevelForItem,
	sessionGrade,
} from "./levels";
import type { MasteryItem } from "./words";

const items: MasteryItem[] = [
	{
		kind: "vocab",
		key: "a",
		nl: "de vakantie",
		foreign: "les vacances",
		nlAlternatives: [],
		foreignAlternatives: [],
		language: "french",
	},
	{
		kind: "vocab",
		key: "b",
		nl: "de camping",
		foreign: "le camping",
		nlAlternatives: [],
		foreignAlternatives: [],
		language: "french",
	},
	{
		kind: "vocab",
		key: "c",
		nl: "hij is",
		foreign: "il est",
		nlAlternatives: [],
		foreignAlternatives: [],
		language: "french",
	},
	{
		kind: "vocab",
		key: "d",
		nl: "ik zoek",
		foreign: "je cherche",
		nlAlternatives: [],
		foreignAlternatives: [],
		language: "french",
	},
	{
		kind: "vocab",
		key: "e",
		nl: "ja",
		foreign: "oui",
		nlAlternatives: [],
		foreignAlternatives: [],
		language: "french",
	},
];

describe("levels", () => {
	it("unseen items start at L1, completed items advance", () => {
		expect(nextLevelForItem(0)).toBe(1);
		expect(nextLevelForItem(1)).toBe(2);
		expect(nextLevelForItem(4)).toBe(5);
		expect(nextLevelForItem(5)).toBe(5);
	});

	it("correct +1 capped, wrong −1 floored", () => {
		expect(applyResult(0, true)).toBe(1);
		expect(applyResult(4, true)).toBe(5);
		expect(applyResult(5, true)).toBe(5);
		expect(applyResult(3, false)).toBe(2);
		expect(applyResult(0, false)).toBe(0);
	});

	it("L1 is foreign→NL MCQ, L2 is NL→foreign MCQ", () => {
		const l1 = buildQuestion(items[0], 0, items);
		expect(l1.level).toBe(1);
		expect(l1.prompt).toBe("les vacances");
		expect(l1.answer).toBe("de vakantie");
		expect(l1.options).toContain("de vakantie");

		const l2 = buildQuestion(items[0], 1, items);
		expect(l2.level).toBe(2);
		expect(l2.prompt).toBe("de vakantie");
		expect(l2.answer).toBe("les vacances");
		expect(l2.options).toContain("les vacances");
	});

	it("L3/L5 are typing (no options), L4 is audio", () => {
		expect(buildQuestion(items[0], 2, items).options).toBeUndefined();
		const l4 = buildQuestion(items[0], 3, items);
		expect(l4.level).toBe(4);
		expect(l4.audioText).toBe("les vacances");
		expect(l4.options).toBeUndefined();
		expect(buildQuestion(items[0], 4, items).level).toBe(5);
	});

	it("mastery pct: all max = 100%", () => {
		expect(masteryPct({ a: 5, b: 5 }, 2)).toBe(100);
		expect(masteryPct({ a: 5, b: 0 }, 2)).toBe(50);
		expect(masteryPct({}, 0)).toBe(0);
	});

	it("session always has 10 questions, prefers lowest levels", () => {
		const session = buildSession(items, { a: 0, b: 0, c: 5, d: 5, e: 5 }, 10);
		expect(session).toHaveLength(10);
		const l1count = session.filter((q) => q.level === 1).length;
		expect(l1count).toBeGreaterThan(0);
	});

	it("grade and average level", () => {
		expect(sessionGrade(7, 10)).toBe(7);
		expect(sessionGrade(0, 10)).toBe(0);
		expect(averageLevel([{ level: 1 }, { level: 3 }] as never)).toBe(2);
	});
});
