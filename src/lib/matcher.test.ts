import { describe, expect, it } from "vitest";
import {
	getAnswerCandidates,
	isCorrect,
	isCorrectLenient,
	isExerciseCorrect,
	normalize,
	stripMacrons,
} from "./matcher";

describe("normalize", () => {
	it("trims and lowercases", () => {
		expect(normalize(" Puella ")).toBe("puella");
		expect(normalize("PUELLA")).toBe("puella");
	});
	it("collapses whitespace", () => {
		expect(normalize("genitivus  singularis")).toBe("genitivus singularis");
	});
	it("preserves macrons", () => {
		expect(normalize("puellā")).toBe("puellā");
		expect(normalize("amīcus")).toBe("amīcus");
		expect(normalize("AMĪCUS")).toBe("amīcus");
	});
	it("NFC normalization", () => {
		// decomposed vs composed should match after NFC
		const decomposed = "a\u0304"; // a + combining macron
		expect(normalize(decomposed)).toBe("ā");
	});
});

describe("isCorrect strict", () => {
	it("exact match passes", () => {
		expect(isCorrect("puellā", "puellā")).toBe(true);
	});
	it("without macron fails strict", () => {
		expect(isCorrect("puella", "puellā")).toBe(false);
		expect(isCorrect("amicus", "amīcus")).toBe(false);
	});
	it("case insensitive passes", () => {
		expect(isCorrect("Puellā", "puellā")).toBe(true);
	});
	it("whitespace tolerant", () => {
		expect(isCorrect(" genitivus singularis ", "genitivus singularis")).toBe(
			true,
		);
	});
});

describe("lenient", () => {
	it("strips macrons", () => {
		expect(stripMacrons("puellā")).toBe("puella");
		expect(stripMacrons("amīcī")).toBe("amici");
	});
	it("lenient passes without macron", () => {
		expect(isCorrectLenient("puella", "puellā")).toBe(true);
	});
});

describe("isExerciseCorrect with alternatives & implicit alias", () => {
	it("accepts exact answer", () => {
		expect(
			isExerciseCorrect("laetus, -a, -um", { answer: "laetus, -a, -um" }),
		).toBe(true);
	});
	it("accepts lemma via implicit alias for adjective form", () => {
		expect(isExerciseCorrect("laetus", { answer: "laetus, -a, -um" })).toBe(
			true,
		);
		expect(isExerciseCorrect("mirus", { answer: "mirus, -a, -um" })).toBe(true);
		expect(isExerciseCorrect("Laetus", { answer: "laetus, -a, -um" })).toBe(
			true,
		); // case-insensitive
	});
	it("accepts explicit alternatives", () => {
		expect(
			isExerciseCorrect("laetus", {
				answer: "laetus, -a, -um",
				alternatives: ["laetus"],
			}),
		).toBe(true);
		expect(
			isExerciseCorrect("laetus, -a, -um", {
				answer: "laetus, -a, -um",
				alternatives: ["laetus"],
			}),
		).toBe(true);
	});
	it("accepts feminine/neuter forms via implicit alias", () => {
		expect(isExerciseCorrect("laeta", { answer: "laetus, -a, -um" })).toBe(
			true,
		);
		expect(isExerciseCorrect("laetum", { answer: "laetus, -a, -um" })).toBe(
			true,
		);
		expect(isExerciseCorrect("mira", { answer: "mirus, -a, -um" })).toBe(true);
		expect(isExerciseCorrect("mirum", { answer: "mirus, -a, -um" })).toBe(true);
	});
	it("rejects unrelated", () => {
		expect(isExerciseCorrect("laeti", { answer: "laetus, -a, -um" })).toBe(
			false,
		);
		expect(isExerciseCorrect("bonus", { answer: "laetus, -a, -um" })).toBe(
			false,
		);
	});
	it("getAnswerCandidates includes implicit", () => {
		expect(getAnswerCandidates("laetus, -a, -um")).toContain("laetus");
		expect(getAnswerCandidates("laetus, -a, -um")).toContain("laeta");
		expect(getAnswerCandidates("laetus, -a, -um")).toContain("laetum");
		expect(getAnswerCandidates("mirus, -a, -um")).toContain("mirus");
		expect(getAnswerCandidates("mirus, -a, -um")).toContain("mira");
		expect(getAnswerCandidates("mirus, -a, -um")).toContain("mirum");
		expect(getAnswerCandidates("donum")).toEqual(["donum"]);
	});
});
