import { describe, expect, it } from "vitest";
import { buildQuestionAtLevel, type Level } from "./levels";
import type { MasteryItem, TopoItem } from "./words";

const items: MasteryItem[] = [
	{
		kind: "topo",
		key: "topo-1",
		country: "Canada",
		capitals: ["Ottawa"],
		lat: 45.42,
		lon: -75.7,
	},
	{
		kind: "topo",
		key: "topo-2",
		country: "Mexico",
		capitals: ["Mexico-Stad", "Mexico Stad"],
		lat: 19.43,
		lon: -99.13,
	},
	{
		kind: "topo",
		key: "topo-3",
		country: "Peru",
		capitals: ["Lima"],
		lat: -12.04,
		lon: -77.04,
	},
	{
		kind: "topo",
		key: "topo-4",
		country: "Chili",
		capitals: ["Santiago"],
		lat: -33.44,
		lon: -70.66,
	},
];

function topo(key: string): TopoItem {
	const it = items.find((i) => i.key === key);
	if (!it || it.kind !== "topo") throw new Error(`missing ${key}`);
	return it;
}

describe("buildTopoQuestion", () => {
	it("L1 is meerkeuze land → hoofdstad met 4 opties", () => {
		const q = buildQuestionAtLevel(topo("topo-1"), 1 as Level, items);
		expect(q.kind).toBe("topo");
		expect(q.topoAsk).toBe("capital");
		expect(q.prompt).toBe("Wat is de hoofdstad van Canada?");
		expect(q.answer).toBe("Ottawa");
		expect(q.options).toHaveLength(4);
		expect(q.options).toContain("Ottawa");
		expect(q.lat).toBe(45.42);
	});

	it("L2 is meerkeuze hoofdstad → land met 4 opties", () => {
		const q = buildQuestionAtLevel(topo("topo-2"), 2 as Level, items);
		expect(q.topoAsk).toBe("country");
		expect(q.prompt).toBe("Van welk land is Mexico-Stad de hoofdstad?");
		expect(q.answer).toBe("Mexico");
		expect(q.options).toHaveLength(4);
		expect(q.options).toContain("Mexico");
	});

	it("L3/L4/L5 zijn typenvragen zonder hint", () => {
		const l3 = buildQuestionAtLevel(topo("topo-1"), 3 as Level, items);
		expect(l3.options).toBeUndefined();
		expect(l3.topoAsk).toBe("capital");
		expect(l3.showHint).toBe(false);
		expect(l3.hint).toBeUndefined();

		const l4 = buildQuestionAtLevel(topo("topo-1"), 4 as Level, items);
		expect(l4.topoAsk).toBe("country");
		expect(l4.showHint).toBe(false);
		expect(l4.hint).toBeUndefined();

		const l5 = buildQuestionAtLevel(topo("topo-1"), 5 as Level, items);
		expect(l5.options).toBeUndefined();
		expect(l5.showHint).toBe(false);
	});

	it("neemt aliassen mee als alternatives", () => {
		const q = buildQuestionAtLevel(topo("topo-2"), 3 as Level, items);
		expect(q.answer).toBe("Mexico-Stad");
		expect(q.alternatives).toEqual(["Mexico Stad"]);
	});
});
