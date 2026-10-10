"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LANGUAGES, type LanguageId } from "@/lib/languages";
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
};

function LanguageTab({
	active,
	onClick,
	flag,
	label,
	count,
}: {
	active: boolean;
	onClick: () => void;
	flag: string;
	label: string;
	count: number;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				"pixel-btn flex items-center gap-2 px-3 py-2 font-pixel text-[10px]",
				active
					? "bg-stone-900 text-lime-300 dark:bg-lime-400 dark:text-stone-900"
					: "bg-white text-stone-700 dark:bg-stone-900 dark:text-stone-200",
			].join(" ")}
		>
			<span className="text-sm">{flag}</span>
			<span>{label}</span>
			<span
				className={[
					"ml-1 px-1.5 py-0.5 font-terminal text-lg leading-none",
					active
						? "bg-lime-400 text-stone-900 dark:bg-stone-900 dark:text-lime-300"
						: "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
				].join(" ")}
			>
				{count}
			</span>
		</button>
	);
}

export function ChapterBrowser({ chapters }: Props) {
	const [selected, setSelected] = useState<LanguageId | "all">("all");
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

	const filtered =
		selected === "all"
			? chapters
			: chapters.filter((c) => (c.language ?? "latin") === selected);

	const grouped = LANGUAGES.map((lang) => ({
		lang,
		chapters: chapters.filter((c) => (c.language ?? "latin") === lang.id),
	})).filter((g) => g.chapters.length > 0);

	// When filtered = all, show grouped sections. Otherwise show flat list.
	const showGrouped = selected === "all";

	return (
		<div className="space-y-6">
			{/* Language menu */}
			<div className="flex flex-wrap gap-3">
				<button
					type="button"
					onClick={() => setSelected("all")}
					className={[
						"pixel-btn px-3 py-2 font-pixel text-[10px]",
						selected === "all"
							? "bg-stone-900 text-lime-300 dark:bg-lime-400 dark:text-stone-900"
							: "bg-white text-stone-700 dark:bg-stone-900 dark:text-stone-200",
					].join(" ")}
				>
					Alle talen
					<span
						className={[
							"ml-2 px-1.5 py-0.5 font-terminal text-lg leading-none",
							selected === "all"
								? "bg-lime-400 text-stone-900 dark:bg-stone-900 dark:text-lime-300"
								: "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
						].join(" ")}
					>
						{chapters.length}
					</span>
				</button>
				{LANGUAGES.map((l) => {
					const count = chapters.filter(
						(c) => (c.language ?? "latin") === l.id,
					).length;
					if (count === 0) return null;
					return (
						<LanguageTab
							key={l.id}
							active={selected === l.id}
							onClick={() => setSelected(l.id as LanguageId)}
							flag={l.flag}
							label={l.label}
							count={count}
						/>
					);
				})}
			</div>

			{/* Chapter list */}
			{showGrouped ? (
				<div className="space-y-8">
					{grouped.map(({ lang, chapters: langChapters }) => {
						const meta = languageMeta[lang.id];
						return (
							<div key={lang.id}>
								<div className="mb-3 flex items-center gap-2">
									<span className="text-xl">{meta.flag}</span>
									<h3 className="font-pixel text-[11px] text-stone-900 dark:text-stone-50">
										{meta.label}
									</h3>
									<span className="text-xl text-stone-500 dark:text-stone-400">
										• {meta.description}
									</span>
									<span className="ml-auto font-terminal text-lg text-stone-400 dark:text-stone-500">
										{langChapters.length} hoofdstuk
										{langChapters.length !== 1 ? "ken" : ""}
									</span>
								</div>
								<div className="grid gap-5">
									{langChapters.map((ch) => (
										<ChapterCard
											key={ch.id}
											chapter={ch}
											progress={progress[ch.id]}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="grid gap-5">
					{filtered.map((ch) => (
						<ChapterCard key={ch.id} chapter={ch} progress={progress[ch.id]} />
					))}
					{filtered.length === 0 && (
						<div className="pixel-panel bg-white p-6 text-center text-xl text-stone-500 dark:bg-stone-900 dark:text-stone-400">
							Geen hoofdstukken voor deze taal.
						</div>
					)}
				</div>
			)}
		</div>
	);
}

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
						: "bg-sky-600 hover:bg-sky-500";

	const items = getMasteryItems(chapter);
	const vocabCount = items.filter((i) => i.kind === "vocab").length;
	const hasVocab = vocabCount > 0;
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
							title="Hoofdstuk beheerst — toets jezelf met 10 vragen op niveau 3–5"
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
					{hasVocab && (
						<Link
							href={`/words/${chapter.id}`}
							className="pixel-btn bg-white px-3 py-2 font-pixel text-[10px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							📋 Woorden
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
