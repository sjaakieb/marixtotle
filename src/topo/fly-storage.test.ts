import { describe, expect, it } from "vitest";
import { bestKey, getBest, type Store, setBest } from "./fly-storage";

function fakeStore(): Store & { data: Map<string, string> } {
	const data = new Map<string, string>();
	return {
		data,
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => {
			data.set(k, v);
		},
	};
}

describe("fly-storage", () => {
	it("gebruikt één mix-key per level (geen richting meer)", () => {
		expect(bestKey(1)).toBe("topokopter_best_heli_lvl1_mix");
		expect(bestKey(5)).toBe("topokopter_best_heli_lvl5_mix");
	});

	it("leest 0 zonder score en bewaart alleen verbeteringen", () => {
		const s = fakeStore();
		expect(getBest(s, 2)).toBe(0);
		setBest(s, 2, 42);
		expect(getBest(s, 2)).toBe(42);
		setBest(s, 2, 10);
		expect(getBest(s, 2)).toBe(42);
	});
});
