import { type Chapter, chaptersSchema } from "@/lib/schema";
import { chapter as english1 } from "./english/beginner1";
import { chapter as englishLesson1 } from "./english/lesson1";
import { chapter as french1 } from "./french/beginner1";
import { chapter as greek1 } from "./greek/beginner1";
import { chapter as latin2 } from "./latin/minerva2";
import { chapter as latin2a } from "./latin/minerva2a";

const rawChapters = [
	latin2a,
	latin2,
	french1,
	english1,
	englishLesson1,
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
