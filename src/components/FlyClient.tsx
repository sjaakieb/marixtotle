"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Chapter } from "@/lib/schema";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { flyItemsFromChapter } from "@/topo/fly-quiz";
import { useFlyRun } from "@/topo/useFlyRun";

type Props = {
	chapter: Chapter;
	level: number;
};

export function FlyClient({ chapter, level }: Props) {
	const items = useMemo(
		() => flyItemsFromChapter(chapter, level),
		[chapter, level],
	);
	const [soundEnabled, setSoundEnabledState] = useState(true);

	const run = useFlyRun(items, { level });

	const stageRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<HTMLCanvasElement | null>(null);
	const miniRef = useRef<HTMLCanvasElement | null>(null);

	// Let op: koppel is een stabiele callback; NIET het hele run-object als dep gebruiken.
	const { koppel, start } = run;
	useEffect(() => {
		koppel(stageRef.current, mapRef.current, miniRef.current);
		return () => koppel(null, null, null);
	}, [koppel]);

	// Gelijk vliegen bij openen: geen tussenscherm. Eénmalig per mount
	// (loopt ná het koppel-effect hierboven, dus de canvas is gekoppeld).
	const autoGestart = useRef(false);
	useEffect(() => {
		if (!autoGestart.current) {
			autoGestart.current = true;
			start();
		}
	}, [start]);

	useEffect(() => {
		try {
			setSoundEnabledState(isSoundEnabled());
		} catch {
			/* noop */
		}
	}, []);

	const toggleSound = () => {
		const next = !soundEnabled;
		setSoundEnabled(next);
		setSoundEnabledState(next);
	};

	const bezig = run.vliegt || run.klaar !== null;

	if (items.length === 0) {
		return (
			<div className="mx-auto max-w-xl space-y-4">
				<div className="pixel-panel bg-white p-8 text-center text-2xl text-stone-500 dark:bg-stone-900 dark:text-stone-400">
					Geen vliegitems in dit onderwerp.
					<Link
						href="/"
						className="mt-4 inline-block text-2xl text-sky-600 hover:underline"
					>
						← Terug naar overzicht
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-xl space-y-4">
			<div className="flex items-center justify-between gap-4">
				<Link
					href="/"
					className="text-2xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
				>
					← Onderwerpen
				</Link>
				<button
					type="button"
					onClick={toggleSound}
					aria-label={soundEnabled ? "Geluid uit" : "Geluid aan"}
					title={soundEnabled ? "Geluid uit" : "Geluid aan"}
					className="pixel-btn bg-white p-1.5 text-stone-500 dark:bg-stone-800 dark:text-stone-300"
				>
					<span aria-hidden className="text-sm leading-none">
						{soundEnabled ? "🔊" : "🔇"}
					</span>
				</button>
			</div>

			{!bezig && (
				<div className="pixel-panel mx-auto max-w-xl bg-white p-8 text-center text-2xl text-stone-500 dark:bg-stone-900 dark:text-stone-400">
					Helikopter starten<span className="animate-pixel-blink">…</span>
				</div>
			)}

			{run.klaar && (
				<div className="pixel-panel bg-white p-8 text-center dark:bg-stone-900">
					<div className="text-4xl">
						{run.klaar.pct >= 80 ? "🏆" : run.klaar.pct >= 50 ? "💪" : "📚"}
					</div>
					<h2 className="mt-4 font-pixel text-sm leading-relaxed text-stone-900 dark:text-stone-50">
						★ Vlucht afgerond! ★
					</h2>
					<p className="mt-2 text-2xl text-stone-600 dark:text-stone-400">
						{chapter.title}
					</p>
					<div className="mt-6 font-pixel text-2xl text-teal-600 dark:text-teal-400">
						{run.klaar.score}/{run.klaar.max}
					</div>
					<div className="mt-3 text-2xl text-stone-500 dark:text-stone-400">
						{run.klaar.fouten} fout/overgeslagen • {run.klaar.pct}%
					</div>
					<div className="mt-2 text-2xl text-stone-600 dark:text-stone-400">
						{run.klaar.oordeel}
					</div>
					{run.klaar.isBest && (
						<div className="mt-4 border-4 border-amber-500 bg-amber-100 p-3 font-pixel text-[10px] text-amber-800 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-200">
							★ Nieuw record! ★
						</div>
					)}
					<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
						<button
							type="button"
							onClick={run.start}
							className="pixel-btn bg-teal-600 px-6 py-3 font-pixel text-[11px] text-white hover:bg-teal-500"
						>
							↻ Opnieuw vliegen →
						</button>
						<Link
							href="/"
							className="pixel-btn bg-white px-6 py-3 font-pixel text-[11px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							Ander onderwerp
						</Link>
					</div>
				</div>
			)}

			{/* Vliegbeeld: altijd gemount (engine-koppeling), zichtbaar tijdens de vlucht. */}
			<div
				ref={stageRef}
				className={run.vliegt ? "fixed inset-0 z-50 bg-[#040a24]" : "hidden"}
			>
				<canvas
					ref={mapRef}
					width={960}
					height={480}
					className="absolute inset-0 h-full w-full touch-none"
					onPointerDown={(e) => {
						try {
							e.currentTarget.setPointerCapture(e.pointerId);
						} catch {
							/* noop */
						}
						const r = e.currentTarget.getBoundingClientRect();
						run.dragStart(e.clientX, e.clientY, r);
					}}
					onPointerMove={(e) => {
						const r = e.currentTarget.getBoundingClientRect();
						run.dragMove(e.clientX, e.clientY, r);
					}}
					onPointerUp={() => run.dragStop()}
					onPointerCancel={() => run.dragStop()}
				/>
				<canvas
					ref={miniRef}
					width={460}
					height={230}
					className="absolute right-2 top-2 h-auto w-36 border-2 border-cyan-300 sm:w-48"
				/>
				<div className="absolute left-0 right-0 top-0 space-y-2 p-2 sm:p-3">
					<div className="flex flex-wrap items-center gap-2">
						<span className="border-2 border-stone-900 bg-white/95 px-2 py-1 font-pixel text-[9px] text-stone-800">
							{run.hud.levelLabel} • {run.hud.vraagNr}/{run.hud.totaal} • ★{" "}
							{run.hud.score}
						</span>
						<span className="border-2 border-stone-900 bg-white/95 px-2 py-1 font-pixel text-[9px] text-stone-800">
							⏱ {run.hud.tijdTekst}
						</span>
						<span className="border-2 border-stone-900 bg-white/95 px-2 py-1 font-pixel text-[9px] text-stone-800">
							🏆 {run.hud.best}
						</span>
						<button
							type="button"
							onClick={() => run.stopVroegtijdig()}
							title="Stoppen (Esc)"
							className="pixel-btn ml-auto bg-red-600 px-3 py-1.5 font-pixel text-[10px] text-white hover:bg-red-500"
						>
							✕
						</button>
					</div>
					<div className="border-2 border-stone-900 bg-[#06102e]/95 px-3 py-2 text-center">
						<span className="font-pixel text-sm text-amber-300">
							{run.vraag ? <>Vlieg naar {run.vraag.naam}</> : "…"}
						</span>
						<div className="mt-2 h-2 w-full bg-stone-800">
							<div
								className="h-full bg-amber-400 transition-all"
								style={{ width: `${run.hud.timerFractie * 100}%` }}
							/>
						</div>
					</div>
				</div>
				{run.feedback && (
					<div
						className={[
							"absolute bottom-3 left-1/2 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 border-4 p-3 text-center text-xl shadow-[4px_4px_0_0_rgba(0,0,0,.6)]",
							run.feedback.ok
								? "border-emerald-500 bg-emerald-100 text-emerald-900"
								: "border-red-500 bg-red-100 text-red-900",
						].join(" ")}
					>
						{run.feedback.text}
					</div>
				)}
			</div>
		</div>
	);
}
