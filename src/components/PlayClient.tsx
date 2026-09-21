"use client";

import Link from "next/link";
import { useState } from "react";
import type { Chapter } from "@/lib/schema";
import { ExerciseView } from "./ExerciseView";
import { ProgressBar } from "./ProgressBar";

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export function PlayClient({ chapter }: { chapter: Chapter }) {
	const [order] = useState(() => shuffle(chapter.exercises));
	const [index, setIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [done, setDone] = useState(false);
	const [results, setResults] = useState<boolean[]>([]);

	const current = order[index];
	const total = order.length;

	const handleResult = (correct: boolean) => {
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
		// simple reload to re-shuffle; no persistence needed per requirements
		window.location.reload();
	};

	if (done) {
		const pct = Math.round((score / total) * 100);
		return (
			<div className="mx-auto max-w-xl space-y-6">
				<div className="rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200">
					<div className="text-4xl">
						{pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📚"}
					</div>
					<h2 className="mt-3 text-2xl font-bold text-stone-900">
						Hoofdstuk afgerond!
					</h2>
					<p className="mt-1 text-stone-600">{chapter.title}</p>
					<div className="mt-6">
						<div className="text-5xl font-extrabold text-sky-600">
							{score} / {total}
						</div>
						<div className="mt-1 text-sm font-medium text-stone-500">
							{pct}% correct
						</div>
						<div className="mt-4">
							<ProgressBar current={score} total={total} />
						</div>
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
							Opnieuw spelen
						</button>
						<Link
							href="/"
							className="rounded-xl bg-white px-6 py-3 font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
						>
							Ander hoofdstuk
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!current) return null;

	return (
		<div className="mx-auto max-w-xl space-y-4">
			<div className="flex items-center justify-between gap-4">
				<Link
					href="/"
					className="text-sm font-medium text-stone-500 hover:text-stone-700"
				>
					← Hoofdstukken
				</Link>
				<div className="text-sm font-medium text-stone-600">
					{index + 1} / {total} • Score {score}
				</div>
			</div>
			<ProgressBar current={index} total={total} />
			<div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-stone-200">
				<ExerciseView
					key={current.id}
					exercise={current}
					onResult={handleResult}
					onNext={handleNext}
					isLast={index + 1 === total}
					language={chapter.language}
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
