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
			className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm text-stone-400 ring-1 ring-transparent transition hover:bg-violet-50 hover:text-violet-700 hover:ring-violet-200 active:scale-95 dark:text-stone-500 dark:hover:bg-violet-950/60 dark:hover:text-violet-300 dark:hover:ring-violet-800"
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
			<div className="rounded-xl bg-white p-6 text-center ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
				<div className="text-sm font-semibold text-stone-700 dark:text-stone-200">
					Geen woordenschat in dit hoofdstuk.
				</div>
				{hasDeclension && (
					<div className="mt-1 text-sm text-stone-500 dark:text-stone-400">
						Dit hoofdstuk bevat alleen verbuiging/vervoeging oefeningen.
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200 sm:p-5 dark:bg-stone-900 dark:ring-stone-800">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-400">
						<span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800">
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
							className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500"
						/>
					</div>
					<button
						type="button"
						onClick={() => setSortAsc((v) => !v)}
						className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
						title="Sorteren op Nederlands"
					>
						Sort: NL {sortAsc ? "A→Z" : "Z→A"}
					</button>
				</div>
				{query && (
					<div className="mt-3 text-xs text-stone-500 dark:text-stone-400">
						{showing} van {total} resultaten voor “{query}”
						{showing === 0 && " — probeer een andere zoekterm"}
					</div>
				)}
			</div>

			{/* Desktop table */}
			<div className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 sm:block dark:bg-stone-900 dark:ring-stone-800">
				<table className="w-full text-left text-sm">
					<thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400">
						<tr>
							<th className="px-4 py-3 w-12">#</th>
							<th className="px-4 py-3">Nederlands</th>
							<th className="px-4 py-3">{header.foreignLabel}</th>
							<th className="px-4 py-3 w-24">Niveau</th>
							<th className="px-4 py-3 w-1/4">Hint / info</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-stone-100 dark:divide-stone-800">
						{filtered.map((pair, i) => (
							<tr
								key={pair.key}
								className="hover:bg-stone-50/70 dark:hover:bg-stone-800/60"
							>
								<td className="px-4 py-3 text-xs font-medium text-stone-400 dark:text-stone-500">
									{i + 1}
								</td>
								<td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
									{pair.nl}
								</td>
								<td className="px-4 py-3 font-medium text-sky-700 dark:text-sky-300">
									{pair.foreign}
									{speechOK && (
										<SpeakButton text={pair.foreign} lang={audioLang} />
									)}
								</td>
								<td className="px-4 py-3">
									<span
										className={[
											"inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ring-1",
											levelOf(pair.key) >= 5
												? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800"
												: levelOf(pair.key) > 0
													? "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-800"
													: "bg-stone-100 text-stone-400 ring-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-700",
										].join(" ")}
										title={`Niveau ${levelOf(pair.key)}/5`}
									>
										L{levelOf(pair.key)}/5
									</span>
								</td>
								<td className="px-4 py-3 text-stone-600 dark:text-stone-400">
									{pair.hint && (
										<span className="text-xs italic">{pair.hint}</span>
									)}
									{pair.alternatives && pair.alternatives.length > 0 && (
										<div className="mt-1 text-xs text-stone-500 dark:text-stone-400">
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
					<div className="p-8 text-center text-sm text-stone-500 dark:text-stone-400">
						Geen woorden gevonden.
					</div>
				)}
			</div>

			{/* Mobile cards */}
			<div className="grid gap-3 sm:hidden">
				{filtered.map((pair, i) => (
					<div
						key={pair.key}
						className="rounded-xl bg-white p-4 ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
								#{i + 1} • NL ↔ {header.foreignShort}
							</div>
							<span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-500 dark:bg-stone-800 dark:text-stone-300">
								L{levelOf(pair.key)}/5
							</span>
						</div>
						<div className="mt-2 grid grid-cols-2 gap-3">
							<div>
								<div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
									Nederlands
								</div>
								<div className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
									{pair.nl}
								</div>
							</div>
							<div>
								<div className="text-[11px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
									{header.foreignLabel}
								</div>
								<div className="mt-1 text-sm font-semibold text-sky-700 dark:text-sky-300">
									{pair.foreign}
									{speechOK && (
										<SpeakButton text={pair.foreign} lang={audioLang} />
									)}
								</div>
							</div>
						</div>
						{(pair.hint ||
							(pair.alternatives && pair.alternatives.length > 0)) && (
							<div className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600 ring-1 ring-stone-100 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700">
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
					<div className="rounded-xl bg-white p-6 text-center text-sm text-stone-500 ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:ring-stone-800">
						Geen woorden gevonden.
					</div>
				)}
			</div>

			{hasDeclension && (
				<div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800">
					ℹ️ Dit hoofdstuk bevat naast woordenschat ook{" "}
					{chapter.exercises.filter((e) => e.type === "declension").length}{" "}
					verbuiging/vervoeging oefeningen — die staan niet in deze lijst.
				</div>
			)}
		</div>
	);
}
