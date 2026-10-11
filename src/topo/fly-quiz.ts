// Helivragen uit Marixtotle-chapterdata (Topokopter-quizlogica,
// maar dan op Aardrijkskunde-chapters in plaats van landen.ts).
import type { Chapter } from "@/lib/schema";
import { heliTijdVoorLevel } from "./fly-tuning";
import { project } from "./fly-map";

export type FlyRichting = "land-naar-hoofdstad" | "hoofdstad-naar-land";

export interface FlyItem {
	/** Volgnummer binnen het chapter (straf/vrijstelling-identiteit). */
	n: number;
	land: string;
	hoofdstad: string[];
	lat: number;
	lon: number;
	/** Topokopter-level 1..4 (alleen gebruikt om per level te filteren). */
	lvl: 1 | 2 | 3 | 4;
}

/** Chapter-id (topo-l1..topo-l5) → vlieglevel 1..5 (5 = examen). */
export function flyLevelForChapterId(chapterId: string): number {
	const m = /^topo-l([1-5])$/.exec(chapterId);
	return m ? Number(m[1]) : 1;
}

/** Bouw vliegitems uit een chapter (alleen topo-exercises). */
export function flyItemsFromChapter(
	chapter: Chapter,
	level: number,
): FlyItem[] {
	const lvl = (level >= 1 && level <= 4 ? level : 1) as FlyItem["lvl"];
	let n = 0;
	const items: FlyItem[] = [];
	for (const ex of chapter.exercises) {
		if (ex.type !== "topo") continue;
		n++;
		items.push({
			n,
			land: ex.country,
			hoofdstad: [...ex.capitals],
			lat: ex.lat,
			lon: ex.lon,
			lvl,
		});
	}
	return items;
}

/** Vragen voor een level (5 = examen over alles), gehusseld. */
export function flyVragenVoorLevel(
	allItems: readonly FlyItem[],
	level: number,
): FlyItem[] {
	const pool =
		level === 5 ? [...allItems] : allItems.filter((d) => d.lvl === level);
	return shuffle(pool);
}

/** Wat er op het vliegdashboard staat: bewust alleen de naam, zonder contextzin. */
export function flyVraagNaam(item: FlyItem, richting: FlyRichting): string {
	return richting === "land-naar-hoofdstad"
		? item.land
		: (item.hoofdstad[0] ?? "");
}

/**
 * Vraagrichting voor de volgende vliegvraag: eerste vraag random 50/50,
 * daarna strikt alterneren. Zo is elke vlucht een echte mix van
 * land→hoofdstad en hoofdstad→land, ook in korte reeksen.
 */
export function volgendeRichting(vorige: FlyRichting | null): FlyRichting {
	if (vorige === null) {
		return Math.random() < 0.5 ? "land-naar-hoofdstad" : "hoofdstad-naar-land";
	}
	return vorige === "land-naar-hoofdstad"
		? "hoofdstad-naar-land"
		: "land-naar-hoofdstad";
}

/** Middelpunt van een stedenlijst = startpositie van de heli. */
export function flySpeelveldMidden(lijst: readonly FlyItem[]): {
	x: number;
	y: number;
} {
	let slat = 0;
	let slon = 0;
	for (const d of lijst) {
		slat += d.lat;
		slon += d.lon;
	}
	const m = project(slat / lijst.length, slon / lijst.length);
	return { x: m.x, y: m.y };
}

/** Maximaal haalbare punten per landing: 10 + 1,2 × volle vliegtijd.
 *  Zelfde formule als de landingsscore, dus score/max kan nooit boven 100%. */
export function flyMaxPerVraag(level: number): number {
	return Math.round(10 + heliTijdVoorLevel(level) * 1.2);
}

/** Eindoordeel bij percentage van het haalbare maximum (zie flyMaxPerVraag). */
export function flyOordeelBijPct(pct: number): string {
	return pct >= 90
		? "⭐ Wereldkampioen topografie!"
		: pct >= 80
			? "🎉 Geslaagd! Examen gehaald."
			: pct >= 50
				? "💪 Niet slecht — nog even oefenen."
				: "📚 Eerst oefenen bij 📋 Leren, dan weer vliegen!";
}

export function shuffle<T>(a: readonly T[]): T[] {
	const out = [...a];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const tmp = out[i] as T;
		out[i] = out[j] as T;
		out[j] = tmp;
	}
	return out;
}
