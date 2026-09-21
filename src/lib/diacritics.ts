import type { LanguageId } from "./schema";

export const FRENCH_CHARS_LOWER = [
	"é",
	"è",
	"ê",
	"ë",
	"à",
	"â",
	"ô",
	"î",
	"û",
	"ù",
	"ü",
	"ç",
	"œ",
	"æ",
] as const;

export const FRENCH_CHARS_UPPER = [
	"É",
	"È",
	"Ê",
	"À",
	"Â",
	"Ç",
	"Œ",
	"Æ",
] as const;

export const FRENCH_CHARS = [
	...FRENCH_CHARS_LOWER,
	...FRENCH_CHARS_UPPER,
] as const;

export const GREEK_LETTERS_LOWER = [
	"α",
	"β",
	"γ",
	"δ",
	"ε",
	"ζ",
	"η",
	"θ",
	"ι",
	"κ",
	"λ",
	"μ",
	"ν",
	"ξ",
	"ο",
	"π",
	"ρ",
	"σ",
	"ς",
	"τ",
	"υ",
	"φ",
	"χ",
	"ψ",
	"ω",
] as const;

export const GREEK_ACCENTED = [
	"ά",
	"έ",
	"ή",
	"ί",
	"ό",
	"ύ",
	"ώ",
	"ϊ",
	"ϋ",
	"ΐ",
	"ΰ",
] as const;

export const GREEK_LETTERS_UPPER = [
	"Α",
	"Β",
	"Γ",
	"Δ",
	"Ε",
	"Ζ",
	"Η",
	"Θ",
	"Ι",
	"Κ",
	"Λ",
	"Μ",
	"Ν",
	"Ξ",
	"Ο",
	"Π",
	"Ρ",
	"Σ",
	"Τ",
	"Υ",
	"Φ",
	"Χ",
	"Ψ",
	"Ω",
] as const;

export function getDiacriticsForLanguage(
	language: LanguageId,
): readonly string[] | null {
	switch (language) {
		case "latin":
			return null; // handled by MacronToolbar
		case "french":
			return FRENCH_CHARS;
		case "greek":
			return [...GREEK_LETTERS_LOWER, ...GREEK_ACCENTED];
		case "english":
			return null;
		default:
			return null;
	}
}
