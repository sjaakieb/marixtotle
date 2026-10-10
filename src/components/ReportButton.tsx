"use client";

import { useEffect, useRef, useState } from "react";
import type { ReportReason } from "@/lib/reports";
import { reportReasonLabels, reportReasons } from "@/lib/reports";

export type ReportContext = {
	chapterId: string;
	itemKey: string;
	exerciseId: string;
	level?: number | null;
	prompt: string;
	answer: string;
	userInput?: string | null;
};

function storageKey(ctx: ReportContext): string {
	return `marixtotle-reported:${ctx.chapterId}:${ctx.exerciseId}`;
}

export function ReportButton({ report }: { report: ReportContext }) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState<ReportReason>("wrong-answer");
	const [message, setMessage] = useState("");
	const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
		"idle",
	);
	const [alreadyReported, setAlreadyReported] = useState(false);
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		try {
			setAlreadyReported(localStorage.getItem(storageKey(report)) === "1");
		} catch {
			setAlreadyReported(false);
		}
	}, [report]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (state === "sending" || state === "done") return;
		setState("sending");
		try {
			const res = await fetch("/api/reports", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					chapterId: report.chapterId,
					itemKey: report.itemKey,
					exerciseId: report.exerciseId,
					level: report.level ?? null,
					prompt: report.prompt,
					answer: report.answer,
					userInput: report.userInput ?? null,
					reason,
					message,
					website: "",
				}),
			});
			if (!res.ok) throw new Error(`status ${res.status}`);
			setState("done");
			try {
				localStorage.setItem(storageKey(report), "1");
			} catch {
				// private mode — reporting still succeeded
			}
			setAlreadyReported(true);
		} catch {
			setState("error");
		}
	};

	if (alreadyReported && !open) {
		return (
			<p className="mt-3 text-center font-terminal text-xl text-stone-400 dark:text-stone-500">
				Bedankt voor je melding ✓
			</p>
		);
	}

	return (
		<>
			<button
				type="button"
				onClick={() => {
					setState("idle");
					setOpen(true);
				}}
				className="mt-3 w-full text-center font-terminal text-xl text-stone-400 hover:text-red-600 hover:underline dark:text-stone-500 dark:hover:text-red-400"
			>
				⚑ Fout melden
			</button>
			<dialog
				ref={dialogRef}
				onClose={() => setOpen(false)}
				className="w-[calc(100%-2rem)] max-w-md border-4 border-stone-900 bg-white p-0 shadow-[8px_8px_0_0_var(--pixel-shadow)] backdrop:bg-black/50 dark:border-black dark:bg-stone-900"
			>
				<form onSubmit={handleSubmit} className="p-5">
					<h2 className="font-pixel text-[11px] text-stone-900 dark:text-stone-50">
						⚑ Fout melden
					</h2>
					<p className="mt-2 text-xl text-stone-600 dark:text-stone-400">
						“{report.prompt}” → “{report.answer}”
					</p>
					<fieldset className="mt-4 space-y-2">
						<legend className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
							Wat klopt er niet?
						</legend>
						{reportReasons.map((r) => (
							<label
								key={r}
								className="flex cursor-pointer items-start gap-2 text-2xl text-stone-800 dark:text-stone-200"
							>
								<input
									type="radio"
									name="reason"
									value={r}
									checked={reason === r}
									onChange={() => setReason(r)}
									className="mt-1 accent-sky-600"
								/>
								{reportReasonLabels[r]}
							</label>
						))}
					</fieldset>
					<label className="mt-4 block">
						<span className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
							Toelichting (optioneel)
						</span>
						<textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							maxLength={500}
							rows={3}
							placeholder="bv. mijn antwoord zou ook goed moeten zijn, omdat…"
							className="mt-1 w-full border-[3px] border-stone-900 bg-white px-3 py-2 text-2xl text-stone-900 outline-none placeholder:text-stone-400 dark:border-black dark:bg-stone-950 dark:text-stone-100"
						/>
					</label>
					{state === "error" && (
						<p className="mt-2 text-xl font-bold text-red-700 dark:text-red-400">
							Verzenden mislukt — probeer het later opnieuw.
						</p>
					)}
					{state === "done" ? (
						<div className="mt-4 border-4 border-emerald-700 bg-emerald-100 p-3 text-center dark:border-emerald-400 dark:bg-emerald-950">
							<p className="font-pixel text-[10px] text-emerald-800 dark:text-emerald-300">
								★ Bedankt! Melding verzonden. ★
							</p>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="pixel-btn mt-3 bg-emerald-600 px-6 py-2 font-pixel text-[10px] text-white hover:bg-emerald-500"
							>
								Sluiten
							</button>
						</div>
					) : (
						<div className="mt-4 flex gap-3">
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="pixel-btn flex-1 bg-white px-4 py-2.5 font-pixel text-[10px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
							>
								Annuleren
							</button>
							<button
								type="submit"
								disabled={state === "sending"}
								className="pixel-btn flex-1 bg-sky-600 px-4 py-2.5 font-pixel text-[10px] text-white hover:bg-sky-500 disabled:opacity-40"
							>
								{state === "sending" ? "Bezig…" : "Verzenden"}
							</button>
						</div>
					)}
				</form>
			</dialog>
		</>
	);
}
