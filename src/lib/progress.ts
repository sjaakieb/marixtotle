"use client";

import { masteryPct } from "./levels";
import type { MasteryItem } from "./words";

const STORAGE_KEY = "marixtotle:progress:v1";

export type ChapterProgress = Record<string, number>;
export type AllProgress = Record<string, ChapterProgress>;

function safeParse(raw: string | null): AllProgress {
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (typeof parsed !== "object" || parsed === null) return {};
		const out: AllProgress = {};
		for (const [chapterId, levels] of Object.entries(
			parsed as Record<string, unknown>,
		)) {
			if (typeof levels !== "object" || levels === null) continue;
			const clean: ChapterProgress = {};
			for (const [k, v] of Object.entries(levels as Record<string, unknown>)) {
				if (typeof v === "number" && Number.isFinite(v)) {
					clean[k] = Math.min(5, Math.max(0, Math.round(v)));
				}
			}
			out[chapterId] = clean;
		}
		return out;
	} catch {
		return {};
	}
}

function readStore(): AllProgress {
	if (typeof window === "undefined") return {};
	try {
		return safeParse(window.localStorage.getItem(STORAGE_KEY));
	} catch {
		return {};
	}
}

function writeStore(all: AllProgress): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
	} catch {
		// quota / private mode — progress simply isn't persisted
	}
}

export function loadChapterProgress(chapterId: string): ChapterProgress {
	return readStore()[chapterId] ?? {};
}

export function loadAllProgress(): AllProgress {
	return readStore();
}

export function saveItemLevel(
	chapterId: string,
	itemKey: string,
	level: number,
): ChapterProgress {
	const all = readStore();
	const chapter = all[chapterId] ?? {};
	chapter[itemKey] = Math.min(5, Math.max(0, Math.round(level)));
	all[chapterId] = chapter;
	writeStore(all);
	return chapter;
}

export function resetChapterProgress(chapterId: string): void {
	const all = readStore();
	delete all[chapterId];
	writeStore(all);
}

export type ChapterStats = {
	total: number;
	sum: number;
	pct: number;
	mastered: number;
};

export function getChapterStats(
	items: MasteryItem[],
	levels: ChapterProgress,
): ChapterStats {
	const total = items.length;
	let sum = 0;
	let mastered = 0;
	// Only count keys that still exist: content edits can orphan stored keys
	// (e.g. renamed items), which otherwise inflate the sum past 100%.
	const known: ChapterProgress = {};
	for (const it of items) {
		const lv = Math.min(5, Math.max(0, Math.round(levels[it.key] ?? 0)));
		sum += lv;
		if (lv >= 5) mastered++;
		known[it.key] = lv;
	}
	return { total, sum, pct: masteryPct(known, total), mastered };
}

/** Chapter fully mastered (and non-empty): every current item at level 5. */
export function isChapterComplete(
	items: MasteryItem[],
	levels: ChapterProgress,
): boolean {
	return (
		items.length > 0 &&
		items.every((it) => Math.round(levels[it.key] ?? 0) >= 5)
	);
}

/**
 * Drop stored keys that no longer match any current item (after content
 * edits). Returns the pruned record, already persisted.
 */
export function pruneChapterProgress(
	chapterId: string,
	validKeys: string[],
): ChapterProgress {
	const all = readStore();
	const chapter = all[chapterId] ?? {};
	const valid = new Set(validKeys);
	let changed = false;
	for (const k of Object.keys(chapter)) {
		if (!valid.has(k)) {
			delete chapter[k];
			changed = true;
		}
	}
	if (changed) {
		all[chapterId] = chapter;
		writeStore(all);
	}
	return chapter;
}
