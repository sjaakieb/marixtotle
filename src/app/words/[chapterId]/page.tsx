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
		<div className="min-h-dvh bg-stone-50 dark:bg-stone-950">
			<div className="mx-auto max-w-3xl px-5 py-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<div className="flex items-center gap-2">
							{lang && <span>{lang.flag}</span>}
							<span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
								{lang?.label ?? chapter.language} • Woordenlijst
							</span>
						</div>
						<h1 className="text-lg font-bold text-stone-900 dark:text-stone-50">
							{chapter.title}
						</h1>
						{chapter.description && (
							<p className="text-sm text-stone-600 dark:text-stone-400">
								{chapter.description}
							</p>
						)}
						<div className="mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">
							{vocabCount} unieke woorden
						</div>
					</div>
					<div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
						<ThemeToggle />
						<Link
							href={`/play/${chapter.id}`}
							className="rounded-full bg-sky-600 px-4 py-1.5 text-center text-xs font-semibold text-white hover:bg-sky-700"
						>
							Oefenen →
						</Link>
						<Link
							href="/"
							className="rounded-full bg-white px-3 py-1.5 text-center text-xs font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
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
