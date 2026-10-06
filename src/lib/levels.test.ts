import { describe, expect, it } from "vitest";
import {
	applyResult,
	averageLevel,
	bandForStored,
	buildQuestion,
	buildQuestionAtLevel,
	buildSession,
	buildTestSession,
	masteryPct,
	nextLevelForItem,
	pickLevelInBand,
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
		wrongNl: [],
		wrongForeign: [],
		language: "french",
	},
	{
		kind: "vocab",
		key: "b",
		nl: "de camping",
		foreign: "le camping",
		nlAlternatives: [],
		foreignAlternatives: [],
		wrongNl: [],
		wrongForeign: [],
		language: "french",
	},
	{
		kind: "vocab",
		key: "c",
		nl: "hij is",
		foreign: "il est",
		nlAlternatives: [],
		foreignAlternatives: [],
		wrongNl: [],
		wrongForeign: [],
		language: "french",
	},
	{
		kind: "vocab",
		key: "d",
		nl: "ik zoek",
		foreign: "je cherche",
		nlAlternatives: [],
		foreignAlternatives: [],
		wrongNl: [],
		wrongForeign: [],
		language: "french",
	},
	{
		kind: "vocab",
		key: "e",
		nl: "ja",
		foreign: "oui",
		nlAlternatives: [],
		foreignAlternatives: [],
		wrongNl: [],
		wrongForeign: [],
		language: "french",
	},
];

describe("levels", () => {
	it("stored levels map to bands", () => {
		expect(bandForStored(0)).toBe("recognition");
		expect(bandForStored(1)).toBe("recognition");
		expect(bandForStored(2)).toBe("production");
		expect(bandForStored(3)).toBe("production");
		expect(bandForStored(4)).toBe("final");
		expect(bandForStored(5)).toBe("final");
	});

	it("band picks are 50/50 random (audio L4 kept, not reduced)", () => {
		expect(pickLevelInBand("final")).toBe(5);
		const recog = new Set(
			Array.from({ length: 50 }, () => pickLevelInBand("recognition")),
		);
		expect(recog.has(1)).toBe(true);
		expect(recog.has(2)).toBe(true);
		const prod = new Set(
			Array.from({ length: 50 }, () => pickLevelInBand("production")),
		);
		expect(prod.has(3)).toBe(true);
		expect(prod.has(4)).toBe(true);
	});

	it("next question is random within the stored band", () => {
		for (let i = 0; i < 20; i++) {
			expect([1, 2]).toContain(nextLevelForItem(0));
			expect([1, 2]).toContain(nextLevelForItem(1));
			expect([3, 4]).toContain(nextLevelForItem(2));
			expect([3, 4]).toContain(nextLevelForItem(3));
			expect(nextLevelForItem(4)).toBe(5);
		}
	});

	it("correct jumps to next band, wrong −1 floored", () => {
		expect(applyResult(0, true)).toBe(2);
		expect(applyResult(1, true)).toBe(2);
		expect(applyResult(2, true)).toBe(4);
		expect(applyResult(3, true)).toBe(4);
		expect(applyResult(4, true)).toBe(5);
		expect(applyResult(5, true)).toBe(5);
		expect(applyResult(3, false)).toBe(2);
		expect(applyResult(0, false)).toBe(0);
	});

	it("recognition band: L1 foreign→NL MCQ or L2 NL→foreign MCQ", () => {
		for (let i = 0; i < 20; i++) {
			const q = buildQuestion(items[0], 0, items);
			expect([1, 2]).toContain(q.level);
			expect(q.options).toContain(q.answer);
			if (q.level === 1) {
				expect(q.prompt).toBe("les vacances");
				expect(q.answer).toBe("de vakantie");
			} else {
				expect(q.prompt).toBe("de vakantie");
				expect(q.answer).toBe("les vacances");
			}
		}
	});

	it("skips near-duplicate distractors (grand vs grand / grande)", () => {
		const all: MasteryItem[] = [
			...items,
			{
				kind: "vocab",
				key: "f",
				nl: "groot",
				foreign: "grand",
				nlAlternatives: [],
				foreignAlternatives: [],
				wrongNl: [],
				wrongForeign: [],
				language: "french",
			},
			{
				kind: "vocab",
				key: "g",
				nl: "enorm",
				foreign: "grand / grande",
				nlAlternatives: [],
				foreignAlternatives: [],
				wrongNl: [],
				wrongForeign: [],
				language: "french",
			},
		];
		const target = all.find((i) => i.key === "f") as MasteryItem;
		for (let i = 0; i < 30; i++) {
			const q = buildQuestion(target, 1, all);
			if (q.level !== 2) continue;
			expect(q.options).not.toContain("grand / grande");
			expect(q.options).toHaveLength(4);
		}
	});

	it("falls back to similar distractors when the pool runs dry", () => {
		const tiny: MasteryItem[] = [
			{
				kind: "vocab",
				key: "f",
				nl: "groot",
				foreign: "grand",
				nlAlternatives: [],
				foreignAlternatives: [],
				wrongNl: [],
				wrongForeign: [],
				language: "french",
			},
			{
				kind: "vocab",
				key: "g",
				nl: "enorm",
				foreign: "grand / grande",
				nlAlternatives: [],
				foreignAlternatives: [],
				wrongNl: [],
				wrongForeign: [],
				language: "french",
			},
		];
		for (let i = 0; i < 20; i++) {
			const q = buildQuestion(tiny[0] as MasteryItem, 1, tiny);
			if (q.level !== 2) continue;
			// Still a valid MCQ with the answer present, just fewer options.
			expect(q.options).toContain("grand");
			expect(q.options?.length).toBeGreaterThanOrEqual(2);
		}
	});

	it("questions carry the denylist of the graded side", () => {
		const item: MasteryItem = {
			kind: "vocab",
			key: "w",
			nl: "blij",
			foreign: "laetus",
			nlAlternatives: [],
			foreignAlternatives: [],
			wrongNl: ["droevig"],
			wrongForeign: ["laeti"],
			language: "latin",
		};
		const all = [item];
		for (let i = 0; i < 20; i++) {
			const recog = buildQuestion(item, 0, all);
			expect(recog.wrongAnswers).toEqual(
				recog.level === 1 ? ["droevig"] : ["laeti"],
			);
			const prod = buildQuestion(item, 2, all);
			expect(prod.wrongAnswers).toEqual(
				prod.level === 3 ? ["droevig"] : ["laeti"],
			);
			expect(buildQuestion(item, 4, all).wrongAnswers).toEqual(["laeti"]);
		}
	});

	it("production band: typing (L3) or audio (L4), no options", () => {
		const seen = new Set<number>();
		for (let i = 0; i < 20; i++) {
			const q = buildQuestion(items[0], 2, items);
			expect([3, 4]).toContain(q.level);
			expect(q.options).toBeUndefined();
			seen.add(q.level);
			if (q.level === 4) {
				expect(q.audioText).toBe("les vacances");
				expect(q.translation).toBe("de vakantie");
			} else {
				expect(q.translation).toBeUndefined();
			}
		}
		expect(seen.has(3)).toBe(true);
		expect(seen.has(4)).toBe(true);
		expect(buildQuestion(items[0], 4, items).level).toBe(5);
	});

	it("mastery pct: all max = 100%", () => {
		expect(masteryPct({ a: 5, b: 5 }, 2)).toBe(100);
		expect(masteryPct({ a: 5, b: 0 }, 2)).toBe(50);
		expect(masteryPct({}, 0)).toBe(0);
	});

	it("session holds each remaining word once, never repeats", () => {
		const session = buildSession(items, { a: 0, b: 0, c: 5, d: 5, e: 5 }, 10);
		// Only a/b remain: two recognition questions, no padding to 10.
		expect(session).toHaveLength(2);
		expect(
			session.every(
				(q) =>
					(q.level === 1 || q.level === 2) &&
					(q.itemKey === "a" || q.itemKey === "b"),
			),
		).toBe(true);
		expect(new Set(session.map((q) => q.itemKey)).size).toBe(2);
	});

	it("session is capped at the requested size", () => {
		const session = buildSession(items, {}, 3);
		expect(session).toHaveLength(3);
		expect(new Set(session.map((q) => q.itemKey)).size).toBe(3);
	});

	it("session fills recognition band first, spills into production/final", () => {
		// One item per band, session of 3 → deterministic band order.
		const session = buildSession(items, { a: 0, b: 2, c: 4, d: 5, e: 5 }, 3);
		expect(session.map((q) => q.itemKey)).toEqual(["a", "b", "c"]);
		expect([1, 2]).toContain(session[0].level);
		expect([3, 4]).toContain(session[1].level);
		expect(session[2].level).toBe(5);
	});

	it("practice ends when everything is mastered (empty session)", () => {
		expect(buildSession(items, { a: 5, b: 5, c: 5, d: 5, e: 5 }, 10)).toEqual(
			[],
		);
		expect(buildSession([], {}, 10)).toEqual([]);
	});

	it("buildQuestionAtLevel forces the requested level", () => {
		const q = buildQuestionAtLevel(items[0], 4, items);
		expect(q.level).toBe(4);
		expect(q.audioText).toBe("les vacances");
		expect(buildQuestionAtLevel(items[0], 5, items).level).toBe(5);
	});

	it("test session splits L3/L4/L5 as evenly as possible", () => {
		const many: MasteryItem[] = Array.from(
			{ length: 12 },
			(_, i) =>
				({
					kind: "vocab",
					key: `w${i}`,
					nl: `nl${i}`,
					foreign: `fr${i}`,
					nlAlternatives: [],
					foreignAlternatives: [],
					wrongNl: [],
					wrongForeign: [],
					language: "french",
				}) as MasteryItem,
		);
		const session = buildTestSession(many, 10);
		expect(session).toHaveLength(10);
		const counts = { 3: 0, 4: 0, 5: 0 } as Record<number, number>;
		for (const q of session) counts[q.level] = (counts[q.level] ?? 0) + 1;
		expect(counts).toEqual({ 3: 4, 4: 3, 5: 3 });
		// Various words: all distinct when the chapter is big enough.
		expect(new Set(session.map((q) => q.itemKey)).size).toBe(10);
	});

	it("test session repeats words for small chapters, levels stay even", () => {
		const session = buildTestSession(items, 10);
		expect(session).toHaveLength(10);
		expect(session.filter((q) => q.level === 3)).toHaveLength(4);
		expect(session.filter((q) => q.level === 4)).toHaveLength(3);
		expect(session.filter((q) => q.level === 5)).toHaveLength(3);
		expect(buildTestSession([], 10)).toEqual([]);
	});

	it("grade and average level", () => {
		expect(sessionGrade(7, 10)).toBe(7);
		expect(sessionGrade(0, 10)).toBe(0);
		expect(averageLevel([{ level: 1 }, { level: 3 }] as never)).toBe(2);
	});
});
