import { describe, expect, it } from "vitest";
import { dempFaktor, frameStap, volgFaktor } from "./fly-fysica";

describe("frameStap", () => {
	it("geeft één tik bij de eerste aanroep", () => {
		expect(frameStap(1000, null)).toEqual({ stap: 1, laatste: 1000 });
	});

	it("schaalt met de echte frametijd (60/30/120fps)", () => {
		expect(frameStap(1016.667, 1000).stap).toBeCloseTo(1, 2);
		expect(frameStap(1033.333, 1000).stap).toBeCloseTo(2, 2);
		expect(frameStap(1008.333, 1000).stap).toBeCloseTo(0.5, 2);
	});

	it("begrenst haperingen op 0,1s (geen teleportatie na tabwissel)", () => {
		expect(frameStap(2000, 1000).stap).toBe(6);
		expect(frameStap(900, 1000).stap).toBe(0);
	});
});

describe("dempFaktor", () => {
	it("60 tikken van 1 == 30 tikken van 2 == 1 tik van 60", () => {
		const perTik60 = dempFaktor(0.94, 1) ** 60;
		const perTik30 = dempFaktor(0.94, 2) ** 30;
		expect(perTik60).toBeCloseTo(dempFaktor(0.94, 60), 12);
		expect(perTik30).toBeCloseTo(dempFaktor(0.94, 60), 12);
	});
});

describe("volgFaktor", () => {
	it("één tik geeft exact k, meer tikken naderen 1", () => {
		expect(volgFaktor(0.12, 1)).toBeCloseTo(0.12, 12);
		// 60 tikken van 1 == 1 tik van 60 (zelfde camera, elke framerate).
		const perTik = 1 - (1 - volgFaktor(0.12, 1)) ** 60;
		expect(perTik).toBeCloseTo(volgFaktor(0.12, 60), 12);
		expect(volgFaktor(0.08, 100)).toBeGreaterThan(0.999);
	});
});
