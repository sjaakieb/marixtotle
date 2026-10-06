import { describe, expect, it } from "vitest";
import {
	canonicalDutchPronouns,
	detectWrongLanguage,
	editDistance,
	getAnswerCandidates,
	gradeExercise,
	isCorrect,
	isCorrectLenient,
	isExerciseCorrect,
	normalize,
	stripDiacritics,
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
	it("one-letter-off counts as typo (accepted with notice)", () => {
		expect(gradeExercise("laeti", { answer: "laetus, -a, -um" })).toBe("typo");
		expect(isExerciseCorrect("laeti", { answer: "laetus, -a, -um" })).toBe(
			true,
		);
	});
	it("rejects unrelated", () => {
		expect(isExerciseCorrect("bonus", { answer: "laetus, -a, -um" })).toBe(
			false,
		);
		expect(gradeExercise("bonus", { answer: "laetus, -a, -um" })).toBe("wrong");
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

describe("editDistance", () => {
	it("exact is 0", () => {
		expect(editDistance("vacances", "vacances")).toBe(0);
	});
	it("insert/delete/substitute cost 1", () => {
		expect(editDistance("vacance", "vacances")).toBe(1);
		expect(editDistance("vacances", "vacance")).toBe(1);
		expect(editDistance("vacances", "vacancxs")).toBe(1);
	});
	it("adjacent transposition costs 1", () => {
		expect(editDistance("genitvius", "genitivus")).toBe(1);
	});
	it("two edits cost 2", () => {
		expect(editDistance("vakanses", "vacances")).toBe(2);
	});
});

describe("stripDiacritics", () => {
	it("strips French accents and ligatures", () => {
		expect(stripDiacritics("café")).toBe("cafe");
		expect(stripDiacritics("français")).toBe("francais");
		expect(stripDiacritics("cœur")).toBe("coeur");
	});
	it("strips Latin macrons and Greek tonos", () => {
		expect(stripDiacritics("puellā")).toBe("puella");
		expect(stripDiacritics("μαθητής")).toBe("μαθητης");
	});
});

describe("gradeExercise (Duolingo-style)", () => {
	it("exact matches grade exact", () => {
		expect(gradeExercise("les vacances", { answer: "les vacances" })).toBe(
			"exact",
		);
		expect(gradeExercise("Puellā", { answer: "puellā" })).toBe("exact");
	});
	it("one typo in a long word grades typo (still correct)", () => {
		expect(gradeExercise("les vacance", { answer: "les vacances" })).toBe(
			"typo",
		);
		expect(gradeExercise("les vaccances", { answer: "les vacances" })).toBe(
			"typo",
		);
		expect(gradeExercise("genitvius", { answer: "genitivus" })).toBe("typo");
		expect(isExerciseCorrect("les vacance", { answer: "les vacances" })).toBe(
			true,
		);
	});
	it("accepts missing final -t in alsjeblieft (regression)", () => {
		expect(
			gradeExercise("alsjeblief", {
				answer: "alsjeblieft",
				direction: "fr->nl",
			}),
		).toBe("typo");
		expect(
			isExerciseCorrect("alsjeblief", {
				answer: "alsjeblieft",
				direction: "fr->nl",
			}),
		).toBe(true);
	});
	it("short words (≤4 chars) must be exact", () => {
		expect(gradeExercise("ui", { answer: "oui" })).toBe("wrong");
		expect(gradeExercise("il et", { answer: "il est" })).toBe("wrong");
		expect(gradeExercise("oui", { answer: "oui" })).toBe("exact");
	});
	it("two typos grade wrong", () => {
		expect(gradeExercise("les vakanses", { answer: "les vacances" })).toBe(
			"wrong",
		);
		expect(isExerciseCorrect("les vakanses", { answer: "les vacances" })).toBe(
			false,
		);
	});
	it("missing/extra whole words grade wrong", () => {
		expect(gradeExercise("heet je", { answer: "Hoe heet je" })).toBe("wrong");
	});
	it("missing/wrong accents grade typo, not wrong", () => {
		expect(gradeExercise("cafe", { answer: "café" })).toBe("typo");
		expect(gradeExercise("puella", { answer: "puellā" })).toBe("typo");
		expect(gradeExercise("francais", { answer: "français" })).toBe("typo");
	});
	it("accent plus letter error grades wrong", () => {
		expect(gradeExercise("cafee", { answer: "café" })).toBe("wrong");
	});
	it("punctuation-only differences grade exact", () => {
		expect(
			gradeExercise("Hoe heet je", {
				answer: "Hoe heet je?",
				direction: "fr->nl",
			}),
		).toBe("exact");
		expect(gradeExercise("lhomme", { answer: "l'homme" })).toBe("exact");
	});
	it("Greek final sigma is accepted", () => {
		expect(gradeExercise("μαθητησ", { answer: "μαθητής" })).toBe("typo");
	});
	it("typo works alongside alternatives and je/jij leniency", () => {
		expect(gradeExercise("laetis", { answer: "laetus, -a, -um" })).toBe("typo");
		expect(
			gradeExercise("Hoe heet je", {
				answer: "Hoe heet jij?",
				direction: "fr->nl",
			}),
		).toBe("exact");
	});
});

describe("gradeExercise with wrongAnswers denylist", () => {
	const ex = {
		answer: "laetus, -a, -um",
		alternatives: ["laetus", "laeta", "laetum"],
		wrongAnswers: ["laeti"],
	};
	it("denylisted typo-close answer grades wrong", () => {
		expect(gradeExercise("laeti", ex)).toBe("wrong");
		expect(isExerciseCorrect("laeti", ex)).toBe(false);
	});
	it("denylist matches case-insensitively", () => {
		expect(gradeExercise("LAETI", ex)).toBe("wrong");
	});
	it("exact match beats the denylist", () => {
		expect(
			gradeExercise("laetus", { answer: "laetus", wrongAnswers: ["laetus"] }),
		).toBe("exact");
	});
	it("non-denylisted inputs are unaffected", () => {
		expect(gradeExercise("laetus", ex)).toBe("exact");
		expect(gradeExercise("laetis", ex)).toBe("typo");
		expect(gradeExercise("bonus", ex)).toBe("wrong");
	});
});

describe("detectWrongLanguage", () => {
	const audioEx = {
		answer: "je préfère",
		direction: "nl->fr",
		prompt: "🔊 Luister en type het woord",
	};
	it("detects the typed Dutch meaning on a listening question", () => {
		expect(detectWrongLanguage("ik heb liever", audioEx, "ik heb liever")).toBe(
			"typed-translation",
		);
	});
	it("detects a typo'd meaning too", () => {
		expect(detectWrongLanguage("ik heb lievr", audioEx, "ik heb liever")).toBe(
			"typed-translation",
		);
	});
	it("detects copying the prompt instead of translating", () => {
		expect(
			detectWrongLanguage(
				"voilà",
				{ answer: "alsjeblieft", direction: "fr->nl" },
				undefined,
				"voilà",
			),
		).toBe("copied-prompt");
	});
	it("returns undefined for correct, empty, and genuinely wrong answers", () => {
		expect(
			detectWrongLanguage("je préfère", audioEx, "ik heb liever"),
		).toBeUndefined();
		expect(detectWrongLanguage("", audioEx, "ik heb liever")).toBeUndefined();
		expect(
			detectWrongLanguage("merci beaucoup", audioEx, "ik heb liever"),
		).toBeUndefined();
	});
});

describe("Dutch je/jij leniency", () => {
	it("accepts je for jij in Dutch answers (fr->nl)", () => {
		expect(
			isExerciseCorrect("Hoe heet je?", {
				answer: "Hoe heet jij?",
				direction: "fr->nl",
			}),
		).toBe(true);
		expect(
			isExerciseCorrect("Waar woon je?", {
				answer: "Waar woon jij?",
				direction: "fr->nl",
			}),
		).toBe(true);
	});
	it("accepts jij for je in Dutch answers", () => {
		expect(
			isExerciseCorrect("Heb jij een broer?", {
				answer: "Heb je een broer?",
				direction: "fr->nl",
			}),
		).toBe(true);
	});
	it("accepts mixed combinations within one sentence", () => {
		expect(
			isExerciseCorrect("En je, hoe oud ben je?", {
				answer: "En jij, hoe oud ben jij?",
				direction: "fr->nl",
			}),
		).toBe(true);
		expect(
			isExerciseCorrect("En jij, hoe oud ben je?", {
				answer: "En jij, hoe oud ben jij?",
				direction: "fr->nl",
			}),
		).toBe(true);
	});
	it("still accepts the exact answer", () => {
		expect(
			isExerciseCorrect("Hoe heet jij?", {
				answer: "Hoe heet jij?",
				direction: "fr->nl",
			}),
		).toBe(true);
	});
	it("still rejects wrong answers", () => {
		expect(
			isExerciseCorrect("Hoe oud ben je?", {
				answer: "Hoe heet jij?",
				direction: "fr->nl",
			}),
		).toBe(false);
	});
	it("does not apply to French answers (nl->fr)", () => {
		expect(
			isExerciseCorrect("jij parle", {
				answer: "je parle",
				direction: "nl->fr",
			}),
		).toBe(false);
		expect(
			isExerciseCorrect("je parle", {
				answer: "je parle",
				direction: "nl->fr",
			}),
		).toBe(true);
	});
	it("does not apply without direction (strict, backward compatible)", () => {
		expect(isExerciseCorrect("Hoe heet je?", { answer: "Hoe heet jij?" })).toBe(
			false,
		);
	});
	it("canonicalDutchPronouns only touches whole words", () => {
		expect(canonicalDutchPronouns(normalize("jijzelf"))).toBe("jijzelf");
		expect(canonicalDutchPronouns(normalize("JIJ"))).toBe("je");
	});
});
