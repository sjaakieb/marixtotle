import Link from "next/link";
import { notFound } from "next/navigation";
import { FlyClient } from "@/components/FlyClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { chapters, getChapter } from "@/content/chapters";
import { getLanguage } from "@/lib/languages";
import { flyLevelForChapterId } from "@/topo/fly-quiz";

const flyChapters = chapters.filter((c) => c.language === "topo");

export function generateStaticParams() {
	return flyChapters.map((c) => ({ chapterId: c.id }));
}

export default async function FlyPage({
	params,
}: {
	params: Promise<{ chapterId: string }>;
}) {
	const { chapterId } = await params;
	const chapter = getChapter(chapterId);
	if (!chapter) notFound();
	if (chapter.language !== "topo") notFound();

	const lang = getLanguage(chapter.language ?? "latin");

	return (
		<div className="bg-pixel-grid min-h-dvh bg-stone-100 dark:bg-stone-950">
			<div className="mx-auto max-w-3xl px-5 py-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<div className="flex items-center gap-2">
							{lang && <span>{lang.flag}</span>}
							<span className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
								{lang?.label ?? chapter.language} • 🚁 Helikopter
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
					</div>
					<div className="flex shrink-0 flex-col items-end gap-3 sm:flex-row sm:items-center">
						<ThemeToggle />
						<Link
							href={`/play/${chapter.id}`}
							className="pixel-btn bg-white px-3 py-1.5 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							Oefenen
						</Link>
						<Link
							href="/"
							className="pixel-btn bg-white px-3 py-1.5 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							← Overzicht
						</Link>
					</div>
				</div>
				<FlyClient chapter={chapter} level={flyLevelForChapterId(chapter.id)} />
			</div>
		</div>
	);
}
