import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WordListClient } from "@/components/WordListClient";
import { chapters, getChapter } from "@/content/chapters";
import { getLanguage } from "@/lib/languages";
import { getMasteryItems } from "@/lib/words";

export function generateStaticParams() {
	return chapters.map((c) => ({ chapterId: c.id }));
}

export default async function WordsPage({
	params,
}: {
	params: Promise<{ chapterId: string }>;
}) {
	const { chapterId } = await params;
	const chapter = getChapter(chapterId);
	if (!chapter) notFound();

	const lang = getLanguage(chapter.language ?? "latin");
	const vocabCount = getMasteryItems(chapter).filter(
		(i) => i.kind === "vocab",
	).length;

	return (
		<div className="bg-pixel-grid min-h-dvh bg-stone-100 dark:bg-stone-950">
			<div className="mx-auto max-w-3xl px-5 py-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<div className="flex items-center gap-2">
							{lang && <span>{lang.flag}</span>}
							<span className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
								{lang?.label ?? chapter.language} • Woordenlijst
							</span>
						</div>
						<h1 className="mt-2 font-pixel text-xs leading-relaxed text-stone-900 dark:text-stone-50">
							{chapter.title}
						</h1>
						{chapter.description && (
							<p className="mt-1 text-xl text-stone-600 dark:text-stone-400">
								{chapter.description}
							</p>
						)}
						<div className="mt-1 font-terminal text-xl text-stone-500 dark:text-stone-400">
							{vocabCount} unieke woorden
						</div>
					</div>
					<div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
						<ThemeToggle />
						<Link
							href={`/play/${chapter.id}`}
							className="pixel-btn bg-sky-600 px-4 py-1.5 text-center font-pixel text-[9px] text-white hover:bg-sky-500"
						>
							Oefenen →
						</Link>
						<Link
							href="/"
							className="pixel-btn bg-white px-3 py-1.5 text-center font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							← Overzicht
						</Link>
					</div>
				</div>

				<WordListClient chapter={chapter} />
			</div>
		</div>
	);
}
