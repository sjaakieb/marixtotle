import { z } from "zod";

export const vocabExerciseSchema = z.object({
	id: z.string().min(1),
	type: z.literal("vocab"),
	prompt: z.string().min(1),
	answer: z.string().min(1),
	alternatives: z.array(z.string().min(1)).min(1).max(6).optional(),
	direction: z.enum(["nl->la", "la->nl"]),
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
