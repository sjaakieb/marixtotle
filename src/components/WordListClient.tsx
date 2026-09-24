"use client";

import { useMemo, useState } from "react";
import type { Chapter, LanguageId } from "@/lib/schema";

type WordPair = {
	nl: string;
	foreign: string;
	hint?: string;
	alternatives?: string[];
	direction: string;
	prompt: string;
	answer: string;
	id: string;
};

function getWordPairs(chapter: Chapter): WordPair[] {
	const pairs: WordPair[] = [];
	for (const ex of chapter.exercises) {
		if (ex.type !== "vocab") continue;
		const isNlToForeign = ex.direction.startsWith("nl->");
		const nl = isNlToForeign ? ex.prompt : ex.answer;
		const foreign = isNlToForeign ? ex.answer : ex.prompt;
		pairs.push({
			nl,
			foreign,
			hint: ex.hint,
			alternatives: ex.alternatives,
			direction: ex.direction,
			prompt: ex.prompt,
			answer: ex.answer,
			id: ex.id,
		});
	}
	return pairs;
}

function dedupePairs(pairs: WordPair[]): WordPair[] {
	const seen = new Map<string, WordPair>();
	for (const p of pairs) {
		const key = `${p.nl.toLowerCase().trim()}::${p.foreign.toLowerCase().trim()}`;
		if (!seen.has(key)) seen.set(key, p);
	}
	return [...seen.values()];
}

const languageHeaders: Record<LanguageId, { foreignLabel: string; foreignShort: string }> = {
	latin: { foreignLabel: "Latijn", foreignShort: "LA" },
	french: { foreignLabel: "Frans", foreignShort: "FR" },
	english: { foreignLabel: "Engels", foreignShort: "EN" },
	greek: { foreignLabel: "Grieks", foreignShort: "EL" },
};

type Props = {
	chapter: Chapter;
};

export function WordListClient({ chapter }: Props) {
	const languageId = (chapter.language ?? "latin") as LanguageId;
	const header = languageHeaders[languageId] ?? languageHeaders.latin;

	const allPairs = useMemo(() => getWordPairs(chapter), [chapter]);
	const uniquePairs = useMemo(() => dedupePairs(allPairs), [allPairs]);

	const [dedupe, setDedupe] = useState(true);
	const [query, setQuery] = useState("");
	const [sortAsc, setSortAsc] = useState(true);

	const base = dedupe ? uniquePairs : allPairs;

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		let list = [...base];
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
	}, [base, query, sortAsc]);

	const total = allPairs.length;
	const uniqueCount = uniquePairs.length;
	const showing = filtered.length;

	const hasDeclension = chapter.exercises.some((e) => e.type === "declension");

	if (total === 0) {
		return (
			<div className="rounded-xl bg-white p-6 text-center ring-1 ring-stone-200">
				<div className="text-sm font-semibold text-stone-700">
					Geen woordenschat in dit hoofdstuk.
				</div>
				{hasDeclension && (
					<div className="mt-1 text-sm text-stone-500">
						Dit hoofdstuk bevat alleen verbuiging/vervoeging oefeningen.
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200 sm:p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2 text-xs font-medium text-stone-600">
						<span className="rounded-full bg-stone-100 px-2.5 py-1">
							{total} oefeningen
						</span>
						{dedupe ? (
							<span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 ring-1 ring-sky-200">
								{uniqueCount} unieke woorden
							</span>
						) : (
							<span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 ring-1 ring-amber-200">
								{uniqueCount} uniek • toont alle {total}
							</span>
						)}
					</div>
					<label className="flex items-center gap-2 text-sm font-medium text-stone-700">
						<input
							type="checkbox"
							checked={dedupe}
							onChange={(e) => setDedupe(e.target.checked)}
							className="h-4 w-4 rounded border-stone-300 text-sky-600 focus:ring-sky-500"
						/>
						Alleen unieke tonen
					</label>
				</div>

				<div className="mt-4 flex flex-col gap-3 sm:flex-row">
					<div className="relative flex-1">
						<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
							🔍
						</span>
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Zoeken (NL of vertaling)…"
							className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
						/>
					</div>
					<button
						type="button"
						onClick={() => setSortAsc((v) => !v)}
						className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
						title="Sorteren op Nederlands"
					>
						Sort: NL {sortAsc ? "A→Z" : "Z→A"}
					</button>
				</div>
				{query && (
					<div className="mt-3 text-xs text-stone-500">
						{showing} van {dedupe ? uniqueCount : total} resultaten voor “{query}”
						{showing === 0 && " — probeer een andere zoekterm"}
					</div>
				)}
			</div>

			{/* Desktop table */}
			<div className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 sm:block">
				<table className="w-full text-left text-sm">
					<thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
						<tr>
							<th className="px-4 py-3 w-12">#</th>
							<th className="px-4 py-3">Nederlands</th>
							<th className="px-4 py-3">{header.foreignLabel}</th>
							<th className="px-4 py-3 w-1/4">Hint / info</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-stone-100">
						{filtered.map((pair, i) => (
							<tr key={`${pair.id}-${i}`} className="hover:bg-stone-50/70">
								<td className="px-4 py-3 text-xs font-medium text-stone-400">{i + 1}</td>
								<td className="px-4 py-3 font-medium text-stone-900">{pair.nl}</td>
								<td className="px-4 py-3 font-medium text-sky-700">{pair.foreign}</td>
								<td className="px-4 py-3 text-stone-600">
									{pair.hint && <span className="text-xs italic">{pair.hint}</span>}
									{pair.alternatives && pair.alternatives.length > 0 && (
										<div className="mt-1 text-xs text-stone-500">
											ook: {pair.alternatives.join(", ")}
										</div>
									)}
									{!pair.hint && !pair.alternatives && <span className="text-stone-300">—</span>}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filtered.length === 0 && (
					<div className="p-8 text-center text-sm text-stone-500">Geen woorden gevonden.</div>
				)}
			</div>

			{/* Mobile cards */}
			<div className="grid gap-3 sm:hidden">
				{filtered.map((pair, i) => (
					<div
						key={`${pair.id}-${i}-m`}
						className="rounded-xl bg-white p-4 ring-1 ring-stone-200"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="text-xs font-semibold uppercase tracking-wide text-stone-400">
								#{i + 1} • {pair.direction.toUpperCase()}
							</div>
						</div>
						<div className="mt-2 grid grid-cols-2 gap-3">
							<div>
								<div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
									Nederlands
								</div>
								<div className="mt-1 text-sm font-semibold text-stone-900">{pair.nl}</div>
							</div>
							<div>
								<div className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">
									{header.foreignLabel}
								</div>
								<div className="mt-1 text-sm font-semibold text-sky-700">{pair.foreign}</div>
							</div>
						</div>
						{(pair.hint || (pair.alternatives && pair.alternatives.length > 0)) && (
							<div className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600 ring-1 ring-stone-100">
								{pair.hint && <div>💡 {pair.hint}</div>}
								{pair.alternatives && pair.alternatives.length > 0 && (
									<div className={pair.hint ? "mt-1" : ""}>ook: {pair.alternatives.join(", ")}</div>
								)}
							</div>
						)}
					</div>
				))}
				{filtered.length === 0 && (
					<div className="rounded-xl bg-white p-6 text-center text-sm text-stone-500 ring-1 ring-stone-200">
						Geen woorden gevonden.
					</div>
				)}
			</div>

			{hasDeclension && (
				<div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-800 ring-1 ring-amber-200">
					ℹ️ Dit hoofdstuk bevat naast woordenschat ook {chapter.exercises.filter((e) => e.type === "declension").length} verbuiging/vervoeging oefeningen — die staan niet in deze lijst.
				</div>
			)}
		</div>
	);
}
