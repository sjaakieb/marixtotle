// Vliegkaart-renderers, geport uit Topokopter (map/continents.ts + map/views.ts).
// Alleen het vliegbeeld (camera-volgend, zonder verklap-stip) en de minimap;
// de statische quizkaart leeft in components/TopoMap.tsx.
import { BORDERS } from "./geoBorders";
import { LAND } from "./geoLand";
import { HELI_SCHERMGROOTTE, tekenHeliPixel } from "./heli-sprite";

/** Wereld-coördinatenruimte van de kaart (equirectangulair). */
export const WERELD_BREEDTE = 960;
export const WERELD_HOOGTE = 480;

const W = WERELD_BREEDTE;
const H = WERELD_HOOGTE;

export interface WereldPunt {
	x: number;
	y: number;
}

export function project(lat: number, lon: number): WereldPunt {
	return {
		x: ((lon + 180) / 360) * W,
		y: ((90 - lat) / 180) * H,
	};
}

/** Gedeelde kaart-statustypen (camera, heli, reveal-markering). */
export interface Camera {
	cx: number;
	cy: number;
	zoom: number;
}

export interface HeliState {
	x: number;
	y: number;
	vx: number;
	vy: number;
}

/** Tijdelijke markering ná landen/tijd-op (wereld-coördinaten). */
export interface Reveal {
	x: number;
	y: number;
	kleur: string;
	naam: string;
	t0: number;
}

export interface FlyStad {
	lat: number;
	lon: number;
}

export type NaarScherm = (w: number) => number;

/** Kustlijnen als gevulde vlakken. Splitst ringen op de datumgrens (±180°),
 *  anders ontstaat één lange streep dwars over de kaart. */
export function tekenLand(
	c: CanvasRenderingContext2D,
	toX: NaarScherm,
	toY: NaarScherm,
	omlijn = true,
): void {
	for (const poly of LAND) {
		c.beginPath();
		for (const ring of poly) {
			let prevWx: number | null = null;
			for (let i = 0; i < ring.length; i++) {
				const lon = ring[i]?.[0] ?? 0;
				const lat = ring[i]?.[1] ?? 0;
				const wx = ((lon + 180) / 360) * W;
				const wy = ((90 - lat) / 180) * H;
				const sx = toX(wx);
				const sy = toY(wy);
				if (i === 0 || prevWx === null || Math.abs(wx - prevWx) > W / 2)
					c.moveTo(sx, sy);
				else c.lineTo(sx, sy);
				prevWx = wx;
			}
			c.closePath();
		}
		c.fill("evenodd");
		if (omlijn) c.stroke();
	}
}

/** Dunne landsgrenzen (losse lijnstukken, alleen stroken). Zelfde datumgrens-splitsing. */
export function tekenGrenzen(
	c: CanvasRenderingContext2D,
	toX: NaarScherm,
	toY: NaarScherm,
	lw: number,
): void {
	c.strokeStyle = "rgba(10,22,44,.55)";
	c.lineWidth = lw;
	c.beginPath();
	for (const lijn of BORDERS) {
		let prevWx: number | null = null;
		for (let i = 0; i < lijn.length; i++) {
			const lon = lijn[i]?.[0] ?? 0;
			const lat = lijn[i]?.[1] ?? 0;
			const wx = ((lon + 180) / 360) * W;
			const wy = ((90 - lat) / 180) * H;
			const sx = toX(wx);
			const sy = toY(wy);
			if (i === 0 || prevWx === null || Math.abs(wx - prevWx) > W / 2)
				c.moveTo(sx, sy);
			else c.lineTo(sx, sy);
			prevWx = wx;
		}
	}
	c.stroke();
}

export function raster(
	c: CanvasRenderingContext2D,
	toX: NaarScherm,
	toY: NaarScherm,
	x0: number,
	x1: number,
	y0: number,
	y1: number,
): void {
	c.strokeStyle = "rgba(120,150,255,.18)";
	c.lineWidth = 1;
	for (let lon = -180; lon <= 180; lon += 20) {
		const wx = ((lon + 180) / 360) * W;
		c.beginPath();
		c.moveTo(toX(wx), toY(y0));
		c.lineTo(toX(wx), toY(y1));
		c.stroke();
	}
	for (let lat = -60; lat <= 80; lat += 20) {
		const wy = ((90 - lat) / 180) * H;
		c.beginPath();
		c.moveTo(toX(x0), toY(wy));
		c.lineTo(toX(x1), toY(wy));
		c.stroke();
	}
}

export interface VliegOpties {
	steden: readonly FlyStad[];
	cam: Camera;
	heli: HeliState;
	reveal: Reveal | null;
	/** Bezochte verkeerde steden: kleine rode markeringen (zusje van Reveal). */
	fouten: readonly FouteMarkering[];
	koers: number;
	frame: number;
}

/** Bezochte verkeerde stad (wereld-coördinaten + label). */
export interface FouteMarkering {
	x: number;
	y: number;
	naam: string;
}

/** Kleine rode markering bij een bezochte verkeerde stad: ringetje, stip
 *  en kleine naam — de kleine variant van de reveal na landen/tijd-op. */
export function tekenFouten(
	ctx: CanvasRenderingContext2D,
	toX: NaarScherm,
	toY: NaarScherm,
	fouten: readonly FouteMarkering[],
	zoom: number,
): void {
	const zv = Math.min(zoom, 14);
	// Ongeveer half zo groot als de reveal-tekst, minimaal leesbaar.
	const fs = Math.max(10, Math.round((14 + zv * 2) * 0.45));
	ctx.textAlign = "center";
	for (const f of fouten) {
		const x = toX(f.x);
		const y = toY(f.y);
		ctx.strokeStyle = "rgba(255,89,100,.9)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(x, y, 11, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = "#ff5964";
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(x, y, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.font = `bold ${fs}px monospace`;
		const ly = y + 21;
		ctx.lineWidth = 3;
		ctx.strokeStyle = "rgba(0,0,0,.8)";
		ctx.strokeText(f.naam, x, ly);
		ctx.fillStyle = "#fff";
		ctx.fillText(f.naam, x, ly);
	}
}

/** Vliegbeeld: géén verklap-stip; camera volgt de heli; reveal pas ná landen/tijd-op. */
export function renderFly(
	ctx: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	mctx: CanvasRenderingContext2D,
	mini: HTMLCanvasElement,
	o: VliegOpties,
): void {
	const cw = canvas.width;
	const ch = canvas.height;
	const toX = (wx: number): number => (wx - o.cam.cx) * o.cam.zoom + cw / 2;
	const toY = (wy: number): number => (wy - o.cam.cy) * o.cam.zoom + ch / 2;
	const x0 = o.cam.cx - cw / 2 / o.cam.zoom;
	const x1 = o.cam.cx + cw / 2 / o.cam.zoom;
	const y0 = o.cam.cy - ch / 2 / o.cam.zoom;
	const y1 = o.cam.cy + ch / 2 / o.cam.zoom;
	const g = ctx.createLinearGradient(0, 0, 0, ch);
	g.addColorStop(0, "#071233");
	g.addColorStop(1, "#040a24");
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, cw, ch);
	raster(
		ctx,
		toX,
		toY,
		Math.max(0, x0),
		Math.min(W, x1),
		Math.max(0, y0),
		Math.min(H, y1),
	);
	ctx.fillStyle = "#2e6b4f";
	ctx.strokeStyle = "rgba(0,0,0,.65)";
	ctx.lineWidth = 1.5;
	tekenLand(ctx, toX, toY);
	tekenGrenzen(ctx, toX, toY, 1.2);
	// alle steden identiek — het doel licht NIET op
	const inBeeld = o.steden.filter((d) => {
		const p = project(d.lat, d.lon);
		return p.x > x0 - 20 && p.x < x1 + 20 && p.y > y0 - 20 && p.y < y1 + 20;
	});
	ctx.fillStyle = "rgba(235,240,255,.9)";
	ctx.strokeStyle = "rgba(0,0,0,.7)";
	ctx.lineWidth = 1;
	for (const d of inBeeld) {
		const p = project(d.lat, d.lon);
		ctx.beginPath();
		ctx.arc(toX(p.x), toY(p.y), 7, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
	// kleine markeringen bij bezochte verkeerde steden (blijven staan tot de volgende vraag)
	if (o.fouten.length > 0) tekenFouten(ctx, toX, toY, o.fouten, o.cam.zoom);
	// reveal-ring ná afloop (leren waar het was)
	if (o.reveal) {
		const age = (Date.now() - o.reveal.t0) / 1000;
		const zv = Math.min(o.cam.zoom, 14); // groeit niet eindeloos mee met diepe zoom
		const rr = (10 + age * 22) * zv * 0.35;
		ctx.strokeStyle = o.reveal.kleur;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(toX(o.reveal.x), toY(o.reveal.y), rr, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = o.reveal.kleur;
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(toX(o.reveal.x), toY(o.reveal.y), 10, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.font = `bold ${Math.round(14 + zv * 2)}px monospace`;
		ctx.textAlign = "center";
		const ly = toY(o.reveal.y) - 14 * zv * 0.5;
		ctx.lineWidth = 4;
		ctx.strokeStyle = "rgba(0,0,0,.8)";
		ctx.strokeText(o.reveal.naam, toX(o.reveal.x), ly);
		ctx.fillStyle = "#fff";
		ctx.fillText(o.reveal.naam, toX(o.reveal.x), ly);
	}
	// heli (retro pixel-bovenaanzicht, vaste schermgrootte) + spoor
	const hx = toX(o.heli.x);
	const hy = toY(o.heli.y);
	ctx.fillStyle = "rgba(63,242,255,.45)";
	ctx.beginPath();
	ctx.arc(
		hx - o.heli.vx * o.cam.zoom * 3,
		hy - o.heli.vy * o.cam.zoom * 3,
		4,
		0,
		Math.PI * 2,
	);
	ctx.fill();
	tekenHeliPixel(ctx, hx, hy, HELI_SCHERMGROOTTE, o.koers, o.frame);
	renderMinimap(mctx, mini, canvas, o);
}

/** Overzichtskaartje rechtsboven: géén doelmarkering, alleen eigen positie + camerakader. */
export function renderMinimap(
	mctx: CanvasRenderingContext2D,
	mini: HTMLCanvasElement,
	canvas: HTMLCanvasElement,
	o: Pick<VliegOpties, "steden" | "cam" | "heli">,
): void {
	const mw = mini.width;
	const mh = mini.height;
	const sx = (x: number): number => (x / W) * mw;
	const sy = (y: number): number => (y / H) * mh;
	mctx.fillStyle = "#06102e";
	mctx.fillRect(0, 0, mw, mh);
	mctx.fillStyle = "#2e6b4f";
	tekenLand(mctx, sx, sy, false);
	mctx.fillStyle = "rgba(235,240,255,.85)";
	for (const d of o.steden) {
		const p = project(d.lat, d.lon);
		mctx.fillRect(sx(p.x) - 1, sy(p.y) - 1, 2, 2);
	}
	const vw = canvas.width / o.cam.zoom;
	const vh = canvas.height / o.cam.zoom;
	mctx.strokeStyle = "#3ff2ff";
	mctx.lineWidth = 2;
	mctx.strokeRect(
		sx(o.cam.cx - vw / 2),
		sy(o.cam.cy - vh / 2),
		(vw / W) * mw,
		(vh / H) * mh,
	);
	const hp = { x: sx(o.heli.x), y: sy(o.heli.y) };
	mctx.fillStyle = "#fff";
	mctx.strokeStyle = "#000";
	mctx.lineWidth = 2;
	mctx.beginPath();
	mctx.arc(hp.x, hp.y, 5, 0, Math.PI * 2);
	mctx.fill();
	mctx.stroke();
	mctx.fillStyle = "#3ff2ff";
	mctx.font = "bold 13px monospace";
	mctx.textAlign = "left";
	mctx.fillText("OVERZICHT", 8, 16);
}
