"use client";

import { useEffect, useMemo, useState } from "react";
import { type ChapterProgress, loadChapterProgress } from "@/lib/progress";
import type { Chapter, LanguageId } from "@/lib/schema";
import { getSpeechLang, isSpeechSupported, speak } from "@/lib/speech";
import { getMasteryItems, type VocabItem } from "@/lib/words";

type WordPair = {
	key: string;
	nl: string;
	foreign: string;
	hint?: string;
	alternatives?: string[];
};

/**
 * Same canonical items as the quiz: parenthetical hints stripped
 * ("οὐ (voor medeklinker)" → "οὐ") and both directions merged,
 * so each word appears exactly once.
 */
function getWordPairs(chapter: Chapter): WordPair[] {
	return getMasteryItems(chapter)
		.filter((it): it is VocabItem => it.kind === "vocab")
		.map((it) => ({
			key: it.key,
			nl: it.nl,
			foreign: it.foreign,
			hint: it.hint,
			alternatives: [...it.nlAlternatives, ...it.foreignAlternatives],
		}));
}

const languageHeaders: Record<
	LanguageId,
	{ foreignLabel: string; foreignShort: string }
> = {
	latin: { foreignLabel: "Latijn", foreignShort: "LA" },
	french: { foreignLabel: "Frans", foreignShort: "FR" },
	english: { foreignLabel: "Engels", foreignShort: "EN" },
	greek: { foreignLabel: "Grieks", foreignShort: "EL" },
	dutch: { foreignLabel: "Nederlands", foreignShort: "NL" },
};

type Props = {
	chapter: Chapter;
};

function SpeakButton({ text, lang }: { text: string; lang: string }) {
	return (
		<button
			type="button"
			onClick={() => speak(text, lang)}
			aria-label={`Uitspraak van “${text}” beluisteren`}
			title="Uitspraak beluisteren"
			className="ml-1 inline-flex h-6 w-6 items-center justify-center border-2 border-transparent text-sm transition hover:border-violet-700 hover:bg-violet-200 hover:text-violet-900 active:scale-95 dark:text-stone-500 dark:hover:border-violet-400 dark:hover:bg-violet-950 dark:hover:text-violet-300"
		>
			<span aria-hidden>🔊</span>
		</button>
	);
}

export function WordListClient({ chapter }: Props) {
	const languageId = (chapter.language ?? "latin") as LanguageId;
	const header = languageHeaders[languageId] ?? languageHeaders.latin;

	const allPairs = useMemo(() => getWordPairs(chapter), [chapter]);

	const [query, setQuery] = useState("");
	const [sortAsc, setSortAsc] = useState(true);
	const [levels, setLevels] = useState<ChapterProgress>({});
	const [speechOK, setSpeechOK] = useState(false);

	useEffect(() => {
		try {
			setLevels(loadChapterProgress(chapter.id));
		} catch {}
		setSpeechOK(isSpeechSupported());
	}, [chapter.id]);

	const audioLang = getSpeechLang(languageId);

	const levelOf = (key: string): number => levels[key] ?? 0;

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		let list = [...allPairs];
		if (q) {
			list = list.filter(
				(p) =>
					p.nl.toLowerCase().includes(q) ||
					p.foreign.toLowerCase().includes(q) ||
					(p.hint && p.hint.toLowerCase().includes(q)),
			);
		}
		list.sort((a, b) =>
			sortAsc ? a.nl.localeCompare(b.nl, "nl") : b.nl.localeCompare(a.nl, "nl"),
		);
		return list;
	}, [allPairs, query, sortAsc]);

	const total = allPairs.length;
	const showing = filtered.length;

	const hasDeclension = chapter.exercises.some((e) => e.type === "declension");

	if (total === 0) {
		return (
			<div className="pixel-panel bg-white p-6 text-center dark:bg-stone-900">
				<div className="text-2xl text-stone-700 dark:text-stone-200">
					Geen woordenschat in dit hoofdstuk.
				</div>
				{hasDeclension && (
					<div className="mt-1 text-xl text-stone-500 dark:text-stone-400">
						Dit hoofdstuk bevat alleen verbuiging/vervoeging oefeningen.
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="pixel-panel bg-white p-4 sm:p-5 dark:bg-stone-900">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2 font-terminal text-xl text-stone-600 dark:text-stone-400">
						<span className="border-2 border-sky-700 bg-sky-100 px-2 py-0.5 text-sky-800 dark:border-sky-400 dark:bg-sky-950 dark:text-sky-200">
							{total} unieke woorden
						</span>
					</div>
				</div>

				<div className="mt-4 flex flex-col gap-3 sm:flex-row">
					<div className="relative flex-1">
						<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400 dark:text-stone-500">
							🔍
						</span>
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Zoeken (NL of vertaling)…"
							className="w-full border-[3px] border-stone-900 bg-white py-2.5 pl-9 pr-3 text-2xl text-stone-900 shadow-[4px_4px_0_0_var(--pixel-shadow)] outline-none placeholder:text-stone-400 dark:border-black dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500"
						/>
					</div>
					<button
						type="button"
						onClick={() => setSortAsc((v) => !v)}
						className="pixel-btn bg-white px-4 py-2.5 font-pixel text-[10px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						title="Sorteren op Nederlands"
					>
						Sort: NL {sortAsc ? "A→Z" : "Z→A"}
					</button>
				</div>
				{query && (
					<div className="mt-3 font-terminal text-xl text-stone-500 dark:text-stone-400">
						{showing} van {total} resultaten voor “{query}”
						{showing === 0 && " — probeer een andere zoekterm"}
					</div>
				)}
			</div>

			{/* Desktop table */}
			<div className="pixel-panel hidden overflow-hidden bg-white sm:block dark:bg-stone-900">
				<table className="w-full text-left text-xl">
					<thead className="bg-stone-900 font-pixel text-[9px] text-lime-300 dark:bg-black dark:text-lime-300">
						<tr>
							<th className="px-4 py-3 w-12">#</th>
							<th className="px-4 py-3">Nederlands</th>
							<th className="px-4 py-3">{header.foreignLabel}</th>
							<th className="px-4 py-3 w-24">Niveau</th>
							<th className="px-4 py-3 w-1/4">Hint / info</th>
						</tr>
					</thead>
					<tbody className="divide-y-2 divide-stone-900/10 dark:divide-stone-700">
						{filtered.map((pair, i) => (
							<tr
								key={pair.key}
								className="hover:bg-amber-50 dark:hover:bg-stone-800"
							>
								<td className="px-4 py-3 font-terminal text-xl text-stone-400 dark:text-stone-500">
									{i + 1}
								</td>
								<td className="px-4 py-3 text-2xl text-stone-900 dark:text-stone-100">
									{pair.nl}
								</td>
								<td className="px-4 py-3 text-2xl text-sky-700 dark:text-sky-300">
									{pair.foreign}
									{speechOK && (
										<SpeakButton text={pair.foreign} lang={audioLang} />
									)}
								</td>
								<td className="px-4 py-3">
									<span
										className={[
											"inline-block border-2 px-2 py-0.5 font-pixel text-[9px]",
											levelOf(pair.key) >= 5
												? "border-emerald-700 bg-emerald-200 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-900 dark:text-emerald-200"
												: levelOf(pair.key) > 0
													? "border-violet-700 bg-violet-200 text-violet-900 dark:border-violet-400 dark:bg-violet-900 dark:text-violet-200"
													: "border-stone-400 bg-stone-200 text-stone-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400",
										].join(" ")}
										title={`Niveau ${levelOf(pair.key)}/5`}
									>
										L{levelOf(pair.key)}/5
									</span>
								</td>
								<td className="px-4 py-3 text-xl text-stone-600 dark:text-stone-400">
									{pair.hint && <span className="italic">{pair.hint}</span>}
									{pair.alternatives && pair.alternatives.length > 0 && (
										<div className="mt-1 text-stone-500 dark:text-stone-400">
											ook: {pair.alternatives.join(", ")}
										</div>
									)}
									{!pair.hint && !pair.alternatives && (
										<span className="text-stone-300 dark:text-stone-600">
											—
										</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filtered.length === 0 && (
					<div className="p-8 text-center text-2xl text-stone-500 dark:text-stone-400">
						Geen woorden gevonden.
					</div>
				)}
			</div>

			{/* Mobile cards */}
			<div className="grid gap-4 sm:hidden">
				{filtered.map((pair, i) => (
					<div
						key={pair.key}
						className="pixel-panel bg-white p-4 dark:bg-stone-900"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="font-pixel text-[9px] text-stone-400 dark:text-stone-500">
								#{i + 1} • NL ↔ {header.foreignShort}
							</div>
							<span className="border-2 border-stone-400 bg-stone-200 px-2 py-0.5 font-pixel text-[9px] text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300">
								L{levelOf(pair.key)}/5
							</span>
						</div>
						<div className="mt-2 grid grid-cols-2 gap-3">
							<div>
								<div className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
									Nederlands
								</div>
								<div className="mt-1 text-2xl text-stone-900 dark:text-stone-100">
									{pair.nl}
								</div>
							</div>
							<div>
								<div className="font-pixel text-[9px] text-sky-600 dark:text-sky-400">
									{header.foreignLabel}
								</div>
								<div className="mt-1 text-2xl text-sky-700 dark:text-sky-300">
									{pair.foreign}
									{speechOK && (
										<SpeakButton text={pair.foreign} lang={audioLang} />
									)}
								</div>
							</div>
						</div>
						{(pair.hint ||
							(pair.alternatives && pair.alternatives.length > 0)) && (
							<div className="mt-3 border-2 border-stone-300 bg-stone-100 px-3 py-2 text-xl text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
								{pair.hint && <div>💡 {pair.hint}</div>}
								{pair.alternatives && pair.alternatives.length > 0 && (
									<div className={pair.hint ? "mt-1" : ""}>
										ook: {pair.alternatives.join(", ")}
									</div>
								)}
							</div>
						)}
					</div>
				))}
				{filtered.length === 0 && (
					<div className="pixel-panel bg-white p-6 text-center text-2xl text-stone-500 dark:bg-stone-900 dark:text-stone-400">
						Geen woorden gevonden.
					</div>
				)}
			</div>

			{hasDeclension && (
				<div className="border-4 border-amber-700 bg-amber-100 p-4 text-xl text-amber-800 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-200">
					ℹ️ Dit hoofdstuk bevat naast woordenschat ook{" "}
					{chapter.exercises.filter((e) => e.type === "declension").length}{" "}
					verbuiging/vervoeging oefeningen — die staan niet in deze lijst.
				</div>
			)}
		</div>
	);
}
