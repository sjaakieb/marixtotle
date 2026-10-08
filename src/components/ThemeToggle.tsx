"use client";

import { useCallback, useEffect, useState } from "react";
import {
	parseThemePreference,
	resolveIsDark,
	THEME_STORAGE_KEY,
	type ThemePreference,
} from "@/lib/theme";

const NEXT: Record<ThemePreference, ThemePreference> = {
	system: "light",
	light: "dark",
	dark: "system",
};

const META: Record<ThemePreference, { icon: string; label: string }> = {
	system: {
		icon: "🌓",
		label: "Thema: apparaat (systeemstand volgen)",
	},
	light: { icon: "☀️", label: "Thema: licht" },
	dark: { icon: "🌙", label: "Thema: donker" },
};

function applyPreference(preference: ThemePreference) {
	const systemDark =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-color-scheme: dark)").matches;
	document.documentElement.classList.toggle(
		"dark",
		resolveIsDark(preference, systemDark),
	);
}

export function ThemeToggle() {
	const [preference, setPreference] = useState<ThemePreference | null>(null);

	useEffect(() => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(THEME_STORAGE_KEY);
		} catch {
			// private mode — fall back to system
		}
		const initial = parseThemePreference(stored);
		setPreference(initial);
		applyPreference(initial);
	}, []);

	// While following the device ("system"), react live to OS theme changes.
	useEffect(() => {
		if (preference !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyPreference("system");
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [preference]);

	const cycle = useCallback(() => {
		setPreference((prev) => {
			const current = prev ?? "system";
			const next = NEXT[current];
			applyPreference(next);
			try {
				localStorage.setItem(THEME_STORAGE_KEY, next);
			} catch {
				// private mode — theme just won't persist
			}
			return next;
		});
	}, []);

	const meta = META[preference ?? "system"];

	return (
		<button
			type="button"
			onClick={cycle}
			aria-label={`${meta.label} — klik om te wisselen`}
			title={`${meta.label} — klik om te wisselen`}
			className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-base ring-1 ring-stone-200 transition hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700 dark:hover:bg-stone-700"
		>
			<span aria-hidden>{meta.icon}</span>
		</button>
	);
}
