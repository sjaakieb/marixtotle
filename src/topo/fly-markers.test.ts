import { describe, expect, it } from "vitest";
import { type FouteMarkering, renderFly, tekenFouten } from "./fly-map";

type Call = { methode: string; args: unknown[] };

function mockCtx(): {
	ctx: CanvasRenderingContext2D;
	calls: Call[];
} {
	const calls: Call[] = [];
	const ctx = {
		calls,
		createLinearGradient: () => ({ addColorStop: () => undefined }),
	} as unknown as CanvasRenderingContext2D & { calls: Call[] };
	for (const m of [
		"fillRect",
		"beginPath",
		"moveTo",
		"lineTo",
		"closePath",
		"fill",
		"stroke",
		"arc",
		"strokeText",
		"fillText",
		"strokeRect",
		"save",
		"restore",
		"translate",
		"rotate",
	]) {
		(ctx as unknown as Record<string, unknown>)[m] = (...args: unknown[]) =>
			calls.push({ methode: m, args });
	}
	return { ctx, calls };
}

function mockCanvas(w: number, h: number): HTMLCanvasElement {
	return { width: w, height: h } as HTMLCanvasElement;
}

function teksten(calls: Call[]): string[] {
	return calls
		.filter((c) => c.methode === "fillText")
		.map((c) => String(c.args[0]));
}

const MARKERS: FouteMarkering[] = [
	{ x: 480, y: 240, naam: "Rabat (Marokko)" },
	{ x: 500, y: 250, naam: "Algiers (Algerije)" },
];

const BASIS = {
	steden: [{ lat: 34.02, lon: -6.84 }],
	cam: { cx: 480, cy: 240, zoom: 8 },
	heli: { x: 480, y: 240, vx: 0, vy: 0 },
	reveal: null,
	koers: 0,
	frame: 1,
};

describe("tekenFouten", () => {
	it("tekent per marker een ring, stip en label", () => {
		const { ctx, calls } = mockCtx();
		tekenFouten(
			ctx,
			(w) => w,
			(w) => w,
			MARKERS,
			8,
		);
		const namen = teksten(calls);
		expect(namen).toContain("Rabat (Marokko)");
		expect(namen).toContain("Algiers (Algerije)");
		const stralen = calls
			.filter((c) => c.methode === "arc")
			.map((c) => c.args[2]);
		expect(stralen).toContain(11);
		expect(stralen).toContain(5);
	});

	it("doet niets zonder markers", () => {
		const { ctx, calls } = mockCtx();
		tekenFouten(
			ctx,
			(w) => w,
			(w) => w,
			[],
			8,
		);
		expect(calls).toEqual([]);
	});
});

describe("renderFly met fouten", () => {
	it("toont de markerlabels op de hoofdkaart, niet op de minimap", () => {
		const hoofd = mockCtx();
		const mini = mockCtx();
		renderFly(hoofd.ctx, mockCanvas(960, 480), mini.ctx, mockCanvas(460, 230), {
			...BASIS,
			fouten: [MARKERS[0] as FouteMarkering],
		});
		expect(teksten(hoofd.calls)).toContain("Rabat (Marokko)");
		expect(teksten(mini.calls)).not.toContain("Rabat (Marokko)");
	});

	it("toont geen labels zonder fouten of reveal", () => {
		const hoofd = mockCtx();
		renderFly(
			hoofd.ctx,
			mockCanvas(960, 480),
			mockCtx().ctx,
			mockCanvas(460, 230),
			{
				...BASIS,
				fouten: [],
			},
		);
		expect(teksten(hoofd.calls)).toEqual([]);
	});

	it("markertekst is kleiner dan de revealtekst", () => {
		const gezien: string[] = [];
		const { ctx, calls } = mockCtx();
		let letter = "";
		Object.defineProperty(ctx, "font", {
			set(v: string) {
				letter = v;
				gezien.push(v);
			},
			get: () => letter,
		});
		renderFly(ctx, mockCanvas(960, 480), mockCtx().ctx, mockCanvas(460, 230), {
			...BASIS,
			reveal: {
				x: 480,
				y: 240,
				kleur: "#3ddc84",
				naam: "Oslo (Noorwegen)",
				t0: Date.now(),
			},
			fouten: [MARKERS[0] as FouteMarkering],
		});
		const px = (f: string): number => Number(/(\d+)px/.exec(f)?.[1] ?? 0);
		// Volgorde: eerst fouten (klein), daarna reveal (groot).
		expect(gezien.length).toBeGreaterThanOrEqual(2);
		const kleinste = Math.min(...gezien.map(px));
		const grootste = Math.max(...gezien.map(px));
		expect(kleinste).toBeGreaterThanOrEqual(10);
		expect(kleinste).toBeLessThan(grootste);
		expect(teksten(calls)).toContain("Rabat (Marokko)");
		expect(teksten(calls)).toContain("Oslo (Noorwegen)");
	});
});
