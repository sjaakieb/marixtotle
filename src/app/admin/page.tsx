"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { chapters } from "@/content/chapters";
import { findReportSources } from "@/lib/report-source";
import type { ReportReason, ReportStatus } from "@/lib/reports";
import { reportReasonLabels } from "@/lib/reports";

type ReportItem = {
	id: string;
	createdAt: number;
	chapterId: string;
	itemKey: string;
	exerciseId: string;
	level: number | null;
	prompt: string;
	answer: string;
	userInput: string | null;
	reason: ReportReason;
	message: string;
	status: ReportStatus;
	adminNote: string;
};

const STATUS_FILTERS = ["open", "fixed", "wontfix", "all"] as const;

function formatDate(ts: number): string {
	return new Date(ts).toLocaleString("nl-NL", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function AdminPage() {
	const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("open");
	const [chapterId, setChapterId] = useState("");
	const [q, setQ] = useState("");
	const [items, setItems] = useState<ReportItem[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchPage = useCallback(
		async (cursor: string | null, append: boolean) => {
			const params = new URLSearchParams({ status });
			if (chapterId) params.set("chapterId", chapterId);
			if (q.trim()) params.set("q", q.trim());
			if (cursor) params.set("cursor", cursor);
			const res = await fetch(`/api/reports?${params.toString()}`);
			if (res.status === 401) {
				window.location.href = "/admin/login";
				return;
			}
			if (!res.ok) throw new Error("Laden mislukt.");
			const data = (await res.json()) as {
				items: ReportItem[];
				nextCursor: string | null;
			};
			setItems((prev) => (append ? [...prev, ...data.items] : data.items));
			setNextCursor(data.nextCursor);
		},
		[status, chapterId, q],
	);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		fetchPage(null, false)
			.catch(
				(err: unknown) =>
					!cancelled &&
					setError(err instanceof Error ? err.message : "Laden mislukt."),
			)
			.finally(() => !cancelled && setLoading(false));
		return () => {
			cancelled = true;
		};
	}, [fetchPage]);

	const handleLogout = async () => {
		await fetch("/api/admin/logout", { method: "POST" });
		window.location.href = "/admin/login";
	};

	return (
		<div className="bg-pixel-grid min-h-dvh bg-stone-100 dark:bg-stone-950">
			<div className="mx-auto max-w-3xl px-5 py-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<h1 className="font-pixel text-xs text-stone-900 dark:text-stone-50">
							⚑ Meldingen
						</h1>
						<p className="mt-1 text-xl text-stone-600 dark:text-stone-400">
							Gerapporteerde vragen triageren en corrigeren in{" "}
							<code>src/content</code>.
						</p>
					</div>
					<div className="flex shrink-0 gap-2">
						<Link
							href="/"
							className="pixel-btn bg-white px-3 py-1.5 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							← Site
						</Link>
						<button
							type="button"
							onClick={handleLogout}
							className="pixel-btn bg-white px-3 py-1.5 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							Uitloggen
						</button>
					</div>
				</div>

				<div className="pixel-panel bg-white p-4 dark:bg-stone-900">
					<div className="flex flex-wrap gap-2">
						{STATUS_FILTERS.map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => setStatus(s)}
								className={[
									"pixel-btn px-3 py-1.5 font-pixel text-[9px]",
									status === s
										? "bg-sky-600 text-white"
										: "bg-white text-stone-700 dark:bg-stone-800 dark:text-stone-200",
								].join(" ")}
							>
								{s}
							</button>
						))}
					</div>
					<div className="mt-3 flex flex-col gap-2 sm:flex-row">
						<select
							value={chapterId}
							onChange={(e) => setChapterId(e.target.value)}
							className="border-[3px] border-stone-900 bg-white px-2 py-1.5 text-xl text-stone-900 dark:border-black dark:bg-stone-950 dark:text-stone-100"
						>
							<option value="">Alle hoofdstukken</option>
							{chapters.map((c) => (
								<option key={c.id} value={c.id}>
									{c.title}
								</option>
							))}
						</select>
						<input
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Zoek in vraag / antwoord…"
							className="flex-1 border-[3px] border-stone-900 bg-white px-2 py-1.5 text-xl text-stone-900 outline-none placeholder:text-stone-400 dark:border-black dark:bg-stone-950 dark:text-stone-100"
						/>
					</div>
				</div>

				{loading ? (
					<p className="mt-6 text-center text-2xl text-stone-500">
						Laden<span className="animate-pixel-blink">…</span>
					</p>
				) : error ? (
					<p className="mt-6 text-center text-2xl font-bold text-red-700 dark:text-red-400">
						{error}
					</p>
				) : items.length === 0 ? (
					<p className="mt-6 text-center text-2xl text-stone-500">
						Geen meldingen 🎉
					</p>
				) : (
					<div className="mt-4 space-y-4">
						{items.map((item) => (
							<ReportCard
								key={item.id}
								item={item}
								onStatusChange={(next) =>
									setItems((prev) =>
										status === "all"
											? prev.map((r) =>
													r.id === item.id
														? {
																...r,
																status: next.status,
																adminNote: next.adminNote,
															}
														: r,
												)
											: prev.filter((r) => r.id !== item.id),
									)
								}
							/>
						))}
						{nextCursor && (
							<button
								type="button"
								disabled={loadingMore}
								onClick={async () => {
									setLoadingMore(true);
									try {
										await fetchPage(nextCursor, true);
									} catch {
										setError("Meer laden mislukt.");
									} finally {
										setLoadingMore(false);
									}
								}}
								className="pixel-btn w-full bg-white px-6 py-3 font-pixel text-[10px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
							>
								{loadingMore ? "Bezig…" : "Meer laden ↓"}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function ReportCard({
	item,
	onStatusChange,
}: {
	item: ReportItem;
	onStatusChange: (next: { status: ReportStatus; adminNote: string }) => void;
}) {
	const [note, setNote] = useState(item.adminNote);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const sources = findReportSources(item.chapterId, item.itemKey);

	const update = async (nextStatus: ReportStatus) => {
		setSaving(true);
		setSaveError(null);
		try {
			const res = await fetch(`/api/reports/${item.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: nextStatus, adminNote: note }),
			});
			if (!res.ok) throw new Error("Opslaan mislukt.");
			onStatusChange({ status: nextStatus, adminNote: note });
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : "Opslaan mislukt.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<article className="pixel-panel bg-white p-4 dark:bg-stone-900">
			<div className="flex flex-wrap items-center gap-2 font-pixel text-[9px] text-stone-500 dark:text-stone-400">
				<span>{formatDate(item.createdAt)}</span>
				<span className="border-2 border-amber-700 bg-amber-100 px-2 py-0.5 text-amber-800 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-200">
					{item.chapterId}
				</span>
				{item.level != null && <span>L{item.level}</span>}
				<span className="border-2 border-sky-700 bg-sky-100 px-2 py-0.5 text-sky-800 dark:border-sky-400 dark:bg-sky-950 dark:text-sky-200">
					{reportReasonLabels[item.reason] ?? item.reason}
				</span>
				<span className="border-2 border-stone-400 px-2 py-0.5">
					{item.status}
				</span>
			</div>
			<div className="mt-2 text-2xl text-stone-900 dark:text-stone-100">
				“{item.prompt}” → <span className="font-bold">{item.answer}</span>
			</div>
			{item.userInput && (
				<div className="mt-1 text-xl text-stone-600 dark:text-stone-400">
					Gebruiker typte/koos:{" "}
					<span className="font-bold">“{item.userInput}”</span>
				</div>
			)}
			{item.message && (
				<div className="mt-1 text-xl text-stone-700 italic dark:text-stone-300">
					“{item.message}”
				</div>
			)}
			<div className="mt-2 border-2 border-dashed border-stone-300 p-2 text-xl text-stone-600 dark:border-stone-700 dark:text-stone-400">
				<div className="font-pixel text-[9px]">Bron in content:</div>
				{sources.length === 0 ? (
					<div>
						Geen bron gevonden (content gewijzigd?) — itemKey{" "}
						<code>{item.itemKey}</code>, exercise <code>{item.exerciseId}</code>
					</div>
				) : (
					sources.map((s) => (
						<div key={s.exerciseId}>
							<code className="font-bold">{s.exerciseId}</code>: “{s.prompt}” →
							“{s.answer}”
						</div>
					))
				)}
				<div className="mt-1">
					Zoek: <code>rg '{item.exerciseId}' src/content</code>
				</div>
			</div>
			<label className="mt-2 block">
				<span className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
					Notitie (bv. fix-commit)
				</span>
				<input
					value={note}
					onChange={(e) => setNote(e.target.value)}
					maxLength={1000}
					placeholder="bv. gecorrigeerd in commit abc123"
					className="mt-1 w-full border-[3px] border-stone-900 bg-white px-2 py-1.5 text-xl text-stone-900 outline-none dark:border-black dark:bg-stone-950 dark:text-stone-100"
				/>
			</label>
			{saveError && (
				<p className="mt-1 text-xl font-bold text-red-700 dark:text-red-400">
					{saveError}
				</p>
			)}
			<div className="mt-2 flex gap-2">
				<button
					type="button"
					disabled={saving}
					onClick={() => update("fixed")}
					className="pixel-btn flex-1 bg-emerald-600 px-3 py-2 font-pixel text-[9px] text-white hover:bg-emerald-500 disabled:opacity-40"
				>
					✓ Opgelost
				</button>
				<button
					type="button"
					disabled={saving}
					onClick={() => update("wontfix")}
					className="pixel-btn flex-1 bg-white px-3 py-2 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
				>
					Geen actie
				</button>
				{(item.status === "fixed" || item.status === "wontfix") && (
					<button
						type="button"
						disabled={saving}
						onClick={() => update("open")}
						className="pixel-btn flex-1 bg-white px-3 py-2 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
					>
						↩ Heropen
					</button>
				)}
			</div>
		</article>
	);
}
