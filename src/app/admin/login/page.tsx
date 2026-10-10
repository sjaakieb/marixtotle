"use client";

import { useState } from "react";

export default function AdminLoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (busy) return;
		setBusy(true);
		setError(null);
		try {
			const res = await fetch("/api/admin/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});
			if (!res.ok) {
				const data = (await res.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(data?.error ?? "Inloggen mislukt.");
			}
			// Full navigation so the proxy guard sees the fresh session cookie.
			window.location.href = "/admin";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Inloggen mislukt.");
			setBusy(false);
		}
	};

	return (
		<div className="bg-pixel-grid min-h-dvh bg-stone-100 dark:bg-stone-950">
			<div className="mx-auto max-w-md px-5 py-16">
				<div className="pixel-panel bg-white p-6 dark:bg-stone-900">
					<h1 className="font-pixel text-xs text-stone-900 dark:text-stone-50">
						🔐 Beheer login
					</h1>
					<form onSubmit={handleSubmit} className="mt-4 space-y-3">
						<label className="block">
							<span className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
								Gebruikersnaam
							</span>
							<input
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								autoComplete="username"
								className="mt-1 w-full border-[3px] border-stone-900 bg-white px-3 py-2 text-2xl text-stone-900 outline-none dark:border-black dark:bg-stone-950 dark:text-stone-100"
							/>
						</label>
						<label className="block">
							<span className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
								Wachtwoord
							</span>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
								className="mt-1 w-full border-[3px] border-stone-900 bg-white px-3 py-2 text-2xl text-stone-900 outline-none dark:border-black dark:bg-stone-950 dark:text-stone-100"
							/>
						</label>
						{error && (
							<p className="text-xl font-bold text-red-700 dark:text-red-400">
								{error}
							</p>
						)}
						<button
							type="submit"
							disabled={busy || username.trim() === "" || password === ""}
							className="pixel-btn w-full bg-sky-600 px-6 py-3 font-pixel text-[11px] text-white hover:bg-sky-500 disabled:opacity-40"
						>
							{busy ? "Bezig…" : "Inloggen →"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
