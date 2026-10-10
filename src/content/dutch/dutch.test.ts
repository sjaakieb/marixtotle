import { describe, expect, it } from "vitest";
import { buildQuestionAtLevel, buildSession } from "../../lib/levels";
import { gradeExercise } from "../../lib/matcher";
import type { Chapter } from "../../lib/schema";
import { getMasteryItems } from "../../lib/words";
import { chapter as deelwoorden2 } from "./deelwoorden2";
import { chapter as werkwoorden1 } from "./werkwoorden1";

function infinitiveOf(prompt: string): string | null {
	const m = prompt.match(/\(([^)]+)\)\s*$/);
	return m?.[1]?.trim() ?? null;
}

function checkChapter(chapter: Chapter, expectedCount: number) {
	it(`${chapter.id} has ${expectedCount} uniquely-identified exercises`, () => {
		expect(chapter.exercises).toHaveLength(expectedCount);
		const ids = chapter.exercises.map((e) => e.id);
		expect(new Set(ids).size).toBe(expectedCount);
	});

	it(`${chapter.id}: answers grade exact, alternatives accepted`, () => {
		for (const ex of chapter.exercises) {
			if (ex.type !== "declension") continue;
			expect(
				gradeExercise(ex.answer, {
					answer: ex.answer,
					alternatives: ex.alternatives,
				}),
				`${ex.id} answer "${ex.answer}"`,
			).toBe("exact");
			for (const alt of ex.alternatives ?? []) {
				expect(
					gradeExercise(alt, {
						answer: ex.answer,
						alternatives: ex.alternatives,
					}),
					`${ex.id} alternative "${alt}"`,
				).not.toBe("wrong");
			}
		}
	});

	it(`${chapter.id}: denylisted errors grade wrong, infinitives never slip through as typo`, () => {
		for (const ex of chapter.exercises) {
			if (ex.type !== "declension") continue;
			const graded = {
				answer: ex.answer,
				alternatives: ex.alternatives,
				wrongAnswers: ex.wrongAnswers,
			};
			for (const w of ex.wrongAnswers ?? []) {
				expect(gradeExercise(w, graded), `${ex.id} wrong "${w}"`).toBe("wrong");
				// Dutch lessons grade strictly in the app: the traps must
				// also fail under strict mode.
				expect(
					gradeExercise(
						w,
						{ answer: ex.answer, alternatives: ex.alternatives },
						{ strict: true },
					),
					`${ex.id} wrong "${w}" strict`,
				).toBe("wrong");
			}
			// The infinitive in the prompt must not be silently accepted as a
			// typo: either it is already graded wrong, or it is denylisted.
			const inf = infinitiveOf(ex.prompt);
			if (inf && inf !== ex.answer) {
				const withoutDeny = gradeExercise(inf, {
					answer: ex.answer,
					alternatives: ex.alternatives,
				});
				if (withoutDeny === "typo") {
					expect(
						ex.wrongAnswers ?? [],
						`${ex.id}: infinitive "${inf}" would pass as typo`,
					).toContain(inf);
				} else {
					expect(withoutDeny).toBe("wrong");
				}
			}
		}
	});
}

describe("Dutch spelling chapters", () => {
	checkChapter(werkwoorden1, 50);
	checkChapter(deelwoorden2, 50);

	it("items flow through the mastery engine (MCQ recognition, bare final)", () => {
		for (const chapter of [werkwoorden1, deelwoorden2]) {
			const items = getMasteryItems(chapter);
			expect(items).toHaveLength(50);
			const session = buildSession(items, {}, 10);
			expect(session).toHaveLength(10);
			for (const q of session) {
				expect(q.prompt.length).toBeGreaterThan(0);
				expect(q.answer.length).toBeGreaterThan(0);
			}
			const first = items[0];
			if (!first) continue;
			const mcq = buildQuestionAtLevel(first, 1, items);
			expect(mcq.options).toContain(mcq.answer);
			const final = buildQuestionAtLevel(first, 5, items);
			expect(final.options).toBeUndefined();
			expect(final.showHint).toBe(false);
		}
	});
});
