"use client";

import { useMemo, useRef, useState } from "react";
import { insertAtCursor, toggleMacronBeforeCursor } from "@/lib/macron";
import {
	detectWrongLanguage,
	gradeExercise,
	isExerciseCorrect,
	normalize,
} from "@/lib/matcher";
import type { Exercise, LanguageId } from "@/lib/schema";
import {
	getLanguageFromDirection,
	needsDiacriticsToolbar,
	needsMacronToolbar,
} from "@/lib/schema";
import { playFail, playSuccess } from "@/lib/sounds";
import { getSpeechLang, isSpeechSupported, speak } from "@/lib/speech";
import { LanguageToolbar } from "./LanguageToolbar";
import { MacronToolbar } from "./MacronToolbar";
import { ReportButton, type ReportContext } from "./ReportButton";

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

type Props = {
	exercise: Exercise;
	onResult: (correct: boolean) => void;
	onNext: () => void;
	isLast: boolean;
	language?: LanguageId;
	/** e.g. "L2/5 • NL → FR • meerkeuze" — shown when quizzing via mastery engine */
	levelBadge?: string;
	/** when set, prompt is an audio question: play this text via speech synthesis */
	audioText?: string;
	audioLang?: string;
	/** Dutch meaning, revealed after answering an audio question */
	translation?: string;
	/** declension L5 hides the hint for a bare recall test */
	hideHint?: boolean;
	/** when set, show a "report inaccuracy" button after answering */
	report?: Omit<ReportContext, "userInput">;
};

export function ExerciseView({
	exercise,
	onResult,
	onNext,
	isLast,
	language,
	levelBadge,
	audioText,
	audioLang,
	translation,
	hideHint,
	report,
}: Props) {
	const isMCQ = !!exercise.options && exercise.options.length > 0;
	return isMCQ ? (
		<MultipleChoiceExercise
			exercise={exercise}
			onResult={onResult}
			onNext={onNext}
			isLast={isLast}
			language={language}
			levelBadge={levelBadge}
			audioText={audioText}
			audioLang={audioLang}
			hideHint={hideHint}
			report={report}
		/>
	) : (
		<TextInputExercise
			exercise={exercise}
			onResult={onResult}
			onNext={onNext}
			isLast={isLast}
			language={language}
			levelBadge={levelBadge}
			audioText={audioText}
			audioLang={audioLang}
			translation={translation}
			hideHint={hideHint}
			report={report}
		/>
	);
}

function MultipleChoiceExercise({
	exercise,
	onResult,
	onNext,
	isLast,
	levelBadge,
	audioText,
	audioLang,
	hideHint,
	report,
}: Props) {
	const [selected, setSelected] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const shuffledOptions = useMemo(
		() => shuffle(exercise.options ?? []),
		[exercise.options],
	);
	const correct =
		selected != null ? isExerciseCorrect(selected, exercise) : false;
	const isAlternative =
		submitted &&
		correct &&
		selected != null &&
		normalize(selected) !== normalize(exercise.answer);

	const handleSubmit = () => {
		if (selected == null || submitted) return;
		setSubmitted(true);
		onResult(correct);
		if (correct) playSuccess();
		else playFail();
	};

	const handleNext = () => {
		setSelected(null);
		setSubmitted(false);
		onNext();
	};

	return (
		<div className="space-y-4">
			<ExerciseHeader
				exercise={exercise}
				levelBadge={levelBadge}
				audioText={audioText}
				audioLang={audioLang}
			/>
			<div className="grid gap-2">
				{shuffledOptions.map((opt) => {
					const isSelected = selected === opt;
					const showCorrect = submitted && opt === exercise.answer;
					const showWrong = submitted && isSelected && !correct;
					return (
						<button
							key={opt}
							type="button"
							disabled={submitted}
							onClick={() => !submitted && setSelected(opt)}
							className={[
								"pixel-btn w-full px-4 py-3 text-left text-2xl leading-tight",
								!submitted && isSelected
									? "bg-sky-200 text-stone-900 dark:bg-sky-800 dark:text-stone-50"
									: !submitted
										? "bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100"
										: showCorrect
											? "bg-emerald-200 text-stone-900 dark:bg-emerald-800 dark:text-stone-50"
											: showWrong
												? "bg-red-200 text-stone-900 dark:bg-red-900 dark:text-stone-50"
												: "bg-white text-stone-900 opacity-60 dark:bg-stone-900 dark:text-stone-100",
							].join(" ")}
						>
							{opt}
							{showCorrect && (
								<span className="ml-2 text-emerald-600 dark:text-emerald-400">
									✓
								</span>
							)}
							{showWrong && (
								<span className="ml-2 text-red-600 dark:text-red-400">✗</span>
							)}
						</button>
					);
				})}
			</div>
			{!submitted ? (
				<button
					type="button"
					onClick={handleSubmit}
					disabled={selected == null}
					className="pixel-btn w-full bg-sky-600 px-6 py-4 font-pixel text-[11px] text-white hover:bg-sky-500 disabled:opacity-40"
				>
					▶ Controleren
				</button>
			) : (
				<Feedback
					correct={correct}
					answer={exercise.answer}
					hint={hideHint ? undefined : exercise.hint}
					isLast={isLast}
					onNext={handleNext}
					isAlternative={isAlternative}
					userInput={selected ?? undefined}
				/>
			)}
			{submitted && report && (
				<ReportButton
					report={{ ...report, userInput: selected ?? undefined }}
				/>
			)}
		</div>
	);
}

function TextInputExercise({
	exercise,
	onResult,
	onNext,
	isLast,
	language,
	levelBadge,
	audioText,
	audioLang,
	translation,
	hideHint,
	report,
}: Props) {
	const [value, setValue] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const inferredLanguage =
		language ??
		(exercise.type === "vocab"
			? getLanguageFromDirection(exercise.direction)
			: undefined) ??
		"latin";
	const needsMacronLegacy = needsMacronToolbar(exercise);
	const needsDiacritics = needsDiacriticsToolbar(exercise, inferredLanguage);
	// For latin we keep classic MacronToolbar (with toggle), for others use LanguageToolbar
	const showLanguageToolbar = needsDiacritics && inferredLanguage !== "latin";
	const showMacronToolbar = needsMacronLegacy && inferredLanguage === "latin";
	const effectiveLanguage: LanguageId =
		(inferredLanguage as LanguageId) ?? "latin";
	const grade = gradeExercise(value, exercise);
	const correct = grade !== "wrong";
	const isTypo = submitted && grade === "typo";
	// Wrong language? Explain instead of a bare "Niet correct" (e.g. typed
	// the Dutch meaning on a listening question, or copied the prompt).
	const wrongLanguage =
		submitted && !correct
			? detectWrongLanguage(value, exercise, translation, exercise.prompt)
			: undefined;
	const wantsForeign =
		exercise.type !== "vocab" || exercise.direction.startsWith("nl->");
	let wrongLanguageHint: string | undefined;
	if (wrongLanguage === "typed-translation") {
		wrongLanguageHint = `Dat is de Nederlandse betekenis — type het ${getLanguageLabel(effectiveLanguage)} woord dat je hoort.`;
	} else if (wrongLanguage === "copied-prompt") {
		wrongLanguageHint = wantsForeign
			? `Je typte de vraag over — type het ${getLanguageLabel(effectiveLanguage)} woord.`
			: "Je typte de vraag over — type de Nederlandse vertaling.";
	}
	const isAlternative =
		submitted && correct && normalize(value) !== normalize(exercise.answer);

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (submitted || value.trim() === "") return;
		setSubmitted(true);
		onResult(correct);
		if (correct) playSuccess();
		else playFail();
	};

	const handleNext = () => {
		setValue("");
		setSubmitted(false);
		onNext();
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const handleInsert = (char: string) => {
		const el = inputRef.current;
		if (!el) {
			setValue((v) => v + char);
			return;
		}
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const { value: newVal, cursor } = insertAtCursor(value, start, end, char);
		setValue(newVal);
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(cursor, cursor);
		});
	};

	const handleToggle = () => {
		const el = inputRef.current;
		const cursor = el?.selectionStart ?? value.length;
		const res = toggleMacronBeforeCursor(value, cursor);
		if (!res) return;
		setValue(res.value);
		requestAnimationFrame(() => {
			el?.focus();
			el?.setSelectionRange(res.cursor, res.cursor);
		});
	};

	return (
		<div className="space-y-4">
			<ExerciseHeader
				exercise={exercise}
				levelBadge={levelBadge}
				audioText={audioText}
				audioLang={audioLang}
			/>
			<form onSubmit={handleSubmit} className="space-y-3">
				<input
					ref={inputRef}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					disabled={submitted}
					placeholder={
						exercise.type === "vocab" && exercise.direction.startsWith("nl->")
							? `Type het ${getLanguageLabel(effectiveLanguage)} woord…`
							: exercise.type === "vocab"
								? "Type de Nederlandse vertaling…"
								: "Type het antwoord…"
					}
					// biome-ignore lint/a11y/noAutofocus: intentional - focus input for fast drill input
					autoFocus
					autoComplete="off"
					autoCapitalize="off"
					spellCheck={false}
					className={[
						"w-full border-[3px] border-stone-900 bg-white px-4 py-3 text-2xl text-stone-900 caret-sky-600 shadow-[4px_4px_0_0_var(--pixel-shadow)] outline-none placeholder:text-stone-400 disabled:opacity-100 dark:border-black dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500",
						submitted
							? correct
								? "bg-emerald-100 dark:bg-emerald-950"
								: "bg-red-100 dark:bg-red-950"
							: "focus:bg-amber-50 dark:focus:bg-stone-900",
					].join(" ")}
				/>
				{showMacronToolbar && !submitted && (
					<MacronToolbar
						onInsert={handleInsert}
						onToggle={handleToggle}
						showToggle
					/>
				)}
				{showLanguageToolbar && !submitted && (
					<LanguageToolbar
						language={effectiveLanguage}
						onInsert={handleInsert}
						onToggle={handleToggle}
						showToggle={effectiveLanguage === "latin"}
					/>
				)}
				{!submitted ? (
					<button
						type="submit"
						disabled={value.trim() === ""}
						className="pixel-btn w-full bg-sky-600 px-6 py-4 font-pixel text-[11px] text-white hover:bg-sky-500 disabled:opacity-40"
					>
						▶ Controleren
					</button>
				) : (
					<Feedback
						correct={correct}
						answer={exercise.answer}
						hint={hideHint ? undefined : exercise.hint}
						isLast={isLast}
						onNext={handleNext}
						isAlternative={isAlternative}
						isTypo={isTypo}
						translation={translation}
						wrongLanguageHint={wrongLanguageHint}
						userInput={value}
					/>
				)}
				{submitted && report && (
					<ReportButton report={{ ...report, userInput: value }} />
				)}
			</form>
		</div>
	);
}

function getLanguageLabel(lang: LanguageId): string {
	switch (lang) {
		case "latin":
			return "Latijnse";
		case "french":
			return "Franse";
		case "english":
			return "Engelse";
		case "greek":
			return "Griekse";
		default:
			return "";
	}
}

function formatDirection(direction: string): string {
	const map: Record<string, string> = {
		"nl->la": "NL → LA",
		"la->nl": "LA → NL",
		"nl->fr": "NL → FR",
		"fr->nl": "FR → NL",
		"nl->en": "NL → EN",
		"en->nl": "EN → NL",
		"nl->el": "NL → EL",
		"el->nl": "EL → NL",
	};
	return map[direction] ?? direction.toUpperCase();
}

function ExerciseHeader({
	exercise,
	levelBadge,
	audioText,
	audioLang,
}: {
	exercise: Exercise;
	levelBadge?: string;
	audioText?: string;
	audioLang?: string;
}) {
	const typeLabel =
		exercise.type === "vocab"
			? `Woordenschat • ${formatDirection(exercise.direction)}`
			: "Verbuiging / Vervoeging";

	const lang: LanguageId =
		exercise.type === "vocab"
			? ((getLanguageFromDirection(exercise.direction) ??
					"latin") as LanguageId)
			: "latin";
	const speechLang = audioLang ?? getSpeechLang(lang);
	const canSpeak = !!audioText && isSpeechSupported();

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center gap-2">
				<div className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
					{typeLabel}
				</div>
				{levelBadge && (
					<span className="border-2 border-violet-700 bg-violet-200 px-2 py-0.5 font-pixel text-[9px] text-violet-900 dark:border-violet-400 dark:bg-violet-900 dark:text-violet-200">
						{levelBadge}
					</span>
				)}
			</div>
			<div className="pixel-screen p-4">
				<div className="text-3xl leading-tight">
					<span className="mr-2 text-lime-600 dark:text-lime-500">❯</span>
					{exercise.prompt}
					<span className="animate-pixel-blink">▌</span>
				</div>
				{canSpeak && (
					<button
						type="button"
						onClick={() => speak(audioText as string, speechLang)}
						className="pixel-btn mt-3 inline-flex items-center gap-2 bg-violet-600 px-4 py-2.5 font-pixel text-[10px] text-white hover:bg-violet-500"
					>
						<span aria-hidden>🔊</span> Beluister
					</button>
				)}
				{exercise.type === "declension" && exercise.lemma && (
					<div className="mt-2 text-2xl opacity-80">{exercise.lemma}</div>
				)}
				{exercise.type === "declension" && exercise.form && (
					<div className="mt-2 inline-block border-2 border-amber-500 bg-amber-900 px-2 py-1 font-pixel text-[9px] text-amber-300">
						{exercise.form}
					</div>
				)}
			</div>
		</div>
	);
}

function Feedback({
	correct,
	answer,
	hint,
	isLast,
	onNext,
	isAlternative,
	isTypo,
	translation,
	wrongLanguageHint,
	userInput,
}: {
	correct: boolean;
	answer: string;
	hint?: string;
	isLast: boolean;
	onNext: () => void;
	isAlternative?: boolean;
	isTypo?: boolean;
	translation?: string;
	wrongLanguageHint?: string;
	userInput?: string;
}) {
	return (
		<div
			className={[
				"border-4 p-4 shadow-[4px_4px_0_0_var(--pixel-shadow)]",
				correct
					? "border-emerald-700 bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-950"
					: "border-red-700 bg-red-100 dark:border-red-400 dark:bg-red-950",
			].join(" ")}
		>
			<div
				className={
					correct
						? "font-pixel text-[11px] text-emerald-800 dark:text-emerald-300"
						: "font-pixel text-[11px] text-red-800 dark:text-red-300"
				}
			>
				{correct ? "★ Correct! +100" : "✗ Niet correct"}
			</div>
			{correct && isTypo && (
				<div className="mt-2 text-xl text-amber-700 dark:text-amber-300">
					Let op, typfoutje
					{userInput ? (
						<>
							: <span className="font-bold">“{userInput}”</span> →{" "}
						</>
					) : (
						": "
					)}
					<span className="font-bold">{answer}</span>
				</div>
			)}
			{correct && isAlternative && userInput && (
				<div className="mt-2 text-xl text-emerald-700 dark:text-emerald-300">
					Jouw antwoord <span className="font-bold">“{userInput}”</span> is ook
					correct. Volledig antwoord:{" "}
					<span className="font-bold">{answer}</span>
				</div>
			)}
			{!correct && (
				<div className="mt-2 text-xl text-stone-700 dark:text-stone-300">
					Correct antwoord: <span className="font-bold">{answer}</span>
				</div>
			)}
			{!correct && wrongLanguageHint && (
				<div className="mt-2 text-xl font-bold text-amber-700 dark:text-amber-300">
					⚠️ {wrongLanguageHint}
				</div>
			)}
			{translation && (
				<div className="mt-2 text-xl text-stone-600 dark:text-stone-400">
					Betekenis: <span className="font-bold">{translation}</span>
				</div>
			)}
			{hint && (
				<div className="mt-2 text-xl text-stone-600 dark:text-stone-400">
					💡 {hint}
				</div>
			)}
			<button
				type="button"
				onClick={onNext}
				// biome-ignore lint/a11y/noAutofocus: intentional - focus next button to allow Enter to continue
				autoFocus
				className={[
					"pixel-btn mt-4 w-full px-6 py-3 font-pixel text-[11px] text-white",
					correct
						? "bg-emerald-600 hover:bg-emerald-500"
						: "bg-sky-600 hover:bg-sky-500",
				].join(" ")}
			>
				{isLast ? "Bekijk resultaat →" : "Volgende →"}
			</button>
		</div>
	);
}
