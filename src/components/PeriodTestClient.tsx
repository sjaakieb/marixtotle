"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PERIOD_TEST_SIZE, type Period } from "@/content/curriculum";
import {
	averageLevel,
	buildPeriodTestSession,
	type GeneratedQuestion,
	sessionGrade,
} from "@/lib/levels";
import type { Chapter, Exercise, LanguageId } from "@/lib/schema";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { getSpeechLang } from "@/lib/speech";
import { getMasteryItems, type MasteryItem } from "@/lib/words";
import { ExerciseView } from "./ExerciseView";
import { ProgressBar } from "./ProgressBar";

type Props = {
	period: Period;
	chapters: Chapter[];
	/** Vak waar deze toets over gaat (vlag + label voor weergave). */
	subject: { id: string; label: string; flag: string };
};

type ItemSource = {
	language: LanguageId;
	chapterId: string;
};

function langCode(lang: LanguageId): "fr" | "en" | "el" | "la" {
	switch (lang) {
		case "french":
			return "fr";
		case "english":
			return "en";
		case "greek":
			return "el";
		default:
			return "la";
	}
}

const TIPS: Record<string, string> = {
	french: "Tip: gebruik de accent-balk voor é è ê ë ç bij Franse antwoorden.",
	greek: "Tip: gebruik de Griekse balk om letters en accenten in te voegen.",
	latin: "Tip: gebruik de macron-balk voor ā ē ī ō ū bij Latijnse antwoorden.",
	english: "Tip: type je antwoord – geen speciale tekens nodig.",
	dutch: "Tip: let op d/t, sterke werkwoorden en voltooide deelwoorden.",
	topo: "Tip: accenten mag je weglaten (Cairo voor Caïro) – één tikfoutje mag.",
};

export function PeriodTestClient({ period, chapters, subject }: Props) {
	const { allItems, sources, topoSrc, geoDots } = useMemo(() => {
		const seen = new Set<string>();
		const all: MasteryItem[] = [];
		const srcs = new Map<string, ItemSource>();
		const topo = new Map<
			string,
			{ country: string; capitals: string[]; lat: number; lon: number }
		>();
		for (const ch of chapters) {
			const lang = (ch.language ?? "latin") as LanguageId;
			for (const ex of ch.exercises) {
				if (ex.type === "topo" && !topo.has(ex.id)) {
					topo.set(ex.id, {
						country: ex.country,
						capitals: [...ex.capitals],
						lat: ex.lat,
						lon: ex.lon,
					});
				}
			}
			for (const it of getMasteryItems(ch)) {
				if (!srcs.has(it.key)) {
					srcs.set(it.key, { language: lang, chapterId: ch.id });
				}
				if (seen.has(it.key)) continue;
				seen.add(it.key);
				all.push(it);
			}
		}
		return {
			allItems: all,
			sources: srcs,
			topoSrc: topo,
			geoDots: all.flatMap((it) =>
				it.kind === "topo" ? [{ lat: it.lat, lon: it.lon }] : [],
			),
		};
	}, [chapters]);

	const [session, setSession] = useState<GeneratedQuestion[]>(() =>
		buildPeriodTestSession(allItems, PERIOD_TEST_SIZE),
	);
	const [index, setIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [done, setDone] = useState(false);
	const [results, setResults] = useState<boolean[]>([]);
	const [soundEnabled, setSoundEnabledState] = useState(() => isSoundEnabled());

	const buildExercise = (
		q: GeneratedQuestion,
	): { exercise: Exercise; language: LanguageId; audioLang?: string } => {
		const src = sources.get(q.itemKey);
		// Per-item language: vocab keys are namespaced by language, decl/topo
		// items resolve via the source chapter (first chapter wins on dupes).
		const language: LanguageId = src?.language ?? "latin";
		if (q.kind === "vocab") {
			const code = langCode(language);
			const isMcqForeignFirst = q.level === 1;
			const isTypeNl = q.level === 3;
			const direction =
				isMcqForeignFirst || isTypeNl
					? (`${code}->nl` as const)
					: (`nl->${code}` as const);
			return {
				language,
				exercise: {
					id: `${q.itemKey}-L${q.level}`,
					type: "vocab",
					prompt: q.prompt,
					answer: q.answer,
					alternatives: q.alternatives.length > 0 ? q.alternatives : undefined,
					wrongAnswers: q.wrongAnswers.length > 0 ? q.wrongAnswers : undefined,
					direction,
					hint: q.showHint ? q.hint : undefined,
					options: q.options,
				},
				audioLang: q.audioText ? getSpeechLang(language) : undefined,
			};
		}
		if (q.kind === "topo") {
			const srcEx = topoSrc.get(q.itemKey);
			return {
				language,
				exercise: {
					id: `${q.itemKey}-L${q.level}`,
					type: "topo",
					country: srcEx?.country ?? q.answer,
					capitals:
						srcEx?.capitals ?? (q.topoAsk === "capital" ? [q.answer] : []),
					lat: q.lat ?? srcEx?.lat ?? 0,
					lon: q.lon ?? srcEx?.lon ?? 0,
					ask: q.topoAsk ?? "capital",
					prompt: q.prompt,
					answer: q.answer,
					alternatives: q.alternatives.length > 0 ? q.alternatives : undefined,
					hint: q.showHint ? q.hint : undefined,
					options: q.options,
				},
			};
		}
		return {
			language,
			exercise: {
				id: q.itemKey,
				type: "declension",
				prompt: q.prompt,
				lemma: q.lemma,
				form: q.form,
				answer: q.answer,
				alternatives: q.alternatives.length > 0 ? q.alternatives : undefined,
				wrongAnswers: q.wrongAnswers.length > 0 ? q.wrongAnswers : undefined,
				hint: q.showHint ? q.hint : undefined,
				options: q.options,
			},
		};
	};

	const handleResult = (correct: boolean) => {
		if (!session[index]) return;
		// A period test never changes stored progress — it only reports a grade.
		setResults((r) => [...r, correct]);
		if (correct) setScore((s) => s + 1);
	};

	const handleNext = () => {
		if (index + 1 >= session.length) {
			setDone(true);
		} else {
			setIndex((i) => i + 1);
		}
	};

	const handleRestart = () => {
		setSession(buildPeriodTestSession(allItems, PERIOD_TEST_SIZE));
		setIndex(0);
		setScore(0);
		setDone(false);
		setResults([]);
	};

	if (allItems.length === 0) {
		return (
			<div className="pixel-panel mx-auto max-w-xl bg-white p-8 text-center dark:bg-stone-900">
				<div className="text-2xl text-stone-700 dark:text-stone-200">
					Nog geen opdrachten in {period.title} ({subject.label}).
				</div>
				<Link
					href={`/period/${period.id}/${subject.id}`}
					className="mt-4 inline-block text-2xl text-sky-600 hover:underline"
				>
					← Terug naar onderwerpen
				</Link>
			</div>
		);
	}

	if (done) {
		const grade = sessionGrade(score, session.length);
		const avgLevel = averageLevel(session);
		const perLevel = [1, 2, 3, 4, 5].map((lv) => {
			const idxs = session
				.map((q, i) => ({ q, i }))
				.filter(({ q }) => q.level === lv);
			const correct = idxs.filter(({ i }) => results[i]).length;
			return { level: lv, correct, total: idxs.length };
		});
		return (
			<div className="mx-auto max-w-xl space-y-6">
				<div className="pixel-panel bg-white p-8 text-center dark:bg-stone-900">
					<div className="text-4xl">
						{grade >= 8 ? "🏆" : grade >= 5.5 ? "💪" : "📚"}
					</div>
					<h2 className="mt-4 font-pixel text-sm leading-relaxed text-stone-900 dark:text-stone-50">
						★ Periode-toets afgerond! ★
					</h2>
					<p className="mt-2 text-2xl text-stone-600 dark:text-stone-400">
						{period.title} • {subject.flag} {subject.label} •{" "}
						{chapters.length} opdrachten
					</p>
					<div className="mt-6">
						<div className="font-pixel text-2xl text-sky-600 dark:text-sky-400">
							{score}/{session.length}
						</div>
						<div className="mt-3 text-2xl text-stone-500 dark:text-stone-400">
							Cijfer:{" "}
							<span className="font-bold text-stone-800 dark:text-stone-100">
								{grade.toFixed(1)}
							</span>
							{" • "}Gem. niveau:{" "}
							<span className="font-bold text-stone-800 dark:text-stone-100">
								{avgLevel.toFixed(1)}
							</span>
						</div>
						<div className="mt-4 grid grid-cols-5 gap-1.5">
							{perLevel.map(({ level, correct, total }) => (
								<div
									key={level}
									className="border-2 border-stone-900 bg-stone-100 px-1 py-2 dark:border-black dark:bg-stone-800"
									title={`Niveau ${level}: ${correct}/${total} goed`}
								>
									<div className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
										L{level}
									</div>
									<div className="font-terminal text-xl text-stone-800 dark:text-stone-100">
										{correct}/{total}
									</div>
								</div>
							))}
						</div>
						<div className="mt-4">
							<ProgressBar current={score} total={session.length} />
						</div>
						<div className="mt-4 border-4 border-amber-700 bg-amber-100 p-3 text-xl text-amber-800 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-200">
							Toets telt niet mee voor de voortgang — blijf oefenen om alles op
							niveau 5 te houden.
						</div>
					</div>
					<div className="mt-6 grid grid-cols-10 gap-1.5">
						{results.map((r, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: results is append-only, indices stable for session
								key={i}
								className={[
									"h-3 border-2 border-stone-900 dark:border-black",
									r ? "bg-emerald-500" : "bg-red-400",
								].join(" ")}
								title={r ? "correct" : "fout"}
							/>
						))}
					</div>
					<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
						<button
							type="button"
							onClick={handleRestart}
							className="pixel-btn bg-sky-600 px-6 py-3 font-pixel text-[11px] text-white hover:bg-sky-500"
						>
							Opnieuw toetsen →
						</button>
						<Link
							href={`/period/${period.id}/${subject.id}`}
							className="pixel-btn bg-white px-6 py-3 font-pixel text-[11px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							Ander onderwerp
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const current = session[index];
	if (!current) return null;
	const { exercise, language, audioLang } = buildExercise(current);
	const strict = language === "dutch";

	return (
		<div className="mx-auto max-w-xl space-y-4">
			<div className="flex items-center justify-between gap-4">
				<Link
					href={`/period/${period.id}/${subject.id}`}
					className="text-2xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
				>
					← Onderwerpen
				</Link>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => {
							const next = !soundEnabled;
							setSoundEnabled(next);
							setSoundEnabledState(next);
						}}
						aria-label={soundEnabled ? "Geluid uit" : "Geluid aan"}
						title={soundEnabled ? "Geluid uit" : "Geluid aan"}
						className="pixel-btn bg-white p-1.5 text-stone-500 dark:bg-stone-800 dark:text-stone-300"
					>
						<span aria-hidden className="text-sm leading-none">
							{soundEnabled ? "🔊" : "🔇"}
						</span>
					</button>
					<div className="font-pixel text-[10px] text-stone-600 dark:text-stone-400">
						{index + 1}/{session.length} • Score {score}
					</div>
				</div>
			</div>
			<ProgressBar current={index} total={session.length} />
			<div className="flex items-center justify-between font-terminal text-xl text-stone-500 dark:text-stone-400">
				<span className="border-2 border-amber-700 bg-amber-100 px-2 py-0.5 text-amber-800 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-200">
					Periode-toets • L1–L5 • telt niet mee
				</span>
			</div>
			<div className="pixel-panel bg-white p-5 sm:p-6 dark:bg-stone-900">
				<ExerciseView
					key={`${current.itemKey}-L${current.level}-${index}`}
					exercise={exercise}
					onResult={handleResult}
					onNext={handleNext}
					isLast={index + 1 === session.length}
					language={language}
					levelBadge={current.badge}
					audioText={current.audioText}
					audioLang={audioLang}
					translation={current.translation}
					hideHint={!current.showHint}
					strict={strict}
					geo={
						current.kind === "topo" &&
						current.lat != null &&
						current.lon != null
							? { lat: current.lat, lon: current.lon }
							: undefined
					}
					geoDots={geoDots}
					geoShowDot={current.topoAsk === "country"}
					report={{
						chapterId: `period-${period.id}-${subject.id}`,
						itemKey: current.itemKey,
						exerciseId: exercise.id,
						level: current.level,
						prompt: exercise.prompt,
						answer: exercise.answer,
					}}
				/>
			</div>
			<div className="text-center font-terminal text-xl text-stone-400 dark:text-stone-500">
				{TIPS[language] ?? "Tip: gebruik de balk voor speciale tekens."}
				{strict && " Elke letter telt."}
			</div>
		</div>
	);
}
