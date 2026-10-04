import { normalize } from "./matcher";
import type { Chapter, LanguageId } from "./schema";

export type VocabItem = {
	kind: "vocab";
	/** stable mastery key: normalized nl::foreign */
	key: string;
	nl: string;
	foreign: string;
	hint?: string;
	/** accepted variants for the Dutch side */
	nlAlternatives: string[];
	/** accepted variants for the foreign side */
	foreignAlternatives: string[];
	language: LanguageId;
};

export type DeclItem = {
	kind: "declension";
	/** exercise id */
	key: string;
	prompt: string;
	lemma?: string;
	form?: string;
	answer: string;
	alternatives: string[];
	hint?: string;
	/** pre-authored MCQ options, if any */
	options?: string[];
};

export type MasteryItem = VocabItem | DeclItem;

/** Normalized mastery key for a vocab pair (shared with WordListClient dots). */
export function wordKey(nl: string, foreign: string): string {
	return `${normalize(stripParens(nl))}::${normalize(stripParens(foreign))}`;
}

/** Grouping key: the foreign side is the stable identifier.
 *  Source content often annotates only the Dutch side
 *  (e.g. "de vakantie (vrouwelijk meervoud)" vs "de vakantie"),
 *  so grouping by foreign merges both directions of one word.
 *  Case-SENSITIVE on purpose: Greek "α" and "Α" are different
 *  letters to learn and must not collapse into one item. */
export function vocabGroupKey(foreign: string, language: string): string {
	return `vocab:${language}:${keyNorm(stripParens(foreign))}`;
}

/** NFC + trim + collapse whitespace, but preserve case (unlike matcher.normalize). */
function keyNorm(s: string): string {
	return s.normalize("NFC").trim().replace(/\s+/g, " ");
}

function stripParens(s: string): string {
	return s.replace(/\s*\([^)]*\)/g, "").trim();
}

function splitPair(
	prompt: string,
	answer: string,
	direction: string,
): { nl: string; foreign: string } {
	const isNlToForeign = direction.startsWith("nl->");
	return isNlToForeign
		? { nl: prompt, foreign: answer }
		: { nl: answer, foreign: prompt };
}

/**
 * Derive mastery items from a chapter.
 * Vocab exercises in both directions collapse into ONE item per word pair
 * (so L1..L5 can be generated dynamically). Greek letters work identically.
 * Declension exercises each become their own item.
 */
export function getMasteryItems(chapter: Chapter): MasteryItem[] {
	const vocab = new Map<string, VocabItem>();
	const decl: DeclItem[] = [];
	const language = (chapter.language ?? "latin") as LanguageId;

	for (const ex of chapter.exercises) {
		if (ex.type === "vocab") {
			const { nl, foreign } = splitPair(ex.prompt, ex.answer, ex.direction);
			const key = vocabGroupKey(foreign, language);
			const isNlToForeign = ex.direction.startsWith("nl->");
			const existing = vocab.get(key);
			// Alternatives belong to the answer side of the source exercise.
			const nlAlts = isNlToForeign ? [] : (ex.alternatives ?? []);
			const foreignAlts = isNlToForeign ? (ex.alternatives ?? []) : [];
			// Prefer the cleanest Dutch label (no parenthetical note, shortest).
			const cleanNl = stripParens(nl).trim() || nl;
			if (!existing) {
				vocab.set(key, {
					kind: "vocab",
					key,
					nl: cleanNl,
					foreign: stripParens(foreign).trim() || foreign,
					hint: ex.hint,
					nlAlternatives: [...nlAlts],
					foreignAlternatives: [...foreignAlts],
					language,
				});
			} else {
				if (!existing.hint && ex.hint) existing.hint = ex.hint;
				// Keep the shorter/cleaner label for prompts.
				if (cleanNl.length < existing.nl.length && !/\//.test(existing.nl)) {
					// also remember the old label as an accepted variant
					if (!existing.nlAlternatives.includes(existing.nl))
						existing.nlAlternatives.push(existing.nl);
					existing.nl = cleanNl;
				} else if (
					nl !== existing.nl &&
					!existing.nlAlternatives.includes(nl)
				) {
					existing.nlAlternatives.push(nl);
				}
				for (const a of nlAlts) {
					if (!existing.nlAlternatives.includes(a))
						existing.nlAlternatives.push(a);
				}
				for (const a of foreignAlts) {
					if (!existing.foreignAlternatives.includes(a))
						existing.foreignAlternatives.push(a);
				}
			}
		} else {
			decl.push({
				kind: "declension",
				key: ex.id,
				prompt: ex.prompt,
				lemma: ex.lemma,
				form: ex.form,
				answer: ex.answer,
				alternatives: ex.alternatives ?? [],
				hint: ex.hint,
				options: ex.options,
			});
		}
	}

	return [...vocab.values(), ...decl];
}

export function countVocabItems(items: MasteryItem[]): number {
	return items.filter((i) => i.kind === "vocab").length;
}
