import { z } from "zod";

export const languageIdSchema = z.enum(["latin", "french", "english", "greek"]);

export type LanguageId = z.infer<typeof languageIdSchema>;

export const vocabDirections = [
	"nl->la",
	"la->nl",
	"nl->fr",
	"fr->nl",
	"nl->en",
	"en->nl",
	"nl->el",
	"el->nl",
] as const;

export const vocabExerciseSchema = z.object({
	id: z.string().min(1),
	type: z.literal("vocab"),
	prompt: z.string().min(1),
	answer: z.string().min(1),
	alternatives: z.array(z.string().min(1)).min(1).max(6).optional(),
	direction: z.enum(vocabDirections),
	hint: z.string().optional(),
	options: z.array(z.string().min(1)).min(2).max(6).optional(),
});

export const declensionExerciseSchema = z.object({
	id: z.string().min(1),
	type: z.literal("declension"),
	// e.g. "puella, puellae (f) - genitivus singularis"
	prompt: z.string().min(1),
	lemma: z.string().min(1).optional(),
	// optional grammatical description for the learner
	form: z.string().optional(),
	answer: z.string().min(1),
	alternatives: z.array(z.string().min(1)).min(1).max(6).optional(),
	hint: z.string().optional(),
	options: z.array(z.string().min(1)).min(2).max(6).optional(),
});

export const exerciseSchema = z.discriminatedUnion("type", [
	vocabExerciseSchema,
	declensionExerciseSchema,
]);

export const chapterSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	language: languageIdSchema.default("latin"),
	exercises: z.array(exerciseSchema).min(1),
});

export const chaptersSchema = z.array(chapterSchema);

export type VocabExercise = z.infer<typeof vocabExerciseSchema>;
export type DeclensionExercise = z.infer<typeof declensionExerciseSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type Chapter = z.infer<typeof chapterSchema>;

export function isVocab(ex: Exercise): ex is VocabExercise {
	return ex.type === "vocab";
}

export function needsMacronToolbar(ex: Exercise): boolean {
	if (ex.options && ex.options.length > 0) return false;
	if (ex.type === "declension") return true;
	if (ex.type === "vocab" && ex.direction === "nl->la") return true;
	return false;
}

export function needsDiacriticsToolbar(
	ex: Exercise,
	language?: LanguageId,
): boolean {
	if (ex.options && ex.options.length > 0) return false;
	if (ex.type === "declension") return true;
	if (ex.type === "vocab") {
		if (
			ex.direction === "nl->la" ||
			ex.direction === "nl->fr" ||
			ex.direction === "nl->el"
		)
			return true;
		// fallback via explicit language param
		if (language && language !== "english" && ex.direction.startsWith("nl->"))
			return true;
	}
	return false;
}

export function getLanguageFromDirection(
	direction: string,
): LanguageId | undefined {
	if (direction.endsWith("->la") || direction.startsWith("la->"))
		return "latin";
	if (direction.endsWith("->fr") || direction.startsWith("fr->"))
		return "french";
	if (direction.endsWith("->en") || direction.startsWith("en->"))
		return "english";
	if (direction.endsWith("->el") || direction.startsWith("el->"))
		return "greek";
	return undefined;
}
