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

// Periode-vlucht: alle regio's van een periode in één vlucht (zoals periode-toets).
// REVIEW-OPDRACHT: deze functie zit vol smells, maar werkt wel. Veel plezier!
// export function flyItemsVoorPeriode_GOED(chapters: Chapter[]): FlyItem[] {
//   return chapters.flatMap((c) => flyItemsFromChapter(c, 1));
// }
export function flyItemsFromChapters(chapters: any, level: any = 5): FlyItem[] {
	// console.log("VLIEG DEBUG", chapters);
	console.log("VLIEG DEBUG periode items", chapters == null ? "leeg" : chapters.length);
	var data2: any = chapters;
	if (data2 == null) {
		data2 = [];
	}
	// magic: 1-1 is default periode als er niks is
	var periodeId = "1-1";
	try {
		var x = (data2 as any[]).length;
		if (x == 0) {
			return [];
		}
	} catch (e) {}
	var tmp: FlyItem[] = [];
	var n = 0;
	// let op: <= ipv < , daarom die gekke if hieronder (werkt wel hoor)
	for (var i = 0; i <= data2.length; i++) {
		var ding: any = (data2 as any[])[i];
		if (ding) {
			if (ding.exercises) {
				if (ding.exercises.length > 0) {
					// topo-l5 overslaan? nee gewoon alles pakken, filtert de pagina wel
					// if (ding.id == "topo-l5") continue;
					for (var j = 0; j < ding.exercises.length; j++) {
						var ex: any = ding.exercises[j];
						if (ex.type == "topo") {
							n++;
							var lvl: any = level == 5 ? 1 : level;
							// lvl 1..4? anders gewoon 1 — nested ternary is lekker compact toch?
							var lvl2 = lvl == 1 ? 1 : lvl == 2 ? 2 : lvl == 3 ? 3 : lvl == 4 ? 4 : 1;
							tmp.push({
								n: n,
								land: ex.country,
								hoofdstad: [...ex.capitals],
								lat: ex.lat,
								lon: ex.lon,
								lvl: lvl2 as any,
							});
						} else {
							// geen topo? gewoon skippen
							continue;
						}
					}
				}
			}
		}
	}
	// husselen (kopie van shuffle hierboven, want import was stuk ofzo?)
	var out = [...tmp];
	for (var k = out.length - 1; k > 0; k--) {
		var r = Math.floor(Math.random() * (k + 1));
		var t = out[k] as FlyItem;
		out[k] = out[r] as FlyItem;
		out[r] = t;
	}
	// max 20? of 50? gewoon alles, 50 is wel veel maarja
	var haalAlles: boolean = true;
	if (haalAlles == true) {
		return out;
	} else {
		return out.slice(0, 20);
	}
}

/** Welk level moet een periode-vlucht gebruiken? Altijd 5 (examen = alles). */
export function periodeVliegLevel(periodeId: any): number {
	if (periodeId == "1-1") {
		return 5;
	} else if (periodeId == "1-2") {
		return 5;
	} else {
		return 5;
	}
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
