import { type Chapter, chaptersSchema } from "@/lib/schema";
import { chapter as english1 } from "./english/beginner1";
import { chapter as englishLesson1 } from "./english/lesson1";
import { chapter as frenchJours } from "./french/days";
import { chapter as frenchNombres } from "./french/numbers";
import { chapter as frenchVocabulaireA } from "./french/vocabulaireA";
import { chapter as frenchVocabulaireB } from "./french/vocabulaireB";
import { chapter as frenchVocabulaireC } from "./french/vocabulaireC";
import { chapter as frenchVocabulaireE } from "./french/vocabulaireE";
import { chapter as frenchVocabulaireF } from "./french/vocabulaireF";
import { chapter as frenchVocabulaireG } from "./french/vocabulaireG";
import { chapter as greek1 } from "./greek/beginner1";
import { chapter as greekAlphabet } from "./greek/alphabet";
import { chapter as greekClassical1 } from "./greek/classical1";
import { chapter as greekTransliteration } from "./greek/transliteration";
import { chapter as latin2 } from "./latin/minerva2";
import { chapter as latin2a } from "./latin/minerva2a";
import { chapter as latin2b } from "./latin/minerva2b";

const rawChapters = [
	latin2b,
	latin2a,
	latin2,
	frenchVocabulaireA,
	frenchVocabulaireB,
	frenchVocabulaireE,
	frenchVocabulaireF,
	frenchVocabulaireC,
	frenchVocabulaireG,
	frenchJours,
	frenchNombres,
	english1,
	englishLesson1,
	greekAlphabet,
	greekTransliteration,
	greekClassical1,
	greek1,
] as const;

export const chapters: Chapter[] = chaptersSchema.parse(rawChapters);

export function getChapter(id: string): Chapter | undefined {
	return chapters.find((c) => c.id === id);
}

export function getChaptersByLanguage(lang: string): Chapter[] {
	return chapters.filter((c) => (c.language ?? "latin") === lang);
}

export const chaptersByLanguage = {
	latin: getChaptersByLanguage("latin"),
	french: getChaptersByLanguage("french"),
	english: getChaptersByLanguage("english"),
	greek: getChaptersByLanguage("greek"),
} as const;
