"use client";

import { useMemo, useRef, useState } from "react";
import { insertAtCursor, toggleMacronBeforeCursor } from "@/lib/macron";
import { isExerciseCorrect, normalize } from "@/lib/matcher";
import type { Exercise, LanguageId } from "@/lib/schema";
import {
	getLanguageFromDirection,
	needsDiacriticsToolbar,
	needsMacronToolbar,
} from "@/lib/schema";
import { LanguageToolbar } from "./LanguageToolbar";
import { MacronToolbar } from "./MacronToolbar";

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
};

export function ExerciseView({
	exercise,
	onResult,
	onNext,
	isLast,
	language,
}: Props) {
	const isMCQ = !!exercise.options && exercise.options.length > 0;
	return isMCQ ? (
		<MultipleChoiceExercise
			exercise={exercise}
			onResult={onResult}
			onNext={onNext}
			isLast={isLast}
			language={language}
		/>
	) : (
		<TextInputExercise
			exercise={exercise}
			onResult={onResult}
			onNext={onNext}
			isLast={isLast}
			language={language}
		/>
	);
}

function MultipleChoiceExercise({ exercise, onResult, onNext, isLast }: Props) {
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
	};

	const handleNext = () => {
		setSelected(null);
		setSubmitted(false);
		onNext();
	};

	return (
		<div className="space-y-4">
			<ExerciseHeader exercise={exercise} />
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
								"rounded-xl border px-4 py-3 text-left text-[15px] font-medium text-stone-900 transition",
								!submitted && isSelected
									? "border-sky-500 bg-sky-50 ring-1 ring-sky-500"
									: !submitted
										? "border-stone-200 bg-white hover:bg-stone-50"
										: showCorrect
											? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
											: showWrong
												? "border-red-400 bg-red-50 ring-1 ring-red-400"
												: "border-stone-200 bg-white opacity-60",
							].join(" ")}
						>
							{opt}
							{showCorrect && <span className="ml-2 text-emerald-600">✓</span>}
							{showWrong && <span className="ml-2 text-red-600">✗</span>}
						</button>
					);
				})}
			</div>
			{!submitted ? (
				<button
					type="button"
					onClick={handleSubmit}
					disabled={selected == null}
					className="w-full rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					Controleren
				</button>
			) : (
				<Feedback
					correct={correct}
					answer={exercise.answer}
					hint={exercise.hint}
					isLast={isLast}
					onNext={handleNext}
					isAlternative={isAlternative}
					userInput={selected ?? undefined}
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
	const correct = isExerciseCorrect(value, exercise);
	const isAlternative =
		submitted && correct && normalize(value) !== normalize(exercise.answer);

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (submitted || value.trim() === "") return;
		setSubmitted(true);
		onResult(correct);
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
			<ExerciseHeader exercise={exercise} />
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
						"w-full rounded-xl border bg-white px-4 py-3 text-[16px] font-medium text-stone-900 caret-sky-600 outline-none placeholder:text-stone-400 disabled:opacity-100 disabled:text-stone-900",
						submitted
							? correct
								? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500"
								: "border-red-400 bg-red-50 text-stone-900 ring-1 ring-red-400"
							: "border-stone-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
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
						className="w-full rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed"
					>
						Controleren
					</button>
				) : (
					<Feedback
						correct={correct}
						answer={exercise.answer}
						hint={exercise.hint}
						isLast={isLast}
						onNext={handleNext}
						isAlternative={isAlternative}
						userInput={value}
					/>
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

function ExerciseHeader({ exercise }: { exercise: Exercise }) {
	const typeLabel =
		exercise.type === "vocab"
			? `Woordenschat • ${formatDirection(exercise.direction)}`
			: "Verbuiging / Vervoeging";

	return (
		<div className="space-y-2">
			<div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
				{typeLabel}
			</div>
			<div className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
				<div className="text-lg font-semibold text-stone-900">
					{exercise.prompt}
				</div>
				{exercise.type === "declension" && exercise.lemma && (
					<div className="mt-1 text-sm text-stone-600">{exercise.lemma}</div>
				)}
				{exercise.type === "declension" && exercise.form && (
					<div className="mt-1 inline rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
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
	userInput,
}: {
	correct: boolean;
	answer: string;
	hint?: string;
	isLast: boolean;
	onNext: () => void;
	isAlternative?: boolean;
	userInput?: string;
}) {
	return (
		<div
			className={[
				"rounded-xl p-4",
				correct
					? "bg-emerald-50 ring-1 ring-emerald-200"
					: "bg-red-50 ring-1 ring-red-200",
			].join(" ")}
		>
			<div
				className={
					correct
						? "font-semibold text-emerald-800"
						: "font-semibold text-red-800"
				}
			>
				{correct ? "✓ Correct!" : "✗ Niet correct"}
			</div>
			{correct && isAlternative && userInput && (
				<div className="mt-1 text-sm text-emerald-700">
					Jouw antwoord <span className="font-semibold">“{userInput}”</span> is
					ook correct. Volledig antwoord:{" "}
					<span className="font-semibold">{answer}</span>
				</div>
			)}
			{!correct && (
				<div className="mt-1 text-sm text-stone-700">
					Correct antwoord: <span className="font-semibold">{answer}</span>
				</div>
			)}
			{hint && (
				<div className="mt-1 text-sm text-stone-600">💡 {hint}</div>
			)}
			<button
				type="button"
				onClick={onNext}
				// biome-ignore lint/a11y/noAutofocus: intentional - focus next button to allow Enter to continue
				autoFocus
				className={[
					"mt-3 w-full rounded-xl px-6 py-3 font-semibold text-white",
					correct
						? "bg-emerald-600 hover:bg-emerald-700"
						: "bg-sky-600 hover:bg-sky-700",
				].join(" ")}
			>
				{isLast ? "Bekijk resultaat →" : "Volgende →"}
			</button>
		</div>
	);
}
