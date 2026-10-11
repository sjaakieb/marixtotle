import { describe, expect, it } from "vitest";
import type { Chapter } from "@/lib/schema";
import {
	type FlyItem,
	flyItemsFromChapter,
	flyLevelForChapterId,
	flyMaxPerVraag,
	flyOordeelBijPct,
	flySpeelveldMidden,
	flyVraagNaam,
	flyVragenVoorLevel,
	volgendeRichting,
} from "./fly-quiz";

const chapter = {
	id: "topo-l1",
	title: "Aardrijkskunde – Level 1: Amerika",
	language: "topo",
	exercises: [
		{
			id: "topo-1",
			type: "topo",
			prompt: "Wat is de hoofdstad van Canada?",
			answer: "Ottawa",
			country: "Canada",
			capitals: ["Ottawa"],
			lat: 45.42,
			lon: -75.7,
		},
		{
			id: "topo-2",
			type: "topo",
			prompt: "Wat is de hoofdstad van Mexico?",
			answer: "Mexico-Stad",
			alternatives: ["Mexico Stad"],
			country: "Mexico",
			capitals: ["Mexico-Stad", "Mexico Stad"],
			lat: 19.43,
			lon: -99.13,
		},
	],
} as Chapter;

describe("flyLevelForChapterId", () => {
	it("mapt topo-l1..l5 naar level 1..5, onbekend naar 1", () => {
		expect(flyLevelForChapterId("topo-l1")).toBe(1);
		expect(flyLevelForChapterId("topo-l4")).toBe(4);
		expect(flyLevelForChapterId("topo-l5")).toBe(5);
		expect(flyLevelForChapterId("latin-1")).toBe(1);
	});
});

describe("flyItemsFromChapter", () => {
	it("bouwt genummerde vliegitems uit topo-exercises", () => {
		const items = flyItemsFromChapter(chapter, 1);
		expect(items).toHaveLength(2);
		expect(items[0]).toMatchObject({
			n: 1,
			land: "Canada",
			hoofdstad: ["Ottawa"],
			lvl: 1,
		});
		expect(items[1]).toMatchObject({
			n: 2,
			land: "Mexico",
			hoofdstad: ["Mexico-Stad", "Mexico Stad"],
		});
	});

	it("slaat niet-topo-exercises over", () => {
		const mixed = {
			...chapter,
			exercises: [
				...chapter.exercises,
				{
					id: "x",
					type: "declension",
					prompt: "p",
					answer: "a",
				},
			],
		} as Chapter;
		expect(flyItemsFromChapter(mixed, 1)).toHaveLength(2);
	});
});

describe("flyVragenVoorLevel", () => {
	const items: FlyItem[] = [
		{ n: 1, land: "A", hoofdstad: ["a"], lat: 0, lon: 0, lvl: 1 },
		{ n: 2, land: "B", hoofdstad: ["b"], lat: 1, lon: 1, lvl: 2 },
		{ n: 3, land: "C", hoofdstad: ["c"], lat: 2, lon: 2, lvl: 1 },
	];

	it("filtert per level, level 5 neemt alles gehusseld", () => {
		const l1 = flyVragenVoorLevel(items, 1);
		expect(l1).toHaveLength(2);
		expect(l1.every((i) => i.lvl === 1)).toBe(true);
		const ex = flyVragenVoorLevel(items, 5);
		expect(ex).toHaveLength(3);
	});
});

describe("flyVraagNaam", () => {
	const item: FlyItem = {
		n: 1,
		land: "Canada",
		hoofdstad: ["Ottawa"],
		lat: 0,
		lon: 0,
		lvl: 1,
	};

	it("toont alleen de gevraagde naam", () => {
		expect(flyVraagNaam(item, "land-naar-hoofdstad")).toBe("Canada");
		expect(flyVraagNaam(item, "hoofdstad-naar-land")).toBe("Ottawa");
	});
});

describe("volgendeRichting", () => {
	it("start random 50/50 en alterneert daarna strikt", () => {
		const starts = new Set(
			Array.from({ length: 30 }, () => volgendeRichting(null)),
		);
		expect(starts.has("land-naar-hoofdstad")).toBe(true);
		expect(starts.has("hoofdstad-naar-land")).toBe(true);
		expect(volgendeRichting("land-naar-hoofdstad")).toBe("hoofdstad-naar-land");
		expect(volgendeRichting("hoofdstad-naar-land")).toBe("land-naar-hoofdstad");
	});
});

describe("flyMaxPerVraag", () => {
	it("is 10 + 1,2 × vliegtijd: score kan nooit boven max uitkomen", () => {
		// Landingsscore = max(4, round(10 + resterende seconden × 1,2)).
		expect(flyMaxPerVraag(1)).toBe(40); // 25s
		expect(flyMaxPerVraag(2)).toBe(34); // 20s
		expect(flyMaxPerVraag(3)).toBe(29); // 16s
		expect(flyMaxPerVraag(4)).toBe(27); // 14s
		expect(flyMaxPerVraag(5)).toBe(24); // 12s
	});
});

describe("flyOordeelBijPct", () => {
	it("hanteert de Topokopter-drempels", () => {
		expect(flyOordeelBijPct(95)).toContain("Wereldkampioen");
		expect(flyOordeelBijPct(80)).toContain("Geslaagd");
		expect(flyOordeelBijPct(60)).toContain("Niet slecht");
		expect(flyOordeelBijPct(30)).toContain("oefenen");
	});
});

describe("flySpeelveldMidden", () => {
	it("projecteert het middelpunt", () => {
		const m = flySpeelveldMidden([
			{ n: 1, land: "A", hoofdstad: ["a"], lat: 0, lon: 0, lvl: 1 },
		]);
		expect(m.x).toBeCloseTo(480, 5);
		expect(m.y).toBeCloseTo(240, 5);
	});
});
