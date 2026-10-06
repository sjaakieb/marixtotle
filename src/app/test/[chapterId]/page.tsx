import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayClient } from "@/components/PlayClient";
import { chapters, getChapter } from "@/content/chapters";
import { getLanguage } from "@/lib/languages";

export function generateStaticParams() {
	return chapters.map((c) => ({ chapterId: c.id }));
}

export default async function TestPage({
	params,
}: {
	params: Promise<{ chapterId: string }>;
}) {
	const { chapterId } = await params;
	const chapter = getChapter(chapterId);
	if (!chapter) notFound();

	const lang = getLanguage(chapter.language ?? "latin");

	return (
		<div className="min-h-dvh bg-stone-50">
			<div className="mx-auto max-w-3xl px-5 py-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<div className="flex items-center gap-2">
							{lang && <span>{lang.flag}</span>}
							<span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
								{lang?.label ?? chapter.language} • Toets
							</span>
						</div>
						<h1 className="text-lg font-bold text-stone-900">
							{chapter.title}
						</h1>
						<p className="text-sm text-stone-600">
							10 vragen op niveau 3–5 over verschillende woorden. De toets
							verandert je voortgang niet.
						</p>
					</div>
					<div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
						<Link
							href="/"
							className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
						>
							← Overzicht
						</Link>
					</div>
				</div>
				<PlayClient chapter={chapter} mode="test" />
			</div>
		</div>
	);
}
