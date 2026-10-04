"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LANGUAGES, type LanguageId } from "@/lib/languages";
import {
	type AllProgress,
	getChapterStats,
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
				"flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
				active
					? "bg-stone-900 text-white shadow"
					: "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50",
			].join(" ")}
		>
			<span>{flag}</span>
			<span>{label}</span>
			<span
				className={[
					"ml-1 rounded-full px-2 py-0.5 text-xs",
					active ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600",
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
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => setSelected("all")}
					className={[
						"rounded-full px-4 py-2 text-sm font-semibold transition",
						selected === "all"
							? "bg-stone-900 text-white shadow"
							: "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50",
					].join(" ")}
				>
					Alle talen
					<span
						className={[
							"ml-2 rounded-full px-2 py-0.5 text-xs",
							selected === "all"
								? "bg-white/20 text-white"
								: "bg-stone-100 text-stone-600",
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
									<h3 className="text-base font-bold text-stone-900">
										{meta.label}
									</h3>
									<span className="text-sm font-medium text-stone-500">
										• {meta.description}
									</span>
									<span className="ml-auto text-xs font-medium text-stone-400">
										{langChapters.length} hoofdstuk
										{langChapters.length !== 1 ? "ken" : ""}
									</span>
								</div>
								<div className="grid gap-4">
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
				<div className="grid gap-4">
					{filtered.map((ch) => (
						<ChapterCard key={ch.id} chapter={ch} progress={progress[ch.id]} />
					))}
					{filtered.length === 0 && (
						<div className="rounded-xl bg-white p-6 text-center text-sm text-stone-500 ring-1 ring-stone-200">
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
	const hoverColor =
		chapter.language === "french"
			? "hover:border-blue-300 hover:bg-blue-50/50"
			: chapter.language === "english"
				? "hover:border-emerald-300 hover:bg-emerald-50/50"
				: chapter.language === "greek"
					? "hover:border-violet-300 hover:bg-violet-50/50"
					: "hover:border-sky-300 hover:bg-sky-50/50";

	const badgeColor =
		chapter.language === "french"
			? "bg-blue-600 hover:bg-blue-700"
			: chapter.language === "english"
				? "bg-emerald-600 hover:bg-emerald-700"
				: chapter.language === "greek"
					? "bg-violet-600 hover:bg-violet-700"
					: "bg-sky-600 hover:bg-sky-700";

	const items = getMasteryItems(chapter);
	const vocabCount = items.filter((i) => i.kind === "vocab").length;
	const hasVocab = vocabCount > 0;
	const stats = getChapterStats(items, progress ?? {});
	const showMastery = stats.sum > 0;

	return (
		<div
			className={`group rounded-xl border border-stone-200 bg-white p-4 transition ${hoverColor}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="text-sm">{meta.flag}</span>
						<span className="font-semibold text-stone-900">
							{chapter.title}
						</span>
					</div>
					{chapter.description && (
						<div className="mt-1 text-sm text-stone-600">
							{chapter.description}
						</div>
					)}
					<div className="mt-2 text-xs font-medium text-stone-500">
						{chapter.exercises.length} oefeningen • {meta.description}
						{hasVocab && ` • ${vocabCount} woorden`}
					</div>
					<div className="mt-2">
						<div className="flex items-center justify-between text-[11px] font-semibold">
							<span
								className={showMastery ? "text-violet-700" : "text-stone-400"}
							>
								{showMastery ? `Beheersing ${stats.pct}%` : "Nog niet geoefend"}
							</span>
							{showMastery && (
								<span className="text-stone-400">
									{stats.mastered}/{stats.total} op L5
								</span>
							)}
						</div>
						<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
							<div
								className="h-full rounded-full bg-violet-500 transition-all"
								style={{ width: `${stats.pct}%` }}
							/>
						</div>
					</div>
				</div>
				<div className="flex shrink-0 flex-col items-end gap-2">
					<Link
						href={`/play/${chapter.id}`}
						className={`rounded-full px-4 py-1.5 text-xs font-semibold text-white ${badgeColor}`}
					>
						Oefenen →
					</Link>
					{hasVocab && (
						<Link
							href={`/words/${chapter.id}`}
							className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
						>
							📋 Woordenlijst
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
