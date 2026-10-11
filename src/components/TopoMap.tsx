"use client";

import { useEffect, useMemo, useRef } from "react";
import { BORDERS } from "@/topo/geoBorders";
import { LAND } from "@/topo/geoLand";

/** Wereld-coördinatenruimte (equirectangulair, port van Topokopter). */
const W = 960;
const H = 480;
/** Wereldpixels per graad (gelijk op x en y, dus geen vervorming). */
const PX_PER_DEG = W / 360;

export type MapDot = { lat: number; lon: number };

function lonToWx(lon: number): number {
	return ((lon + 180) / 360) * W;
}

function latToWy(lat: number): number {
	return ((90 - lat) / 180) * H;
}

type View = { x0: number; y0: number; x1: number; y1: number };

function clamp(v: number, lo: number, hi: number): number {
	return Math.min(hi, Math.max(lo, v));
}

/**
 * Zoom de kaart in op de getoonde plaatsen: bounding box van alle stippen
 * met 8° marge, opgerekt tot de 2:1-beeldverhouding en begrensd tot de
 * wereld. Per hoofdstuk dus automatisch de eigen regio (Amerika, Afrika,
 * Midden-Oosten, Azië/Oceanië, of bijna-volledig bij het examen).
 */
export function computeView(points: MapDot[]): View {
	if (points.length === 0) return { x0: 0, y0: 0, x1: W, y1: H };
	let lonMin = 180;
	let lonMax = -180;
	let latMin = 90;
	let latMax = -90;
	for (const p of points) {
		if (p.lon < lonMin) lonMin = p.lon;
		if (p.lon > lonMax) lonMax = p.lon;
		if (p.lat < latMin) latMin = p.lat;
		if (p.lat > latMax) latMax = p.lat;
	}
	const PAD = 8;
	let lonSpan = Math.max(lonMax - lonMin + PAD * 2, 30);
	let latSpan = Math.max(latMax - latMin + PAD * 2, 15);
	// Beeld is 2:1 en graden zijn vierkant → lonSpan is exact 2× latSpan.
	if (lonSpan < latSpan * 2) lonSpan = latSpan * 2;
	else latSpan = lonSpan / 2;
	let lonC = (lonMin + lonMax) / 2;
	let latC = (latMin + latMax) / 2;
	if (lonSpan >= 360) {
		lonC = 0;
		lonSpan = 360;
	} else {
		lonC = clamp(lonC, -180 + lonSpan / 2, 180 - lonSpan / 2);
	}
	if (latSpan >= 180) {
		latC = 0;
		latSpan = 180;
	} else {
		latC = clamp(latC, -90 + latSpan / 2, 90 - latSpan / 2);
	}
	return {
		x0: lonToWx(lonC - lonSpan / 2),
		y0: latToWy(latC + latSpan / 2),
		x1: lonToWx(lonC + lonSpan / 2),
		y1: latToWy(latC - latSpan / 2),
	};
}

type ToScreen = (w: number) => number;

/** Kustlijnen als gevulde vlakken, met datumgrens-splitsing. */
function drawLand(
	c: CanvasRenderingContext2D,
	sx: ToScreen,
	sy: ToScreen,
): void {
	for (const poly of LAND) {
		c.beginPath();
		for (const ring of poly) {
			let prevWx: number | null = null;
			for (let i = 0; i < ring.length; i++) {
				const lon = ring[i]?.[0] ?? 0;
				const lat = ring[i]?.[1] ?? 0;
				const wx = lonToWx(lon);
				const wy = latToWy(lat);
				if (i === 0 || prevWx === null || Math.abs(wx - prevWx) > W / 2)
					c.moveTo(sx(wx), sy(wy));
				else c.lineTo(sx(wx), sy(wy));
				prevWx = wx;
			}
			c.closePath();
		}
		c.fill("evenodd");
		c.stroke();
	}
}

function drawBorders(
	c: CanvasRenderingContext2D,
	sx: ToScreen,
	sy: ToScreen,
): void {
	c.strokeStyle = "rgba(10,22,44,.55)";
	c.lineWidth = 1;
	c.beginPath();
	for (const lijn of BORDERS) {
		let prevWx: number | null = null;
		for (let i = 0; i < lijn.length; i++) {
			const lon = lijn[i]?.[0] ?? 0;
			const lat = lijn[i]?.[1] ?? 0;
			const wx = lonToWx(lon);
			const wy = latToWy(lat);
			if (i === 0 || prevWx === null || Math.abs(wx - prevWx) > W / 2)
				c.moveTo(sx(wx), sy(wy));
			else c.lineTo(sx(wx), sy(wy));
			prevWx = wx;
		}
	}
	c.stroke();
}

function drawGrid(
	c: CanvasRenderingContext2D,
	sx: ToScreen,
	sy: ToScreen,
	view: View,
): void {
	// Grover raster bij ver uitgezoomd, fijner bij diep ingezoomd.
	const degW = (view.x1 - view.x0) / PX_PER_DEG;
	const step = degW > 200 ? 20 : degW > 100 ? 10 : 5;
	const lon0 = view.x0 / PX_PER_DEG - 180;
	const lon1 = view.x1 / PX_PER_DEG - 180;
	const latTop = 90 - view.y0 / PX_PER_DEG;
	const latBottom = 90 - view.y1 / PX_PER_DEG;
	c.strokeStyle = "rgba(120,150,255,.18)";
	c.lineWidth = 1;
	for (let lon = Math.ceil(lon0 / step) * step; lon <= lon1; lon += step) {
		const x = sx(lonToWx(lon));
		c.beginPath();
		c.moveTo(x, 0);
		c.lineTo(x, H);
		c.stroke();
	}
	for (
		let lat = Math.ceil(latBottom / step) * step;
		lat <= latTop;
		lat += step
	) {
		const y = sy(latToWy(lat));
		c.beginPath();
		c.moveTo(0, y);
		c.lineTo(W, y);
		c.stroke();
	}
}

type Props = {
	/** Context-stippen (alle hoofdsteden van het hoofdstuk), zonder nadruk. */
	dots?: MapDot[];
	/**
	 * Uitgelichte hoofdstad. Vóór het antwoord alleen tonen bij
	 * hoofdstad→land (continent-hint); ná het antwoord altijd (reveal).
	 */
	highlight?: (MapDot & { label?: string }) | null;
	className?: string;
};

export function TopoMap({ dots = [], highlight = null, className }: Props) {
	const ref = useRef<HTMLCanvasElement>(null);

	const hLat = highlight?.lat;
	const hLon = highlight?.lon;
	const hLabel = highlight?.label;
	const view = useMemo(
		() =>
			computeView(
				hLat !== undefined && hLon !== undefined
					? [...dots, { lat: hLat, lon: hLon }]
					: dots,
			),
		[dots, hLat, hLon],
	);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = W * dpr;
		canvas.height = H * dpr;
		ctx.scale(dpr, dpr);

		const sx = (wx: number) => ((wx - view.x0) / (view.x1 - view.x0)) * W;
		const sy = (wy: number) => ((wy - view.y0) / (view.y1 - view.y0)) * H;

		ctx.fillStyle = "#06102e";
		ctx.fillRect(0, 0, W, H);
		drawGrid(ctx, sx, sy, view);
		ctx.fillStyle = "#2e6b4f";
		ctx.strokeStyle = "rgba(0,0,0,.6)";
		ctx.lineWidth = 1;
		drawLand(ctx, sx, sy);
		drawBorders(ctx, sx, sy);

		ctx.fillStyle = "rgba(230,236,255,.8)";
		for (const d of dots) {
			const x = sx(lonToWx(d.lon));
			const y = sy(latToWy(d.lat));
			ctx.beginPath();
			ctx.arc(x, y, 5, 0, Math.PI * 2);
			ctx.fill();
		}

		if (hLat !== undefined && hLon !== undefined) {
			const x = sx(lonToWx(hLon));
			const y = sy(latToWy(hLat));
			ctx.fillStyle = "rgba(255,210,63,.22)";
			ctx.beginPath();
			ctx.arc(x, y, 21, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#ffd23f";
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(x, y, 9, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			if (hLabel) {
				ctx.font = "bold 15px monospace";
				ctx.textAlign = "center";
				ctx.lineWidth = 4;
				ctx.strokeStyle = "rgba(0,0,0,.85)";
				const ly = Math.min(y + 28, H - 8);
				ctx.strokeText(hLabel, x, ly);
				ctx.fillStyle = "#fff";
				ctx.fillText(hLabel, x, ly);
			}
		}
	}, [dots, view, hLat, hLon, hLabel]);

	return (
		<canvas
			ref={ref}
			role="img"
			aria-label={
				hLabel ? `Kaart met ${hLabel} uitgelicht` : "Kaart met hoofdsteden"
			}
			className={className ?? "h-auto w-full"}
			style={{ aspectRatio: "2 / 1" }}
		/>
	);
}
