import { type Chapter, chaptersSchema } from "@/lib/schema";
import { chapter as latin2 } from "./latin/minerva2";
import { chapter as latin2a } from "./latin/minerva2a";

const rawChapters = [
	latin2a,
	latin2
] as const;

// export const newChapters: Chapter[] = chaptersSchema.parse(rawChapters);

export const chapters: Chapter[] = chaptersSchema.parse(rawChapters);

export function getChapter(id: string): Chapter | undefined {
	return chapters.find((c) => c.id === id);
}
