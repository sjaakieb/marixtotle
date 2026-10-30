"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
	type AllProgress,
	getChapterStats,
	isChapterComplete,
	loadAllProgress,
} from "@/lib/progress";
import type { Chapter } from "@/lib/schema";
import { getMasteryItems } from "@/lib/words";

type Props = {
	chapters: Chapter[];
};

const languageMeta: Record<
	string,
	{ label: string; flag: string; description: string; color: string }
> = {
	latin: {
		label: "Latijn",
		flag: "🏛️",
		description: "Nederlands ↔ Latijn",
		color: "sky",
	},
	french: {
		label: "Frans",
		flag: "🇫🇷",
		description: "Nederlands ↔ Frans",
		color: "blue",
	},
	english: {
		label: "Engels",
		flag: "🇬🇧",
		description: "Nederlands ↔ Engels",
		color: "emerald",
	},
	greek: {
		label: "Grieks",
		flag: "🇬🇷",
		description: "Nederlands ↔ Grieks",
		color: "violet",
	},
	dutch: {
		label: "Nederlands",
		flag: "🇳🇱",
		description: "Werkwoordspelling",
		color: "amber",
	},
	topo: {
		label: "Aardrijkskunde",
		flag: "🗺️",
		description: "Land ↔ Hoofdstad",
		color: "teal",
	},
};

export function ChapterList({ chapters }: Props) {
	const [progress, setProgress] = useState<AllProgress>({});

	useEffect(() => {
		const refresh = () => {
			try {
				setProgress(loadAllProgress());
			} catch {
				// private mode — no progress shown
			}
		};
		refresh();
		window.addEventListener("storage", refresh);
		window.addEventListener("focus", refresh);
		return () => {
			window.removeEventListener("storage", refresh);
			window.removeEventListener("focus", refresh);
		};
	}, []);

	return (
		<div className="grid gap-5">
			{chapters.map((ch) => (
				<ChapterCard key={ch.id} chapter={ch} progress={progress[ch.id]} />
			))}
			{chapters.length === 0 && (
				<div className="pixel-panel bg-white p-6 text-center text-xl text-stone-500 dark:bg-stone-900 dark:text-stone-400">
					Geen onderwerpen voor dit vak in deze periode.
				</div>
			)}
		</div>
	);
}

/** @deprecated Use ChapterList — filters zijn vervangen door de vak-pagina. */
export const ChapterBrowser = ChapterList;

function ChapterCard({
	chapter,
	progress,
}: {
	chapter: Chapter;
	progress?: Record<string, number>;
}) {
	const meta = languageMeta[chapter.language ?? "latin"];

	const badgeColor =
		chapter.language === "french"
			? "bg-blue-600 hover:bg-blue-500"
			: chapter.language === "english"
				? "bg-emerald-600 hover:bg-emerald-500"
				: chapter.language === "greek"
					? "bg-violet-600 hover:bg-violet-500"
					: chapter.language === "dutch"
						? "bg-amber-600 hover:bg-amber-500"
						: chapter.language === "topo"
							? "bg-teal-600 hover:bg-teal-500"
							: "bg-sky-600 hover:bg-sky-500";

	const items = getMasteryItems(chapter);
	const vocabCount = items.filter((i) => i.kind === "vocab").length;
	const topoCount = items.filter((i) => i.kind === "topo").length;
	const hasVocab = vocabCount > 0;
	const hasLearnList = hasVocab || topoCount > 0;
	const stats = getChapterStats(items, progress ?? {});
	// Flat practice chapters (Dutch spelling) track no mastery levels:
	// every exercise is asked once, typing only.
	const isFlat = chapter.language === "dutch";
	const showMastery = !isFlat && stats.sum > 0;
	const complete = !isFlat && isChapterComplete(items, progress ?? {});

	return (
		<div className="pixel-panel group bg-white p-4 dark:bg-stone-900">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="text-sm">{meta.flag}</span>
						<span className="font-pixel text-[11px] leading-relaxed text-stone-900 dark:text-stone-50">
							{chapter.title}
						</span>
					</div>
					{chapter.description && (
						<div className="mt-1 text-xl leading-tight text-stone-600 dark:text-stone-400">
							{chapter.description}
						</div>
					)}
					<div className="mt-2 font-terminal text-lg leading-none text-stone-500 dark:text-stone-400">
						{chapter.exercises.length} oefeningen • {meta.description}
						{hasVocab && ` • ${vocabCount} woorden`}
						{topoCount > 0 && ` • ${topoCount} landen`}
					</div>
					<div className="mt-3">
						<div className="flex items-center justify-between font-pixel text-[9px]">
							<span
								className={
									showMastery
										? "text-violet-700 dark:text-violet-300"
										: "text-stone-400 dark:text-stone-500"
								}
							>
								{isFlat
									? "Rondes van 10 • typen"
									: showMastery
										? `Beheersing ${stats.pct}%`
										: "Nog niet geoefend"}
							</span>
							{showMastery && (
								<span className="text-stone-400 dark:text-stone-500">
									{stats.mastered}/{stats.total} op L5
								</span>
							)}
						</div>
						{!isFlat && (
							<div className="mt-2 h-4 w-full border-2 border-stone-900 bg-stone-200 dark:border-black dark:bg-stone-800">
								<div
									className="pixel-progress-fill h-full bg-violet-500 transition-all"
									style={{ width: `${stats.pct}%` }}
								/>
							</div>
						)}
					</div>
				</div>
				<div className="flex shrink-0 flex-col items-end gap-3">
					{complete ? (
						<Link
							href={`/test/${chapter.id}`}
							className="pixel-btn bg-emerald-600 px-3 py-2 font-pixel text-[10px] text-white"
							title="Onderwerp beheerst — toets jezelf met 10 vragen op niveau 3–5"
						>
							✓ Toetsen →
						</Link>
					) : (
						<Link
							href={`/play/${chapter.id}`}
							className={`pixel-btn px-3 py-2 font-pixel text-[10px] text-white ${badgeColor}`}
						>
							Oefenen →
						</Link>
					)}
					{hasLearnList && (
						<Link
							href={`/words/${chapter.id}`}
							className="pixel-btn bg-white px-3 py-2 font-pixel text-[10px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							{topoCount > 0 ? "📋 Leren" : "📋 Woorden"}
						</Link>
					)}
					{topoCount > 0 && (
						<Link
							href={`/fly/${chapter.id}`}
							className="pixel-btn bg-teal-600 px-3 py-2 font-pixel text-[10px] text-white hover:bg-teal-500"
							title="Vlieg met de helikopter naar de gevraagde stad — telt niet mee voor de beheersing"
						>
							🚁 Vliegen
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
