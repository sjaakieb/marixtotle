import { describe, expect, it } from "vitest";
import { FLAT_ROUND_SIZE, nextFlatOffset, takeFlatRound } from "./flat-rounds";

describe("flat practice rounds", () => {
	it("serves consecutive non-overlapping rounds", () => {
		const order = Array.from({ length: 50 }, (_, i) => `q${i}`);
		const seen: string[] = [];
		let offset = 0;
		for (let round = 0; round < 5; round++) {
			const items = takeFlatRound(order, offset);
			expect(items).toHaveLength(FLAT_ROUND_SIZE);
			seen.push(...items);
			offset = nextFlatOffset(offset, FLAT_ROUND_SIZE, order.length).offset;
		}
		// All 50 covered exactly once, then the cycle wraps to 0.
		expect(new Set(seen).size).toBe(50);
		expect(offset).toBe(0);
	});

	it("wraps with a flag when the set is exhausted", () => {
		expect(nextFlatOffset(40, 10, 50)).toEqual({
			offset: 0,
			wrapped: true,
		});
		expect(nextFlatOffset(0, 10, 50)).toEqual({
			offset: 10,
			wrapped: false,
		});
	});

	it("handles sets smaller than one round", () => {
		expect(takeFlatRound(["a", "b", "c"], 0)).toEqual(["a", "b", "c"]);
		expect(nextFlatOffset(0, 10, 3)).toEqual({ offset: 0, wrapped: true });
	});

	it("handles empty sets without crashing", () => {
		expect(takeFlatRound([], 0)).toEqual([]);
		expect(nextFlatOffset(0, 10, 0)).toEqual({ offset: 0, wrapped: false });
	});
});
