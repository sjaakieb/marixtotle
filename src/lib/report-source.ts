import { getChapter } from "@/content/chapters";
import { vocabGroupKey } from "./words";

/** Source exercises in the chapter content that produced this report's item. */
export function findReportSources(
	chapterId: string,
	itemKey: string,
): { exerciseId: string; prompt: string; answer: string }[] {
	const chapter = getChapter(chapterId);
	if (!chapter) return [];
	const language = chapter.language ?? "latin";
	const out: { exerciseId: string; prompt: string; answer: string }[] = [];
	for (const ex of chapter.exercises) {
		if (ex.type === "declension") {
			if (ex.id === itemKey) {
				out.push({ exerciseId: ex.id, prompt: ex.prompt, answer: ex.answer });
			}
			continue;
		}
		const foreign = ex.direction.startsWith("nl->") ? ex.answer : ex.prompt;
		if (vocabGroupKey(foreign, language) === itemKey) {
			out.push({ exerciseId: ex.id, prompt: ex.prompt, answer: ex.answer });
		}
	}
	return out;
}
