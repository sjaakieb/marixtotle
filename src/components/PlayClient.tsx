"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	applyResult,
	averageLevel,
	buildSession,
	buildTestSession,
	type GeneratedQuestion,
	sessionGrade,
} from "@/lib/levels";
import {
	type ChapterProgress,
	getChapterStats,
	loadChapterProgress,
	pruneChapterProgress,
	resetChapterProgress,
	saveItemLevel,
} from "@/lib/progress";
import type { Chapter, Exercise } from "@/lib/schema";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { getSpeechLang } from "@/lib/speech";
import { getMasteryItems } from "@/lib/words";
import { ExerciseView } from "./ExerciseView";
import { ProgressBar } from "./ProgressBar";

const SESSION_SIZE = 10;

function questionToExercise(
	q: GeneratedQuestion,
	chapter: Chapter,
): { exercise: Exercise; audioLang?: string } {
	if (q.kind === "vocab") {
		const lang = chapter.language ?? "latin";
		const code =
			lang === "french"
				? "fr"
				: lang === "english"
					? "en"
					: lang === "greek"
						? "el"
						: "la";
		// Direction drives toolbars/placeholders: typing the foreign word => nl->xx.
		const isMcqForeignFirst = q.level === 1;
		const isTypeNl = q.level === 3;
		const direction =
			isMcqForeignFirst || isTypeNl
				? (`${code}->nl` as const)
				: (`nl->${code}` as const);
		return {
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
			audioLang: q.audioText ? getSpeechLang(lang) : undefined,
		};
	}
	return {
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
}

export function PlayClient({
	chapter,
	mode = "practice",
}: {
	chapter: Chapter;
	mode?: "practice" | "test";
}) {
	const isTest = mode === "test";
	const items = useMemo(() => getMasteryItems(chapter), [chapter]);
	const [levels, setLevels] = useState<ChapterProgress>({});
	const [loaded, setLoaded] = useState(false);
	const [index, setIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [done, setDone] = useState(false);
	const [results, setResults] = useState<boolean[]>([]);
	const [soundEnabled, setSoundEnabledState] = useState(true);

	useEffect(() => {
		setSoundEnabledState(isSoundEnabled());
		setLevels(loadChapterProgress(chapter.id));
		setLoaded(true);
	}, [chapter.id]);

	// Snapshot levels at session start so the 10 questions are fixed.
	const [sessionStartLevels, setSessionStartLevels] = useState<ChapterProgress>(
		{},
	);
	const [session, setSession] = useState<GeneratedQuestion[]>([]);
	const resetSessionState = useCallback(
		(start: ChapterProgress) => {
			setSessionStartLevels(start);
			setSession(
				isTest
					? buildTestSession(items, SESSION_SIZE)
					: buildSession(items, start, SESSION_SIZE),
			);
			setIndex(0);
			setScore(0);
			setDone(false);
			setResults([]);
		},
		[items, isTest],
	);
	useEffect(() => {
		if (!loaded) return;
		// Drop stored keys for items that no longer exist (content edits),
		// otherwise orphaned levels inflate the mastery % past 100.
		const start = pruneChapterProgress(
			chapter.id,
			items.map((it) => it.key),
		);
		setLevels(start);
		resetSessionState(start);
	}, [loaded, chapter.id, items, resetSessionState]);

	const current = session[index];
	const total = session.length;
	const liveStats = getChapterStats(items, levels);
	const startPct = getChapterStats(items, sessionStartLevels).pct;

	const handleResult = (correct: boolean) => {
		if (!current) return;
		// An exam never changes stored levels — it only reports a grade.
		if (!isTest) {
			const prev = levels[current.itemKey] ?? 0;
			const next = applyResult(prev, correct);
			const updated = saveItemLevel(chapter.id, current.itemKey, next);
			setLevels(updated);
		}
		setResults((r) => [...r, correct]);
		if (correct) setScore((s) => s + 1);
	};

	const handleNext = () => {
		if (index + 1 >= total) {
			setDone(true);
		} else {
			setIndex((i) => i + 1);
		}
	};

	const handleRestart = () => {
		const fresh = loadChapterProgress(chapter.id);
		setLevels(fresh);
		resetSessionState(fresh);
	};

	const handleReset = () => {
		if (
			!window.confirm(
				"Voortgang voor dit hoofdstuk wissen? Alle niveaus terug naar 0.",
			)
		)
			return;
		resetChapterProgress(chapter.id);
		setLevels({});
		resetSessionState({});
	};

	if (!loaded || session.length === 0) {
		if (loaded && !isTest && items.length > 0) {
			return (
				<div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200">
					<div className="text-4xl">🎉</div>
					<h2 className="mt-3 text-2xl font-bold text-stone-900">
						Hoofdstuk beheerst!
					</h2>
					<p className="mt-1 text-stone-600">
						{chapter.title} — alle woorden op niveau 5.
					</p>
					<div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
						<Link
							href={`/test/${chapter.id}`}
							className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
						>
							Toetsen →
						</Link>
						<Link
							href="/"
							className="rounded-xl bg-white px-6 py-3 font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
						>
							Ander hoofdstuk
						</Link>
					</div>
				</div>
			);
		}
		if (loaded && items.length === 0) {
			return (
				<div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200">
					<div className="font-semibold text-stone-700">
						Geen oefenitems in dit hoofdstuk.
					</div>
					<Link
						href="/"
						className="mt-4 inline-block text-sm font-medium text-sky-600 hover:underline"
					>
						← Terug naar overzicht
					</Link>
				</div>
			);
		}
		return (
			<div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center text-sm text-stone-500 ring-1 ring-stone-200">
				Sessie laden…
			</div>
		);
	}

	if (done) {
		const grade = sessionGrade(score, total);
		const avgLevel = averageLevel(session);
		return (
			<div className="mx-auto max-w-xl space-y-6">
				<div className="rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200">
					<div className="text-4xl">
						{grade >= 8 ? "🎉" : grade >= 5.5 ? "💪" : "📚"}
					</div>
					<h2 className="mt-3 text-2xl font-bold text-stone-900">
						{isTest ? "Toets afgerond!" : "Sessie afgerond!"}
					</h2>
					<p className="mt-1 text-stone-600">{chapter.title}</p>
					<div className="mt-6">
						<div className="text-5xl font-extrabold text-sky-600">
							{score} / {total}
						</div>
						<div className="mt-1 text-sm font-medium text-stone-500">
							Cijfer:{" "}
							<span className="font-bold text-stone-800">
								{grade.toFixed(1)}
							</span>
							{" • "}Gem. niveau:{" "}
							<span className="font-bold text-stone-800">
								{avgLevel.toFixed(1)}
							</span>
						</div>
						<div className="mt-4">
							<ProgressBar current={score} total={total} />
						</div>
						{isTest ? (
							<div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
								Toets telt niet mee voor de voortgang — blijf oefenen om alles
								op niveau 5 te houden.
							</div>
						) : (
							<div className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-800 ring-1 ring-violet-200">
								Beheersing hoofdstuk:{" "}
								<span className="font-bold">
									{startPct}% → {liveStats.pct}%
								</span>
								{" • "}
								{liveStats.mastered}/{liveStats.total} op niveau 5
							</div>
						)}
					</div>
					<div className="mt-6 grid grid-cols-10 gap-1.5">
						{results.map((r, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: results is append-only, indices stable for session
								key={i}
								className={[
									"h-2 rounded-full",
									r ? "bg-emerald-500" : "bg-red-400",
								].join(" ")}
								title={r ? "correct" : "fout"}
							/>
						))}
					</div>
					<div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
						<button
							type="button"
							onClick={handleRestart}
							className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
						>
							{isTest ? "Opnieuw toetsen →" : "Volgende →"}
						</button>
						<Link
							href="/"
							className="rounded-xl bg-white px-6 py-3 font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
						>
							Ander hoofdstuk
						</Link>
					</div>
					{!isTest && (
						<button
							type="button"
							onClick={handleReset}
							className="mt-3 text-xs font-medium text-stone-400 hover:text-red-600 hover:underline"
						>
							Voortgang wissen
						</button>
					)}
				</div>
			</div>
		);
	}

	if (!current) return null;
	const { exercise, audioLang } = questionToExercise(current, chapter);

	return (
		<div className="mx-auto max-w-xl space-y-4">
			<div className="flex items-center justify-between gap-4">
				<Link
					href="/"
					className="text-sm font-medium text-stone-500 hover:text-stone-700"
				>
					← Hoofdstukken
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
						className="rounded-full bg-white p-1.5 text-stone-500 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-700"
					>
						<span aria-hidden className="text-sm leading-none">
							{soundEnabled ? "🔊" : "🔇"}
						</span>
					</button>
					<div className="text-sm font-medium text-stone-600">
						{index + 1} / {total} • Score {score}
					</div>
				</div>
			</div>
			<ProgressBar current={index} total={total} />
			<div className="flex items-center justify-between text-xs font-medium text-stone-500">
				{isTest ? (
					<span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-200">
						Toets • L3–L5 • telt niet mee
					</span>
				) : (
					<span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-700 ring-1 ring-violet-200">
						Beheersing: {liveStats.pct}%
					</span>
				)}
				{!isTest && (
					<button
						type="button"
						onClick={handleReset}
						className="hover:text-red-600 hover:underline"
					>
						Reset voortgang
					</button>
				)}
			</div>
			<div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-stone-200">
				<ExerciseView
					key={`${current.itemKey}-L${current.level}-${index}`}
					exercise={exercise}
					onResult={handleResult}
					onNext={handleNext}
					isLast={index + 1 === total}
					language={chapter.language}
					levelBadge={current.badge}
					audioText={current.audioText}
					audioLang={audioLang}
					translation={current.translation}
					hideHint={!current.showHint}
				/>
			</div>
			<div className="text-center text-xs text-stone-400">
				{chapter.language === "french" &&
					"Tip: gebruik de accent-balk voor é è ê ë ç bij Franse antwoorden."}
				{chapter.language === "greek" &&
					"Tip: gebruik de Griekse balk om letters en accenten in te voegen."}
				{chapter.language === "latin" &&
					"Tip: gebruik de macron-balk voor ā ē ī ō ū bij Latijnse antwoorden."}
				{chapter.language === "english" &&
					"Tip: type je antwoord – geen speciale tekens nodig."}
				{!chapter.language && "Tip: gebruik de balk voor speciale tekens."}
			</div>
		</div>
	);
}
