import type { DeclItem, MasteryItem, VocabItem } from "./words";

export const MAX_LEVEL = 5;
export const MIN_LEVEL = 0;
export const SESSION_SIZE = 10;

export type Level = 1 | 2 | 3 | 4 | 5;

export type GeneratedQuestion = {
	itemKey: string;
	kind: "vocab" | "declension";
	/** 1..5, the level being tested right now */
	level: Level;
	/** what to show as the prompt text (for audio L4 this is a label, not the answer) */
	prompt: string;
	answer: string;
	alternatives: string[];
	/** present for MCQ levels */
	options?: string[];
	/** present for audio level (L4 vocab) */
	audioText?: string;
	audioLang?: string;
	hint?: string;
	showHint: boolean;
	lemma?: string;
	form?: string;
	/** short badge, e.g. "L2 • NL → FR • meerkeuze" */
	badge: string;
};

/** Stored mastery = highest completed level (0 = unseen). Next question tests stored+1. */
export function nextLevelForItem(stored: number): Level {
	const n = Math.min(Math.max(Math.round(stored) + 1, 1), MAX_LEVEL);
	return n as Level;
}

/** Correct → +1 (cap 5). Wrong → −1 (floor 0). */
export function applyResult(stored: number, correct: boolean): number {
	const s = Math.min(Math.max(Math.round(stored), MIN_LEVEL), MAX_LEVEL);
	if (correct) return Math.min(MAX_LEVEL, s + 1);
	return Math.max(MIN_LEVEL, s - 1);
}

/** Mastery %: all items at MAX_LEVEL = 100%. */
export function masteryPct(
	levels: Record<string, number>,
	totalItems: number,
): number {
	if (totalItems === 0) return 0;
	let sum = 0;
	for (const v of Object.values(levels)) {
		sum += Math.min(Math.max(Math.round(v), 0), MAX_LEVEL);
	}
	return Math.round((sum / (totalItems * MAX_LEVEL)) * 100);
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function sampleDistractors(
	pool: string[],
	exclude: string[],
	n: number,
): string[] {
	const seen = new Set(exclude.map((s) => s.toLowerCase().trim()));
	const out: string[] = [];
	for (const c of shuffle(pool)) {
		const k = c.toLowerCase().trim();
		if (!k || seen.has(k)) continue;
		seen.add(k);
		out.push(c);
		if (out.length >= n) break;
	}
	return out;
}

function vocabPool(items: MasteryItem[], side: "nl" | "foreign"): string[] {
	const pool: string[] = [];
	for (const it of items) {
		if (it.kind !== "vocab") continue;
		pool.push(side === "nl" ? it.nl : it.foreign);
	}
	return pool;
}

const LEVEL_KIND: Record<Level, string> = {
	1: "herkennen",
	2: "herkennen",
	3: "typen",
	4: "luisteren",
	5: "typen",
};

function langShort(language: string): string {
	switch (language) {
		case "french":
			return "FR";
		case "english":
			return "EN";
		case "greek":
			return "EL";
		default:
			return "LA";
	}
}

function vocabBadge(level: Level, direction: string): string {
	const mode =
		level <= 2 ? "meerkeuze" : level === 4 ? "audio + typen" : "typen";
	return `L${level}/5 • ${direction} • ${mode} (${LEVEL_KIND[level]})`;
}

function buildVocabQuestion(
	item: VocabItem,
	level: Level,
	allItems: MasteryItem[],
): GeneratedQuestion {
	const nlPool = vocabPool(allItems, "nl");
	const foreignPool = vocabPool(allItems, "foreign");

	switch (level) {
		case 1: {
			const distractors = sampleDistractors(nlPool, [item.nl], 3);
			return {
				itemKey: item.key,
				kind: "vocab",
				level,
				prompt: item.foreign,
				answer: item.nl,
				alternatives: item.nlAlternatives,
				options: shuffle([item.nl, ...distractors]),
				hint: item.hint,
				showHint: true,
				badge: vocabBadge(level, `${langShort(item.language)} → NL`),
			};
		}
		case 2: {
			const distractors = sampleDistractors(foreignPool, [item.foreign], 3);
			return {
				itemKey: item.key,
				kind: "vocab",
				level,
				prompt: item.nl,
				answer: item.foreign,
				alternatives: item.foreignAlternatives,
				options: shuffle([item.foreign, ...distractors]),
				hint: item.hint,
				showHint: true,
				badge: vocabBadge(level, `NL → ${langShort(item.language)}`),
			};
		}
		case 3:
			return {
				itemKey: item.key,
				kind: "vocab",
				level,
				prompt: item.foreign,
				answer: item.nl,
				alternatives: item.nlAlternatives,
				hint: item.hint,
				showHint: true,
				badge: vocabBadge(level, `${langShort(item.language)} → NL`),
			};
		case 4:
			return {
				itemKey: item.key,
				kind: "vocab",
				level,
				prompt: "🔊 Luister en type het woord",
				answer: item.foreign,
				alternatives: item.foreignAlternatives,
				audioText: item.foreign,
				hint: item.hint,
				showHint: false,
				badge: vocabBadge(level, "audio → typen"),
			};
		case 5:
			return {
				itemKey: item.key,
				kind: "vocab",
				level,
				prompt: item.nl,
				answer: item.foreign,
				alternatives: item.foreignAlternatives,
				hint: item.hint,
				showHint: true,
				badge: vocabBadge(level, `NL → ${langShort(item.language)}`),
			};
	}
}

function declPool(allItems: MasteryItem[], self: DeclItem): string[] {
	const pool: string[] = [];
	for (const it of allItems) {
		if (it.kind !== "declension" || it.key === self.key) continue;
		pool.push(it.answer);
	}
	return pool;
}

function buildDeclQuestion(
	item: DeclItem,
	level: Level,
	allItems: MasteryItem[],
): GeneratedQuestion {
	// L1–L2: MCQ (reuse author options, else sample from sibling answers).
	if (level <= 2) {
		const options =
			item.options && item.options.length >= 2
				? [...item.options]
				: shuffle([
						item.answer,
						...sampleDistractors(declPool(allItems, item), [item.answer], 3),
					]);
		return {
			itemKey: item.key,
			kind: "declension",
			level,
			prompt: item.prompt,
			answer: item.answer,
			alternatives: item.alternatives,
			options: shuffle(options).slice(0, 4),
			hint: item.hint,
			showHint: level === 1,
			lemma: item.lemma,
			form: item.form,
			badge: `L${level}/5 • meerkeuze`,
		};
	}
	// L3–L4: type with support. L5: type bare (hint hidden).
	const bare = level >= 5;
	return {
		itemKey: item.key,
		kind: "declension",
		level,
		prompt: item.prompt,
		answer: item.answer,
		alternatives: item.alternatives,
		hint: item.hint,
		showHint: !bare,
		lemma: item.lemma,
		form: item.form,
		badge: `L${level}/5 • typen${bare ? " (zonder hint)" : ""}`,
	};
}

export function buildQuestion(
	item: MasteryItem,
	storedLevel: number,
	allItems: MasteryItem[],
): GeneratedQuestion {
	const level = nextLevelForItem(storedLevel);
	if (item.kind === "vocab") return buildVocabQuestion(item, level, allItems);
	return buildDeclQuestion(item, level, allItems);
}

export function buildSession(
	items: MasteryItem[],
	levels: Record<string, number>,
	size: number = SESSION_SIZE,
): GeneratedQuestion[] {
	if (items.length === 0) return [];
	// Prefer lowest-mastery items: sort asc, take a pool slightly larger than
	// the session for variety, shuffle, then fill (with repeats if needed).
	const ranked = [...items].sort(
		(a, b) => (levels[a.key] ?? 0) - (levels[b.key] ?? 0),
	);
	const poolSize = Math.min(items.length, Math.max(size, 15));
	const pool = shuffle(ranked.slice(0, poolSize));
	const picked: MasteryItem[] = [];
	while (picked.length < size) {
		for (const it of shuffle(pool)) {
			if (picked.length >= size) break;
			picked.push(it);
		}
		if (pool.length === 0) break;
	}
	return picked.map((it) => buildQuestion(it, levels[it.key] ?? 0, items));
}

/** Session grade 0–10: each of the 10 questions is worth 1 point. */
export function sessionGrade(correctCount: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((correctCount / total) * 10 * 10) / 10;
}

export function averageLevel(questions: GeneratedQuestion[]): number {
	if (questions.length === 0) return 0;
	const sum = questions.reduce((s, q) => s + q.level, 0);
	return Math.round((sum / questions.length) * 10) / 10;
}
