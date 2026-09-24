import Link from "next/link";
import { notFound } from "next/navigation";
import { WordListClient } from "@/components/WordListClient";
import { chapters, getChapter } from "@/content/chapters";
import { getLanguage } from "@/lib/languages";

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
	const vocabCount = chapter.exercises.filter((e) => e.type === "vocab").length;

	return (
		<div className="min-h-dvh bg-stone-50">
			<div className="mx-auto max-w-3xl px-5 py-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<div className="flex items-center gap-2">
							{lang && <span>{lang.flag}</span>}
							<span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
								{lang?.label ?? chapter.language} • Woordenlijst
							</span>
						</div>
						<h1 className="text-lg font-bold text-stone-900">{chapter.title}</h1>
						{chapter.description && (
							<p className="text-sm text-stone-600">{chapter.description}</p>
						)}
						<div className="mt-1 text-xs font-medium text-stone-500">
							{vocabCount} woorden • {chapter.exercises.length} oefeningen totaal
						</div>
					</div>
					<div className="flex shrink-0 flex-col gap-2 sm:flex-row">
						<Link
							href={`/play/${chapter.id}`}
							className="rounded-full bg-sky-600 px-4 py-1.5 text-center text-xs font-semibold text-white hover:bg-sky-700"
						>
							Oefenen →
						</Link>
						<Link
							href="/"
							className="rounded-full bg-white px-3 py-1.5 text-center text-xs font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
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
