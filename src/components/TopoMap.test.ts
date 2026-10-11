import { describe, expect, it } from "vitest";
import { computeView, type MapDot } from "./TopoMap";

// Hoofdsteden per Topokopter-level (steekproef met extremen).
const amerika: MapDot[] = [
	{ lat: 45.42, lon: -75.7 }, // Canada
	{ lat: 19.43, lon: -99.13 }, // Mexico
	{ lat: -34.6, lon: -58.38 }, // Argentinië
];
const afrika: MapDot[] = [
	{ lat: 34.02, lon: -6.84 }, // Marokko
	{ lat: -33.92, lon: 18.42 }, // Zuid-Afrika
	{ lat: -1.29, lon: 36.82 }, // Kenia
];
const middenOosten: MapDot[] = [
	{ lat: 39.93, lon: 32.85 }, // Turkije
	{ lat: 33.68, lon: 73.04 }, // Pakistan
];
const azieOceanie: MapDot[] = [
	{ lat: 28.61, lon: 77.2 }, // India
	{ lat: -41.28, lon: 174.77 }, // Nieuw-Zeeland
];
const examen = [...amerika, ...afrika, ...middenOosten, ...azieOceanie];

function containsAll(
	view: { x0: number; y0: number; x1: number; y1: number },
	dots: MapDot[],
): boolean {
	return dots.every((d) => {
		const wx = ((d.lon + 180) / 360) * 960;
		const wy = ((90 - d.lat) / 180) * 480;
		return (
			wx >= view.x0 - 1 &&
			wx <= view.x1 + 1 &&
			wy >= view.y0 - 1 &&
			wy <= view.y1 + 1
		);
	});
}

describe("computeView", () => {
	it("toont de hele wereld zonder stippen", () => {
		expect(computeView([])).toEqual({ x0: 0, y0: 0, x1: 960, y1: 480 });
	});

	it.each([
		["amerika", amerika],
		["afrika", afrika],
		["midden-oosten", middenOosten],
		["azië/oceanië", azieOceanie],
		["examen", examen],
	])(
		"%s: alle stippen in beeld, 2:1-verhouding, binnen de wereld",
		(_n, dots) => {
			const view = computeView(dots);
			expect(containsAll(view, dots)).toBe(true);
			expect((view.x1 - view.x0) / (view.y1 - view.y0)).toBeCloseTo(2, 5);
			expect(view.x0).toBeGreaterThanOrEqual(0);
			expect(view.y0).toBeGreaterThanOrEqual(0);
			expect(view.x1).toBeLessThanOrEqual(960);
			expect(view.y1).toBeLessThanOrEqual(480);
		},
	);

	it("zoomt regio's duidelijk in ten opzichte van de wereld", () => {
		// Midden-Oosten is de kleinste regio: verreweg het diepst ingezoomd.
		const mo = computeView(middenOosten);
		expect(mo.x1 - mo.x0).toBeLessThan(960 / 2);
		// Amerika en Afrika: merkbaar ingezoomd maar ruimer dan Midden-Oosten.
		expect(computeView(amerika).x1 - computeView(amerika).x0).toBeLessThan(960);
		expect(computeView(afrika).x1 - computeView(afrika).x0).toBeLessThan(960);
		expect(
			computeView(middenOosten).x1 - computeView(middenOosten).x0,
		).toBeLessThan(computeView(afrika).x1 - computeView(afrika).x0);
	});
});
