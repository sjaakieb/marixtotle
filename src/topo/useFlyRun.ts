// Helikopter-engine: game-loop met camera/zoom, toetsenbord + slepen,
// landen-op-precisie, straffen, reveal, scores. Heli-only port van
// Topokopter (hooks/useTopoRun.ts); quizmodi (overhoring/meerkeuze)
// leven in Marixtotle al als normale opgaven.
import { useCallback, useEffect, useRef, useState } from "react";
import { cancelSpeech, speak } from "@/lib/speech";
import type { Camera, HeliState, Reveal } from "./fly-map";
import {
	WERELD_HOOGTE as H,
	project,
	renderFly,
	WERELD_BREEDTE as W,
} from "./fly-map";
import {
	type FlyItem,
	type FlyRichting,
	flyOordeelBijPct,
	flySpeelveldMidden,
	flyVraagNaam,
	flyVragenVoorLevel,
	volgendeRichting,
} from "./fly-quiz";
import {
	flyAfkeurGeluid,
	flyFoutGeluid,
	flyGoedGeluid,
	flyStartGeluid,
} from "./fly-sounds";
import { getBest, setBest } from "./fly-storage";
import {
	DEMPING,
	DICHTBIJ_AAN,
	DICHTBIJ_UIT,
	DIEP_AAN,
	DIEP_UIT,
	DRUK_CLUSTER_AFSTAND,
	FREEZE_TIJDOP_MS,
	heliSnelheid,
	heliTijdVoorLevel,
	heliZoom,
	LANDINGS_RADIUS_SCHERM_PX,
	PAUZE_LANDING_MS,
	SNELHEID_ZOOM_VLOER,
	STRAF_MIN_REST,
	STRAF_SECONDEN,
	STUW_FRAMES,
	VERSNELLING_SLEEP,
	VERSNELLING_TOETS,
	VRIJSTELLING_CLUSTER_PX,
	VRIJSTELLING_START_PX,
	WAARSCHUW_RADIUS_SCHERM_PX,
	ZOOM_DICHTBIJ,
	ZOOM_DIEP,
	ZOOM_LERP_IN,
	ZOOM_LERP_UIT,
} from "./fly-tuning";
import { kwantiseerKoers } from "./heli-sprite";

export interface FlyInstellingen {
	level: number;
}

export interface FlyHud {
	levelLabel: string;
	vraagNr: number;
	totaal: number;
	score: number;
	tijdTekst: string;
	timerFractie: number;
	best: number;
}

export interface FlyVraag {
	item: FlyItem;
	/** Gevraagde naam (land of hoofdstad, afhankelijk van de vraagrichting). */
	naam: string;
	/** Richting van deze vraag (elke vlucht mixt beide kanten). */
	richting: FlyRichting;
	nr: number;
	totaal: number;
}

export interface FlyFeedback {
	text: string;
	ok: boolean;
}

export interface FlyKlaar {
	score: number;
	max: number;
	fouten: number;
	pct: number;
	oordeel: string;
	isBest: boolean;
}

interface Engine {
	reeks: FlyItem[];
	idx: number;
	score: number;
	fouten: number;
	target: FlyItem | null;
	prevTarget: FlyItem | null;
	/** Richting van de lopende vraag (per vraag gemixt, zie volgendeRichting). */
	vraagRichting: FlyRichting | null;
	reveal: Reveal | null;
	tijdOver: number;
	tijdMax: number;
	timer: ReturnType<typeof setInterval> | null;
	raf: number | null;
	heli: HeliState;
	cam: Camera;
	koers: number;
	frame: number;
	keys: Record<string, boolean>;
	drag: { doen: boolean; x: number; y: number };
	dichtbij: boolean;
	diep: boolean;
	thrustFrames: number;
	pauzeer: boolean;
	vrijgesteld: Set<number>;
	bezochtVerkeerd: Set<number>;
	druk: Set<number>;
	flying: boolean;
	settings: FlyInstellingen;
	items: FlyItem[];
	stage: HTMLDivElement | null;
	map: HTMLCanvasElement | null;
	mini: HTMLCanvasElement | null;
}

function nieuweEngine(settings: FlyInstellingen, items: FlyItem[]): Engine {
	return {
		reeks: [],
		idx: 0,
		score: 0,
		fouten: 0,
		target: null,
		prevTarget: null,
		vraagRichting: null,
		reveal: null,
		tijdOver: 0,
		tijdMax: 0,
		timer: null,
		raf: null,
		heli: { x: 480, y: 240, vx: 0, vy: 0 },
		cam: { cx: 480, cy: 240, zoom: 2.4 },
		koers: 0,
		frame: 0,
		keys: {},
		drag: { doen: false, x: 0, y: 0 },
		dichtbij: false,
		diep: false,
		thrustFrames: 0,
		pauzeer: false,
		vrijgesteld: new Set(),
		bezochtVerkeerd: new Set(),
		druk: new Set(),
		flying: false,
		settings,
		items,
		stage: null,
		map: null,
		mini: null,
	};
}

function mapCtx(
	map: HTMLCanvasElement | null,
): CanvasRenderingContext2D | null {
	return map?.getContext("2d") ?? null;
}

export function useFlyRun(allItems: FlyItem[], settings: FlyInstellingen) {
	const [hud, setHud] = useState<FlyHud>({
		levelLabel: "1",
		vraagNr: 0,
		totaal: 0,
		score: 0,
		tijdTekst: "–",
		timerFractie: 1,
		best: 0,
	});
	const [vraag, setVraag] = useState<FlyVraag | null>(null);
	const [feedback, setFeedback] = useState<FlyFeedback | null>(null);
	const [klaar, setKlaar] = useState<FlyKlaar | null>(null);
	const [vliegt, setVliegt] = useState(false);

	const eng = useRef<Engine>(nieuweEngine(settings, allItems));
	eng.current.settings = settings;
	eng.current.items = allItems;
	const hudRef = useRef(hud);
	hudRef.current = hud;

	// ---------- kleine helpers ----------
	const updateHud = useCallback(() => {
		const e = eng.current;
		let best = 0;
		try {
			best = getBest(localStorage, e.settings.level);
		} catch {
			/* noop */
		}
		setHud({
			levelLabel:
				e.settings.level === 5 ? "5 (examen)" : String(e.settings.level),
			vraagNr: Math.min(e.idx + 1, e.reeks.length),
			totaal: e.reeks.length,
			score: e.score,
			tijdTekst: hudRef.current.tijdTekst,
			timerFractie: hudRef.current.timerFractie,
			best,
		});
	}, []);

	const zetTijd = useCallback((tekst: string, fractie: number) => {
		setHud((h) => ({ ...h, tijdTekst: tekst, timerFractie: fractie }));
	}, []);

	const stopTimers = useCallback(() => {
		const e = eng.current;
		if (e.timer) {
			clearInterval(e.timer);
			e.timer = null;
		}
		if (e.raf) {
			cancelAnimationFrame(e.raf);
			e.raf = null;
		}
		e.pauzeer = false;
		try {
			cancelSpeech();
		} catch {
			/* noop */
		}
	}, []);

	const spreek = useCallback((tekst: string) => {
		// Stadsnamen worden altijd uitgesproken bij landen/tijd-op.
		try {
			speak(tekst, "nl-NL");
		} catch {
			/* noop */
		}
	}, []);

	// ---------- canvas-tekenen ----------
	const tekenVlieg = useCallback(() => {
		const e = eng.current;
		const ctx = mapCtx(e.map);
		const mctx = mapCtx(e.mini);
		if (!ctx || !mctx || !e.map || !e.mini) return;
		e.frame++;
		renderFly(ctx, e.map, mctx, e.mini, {
			steden: e.reeks,
			cam: e.cam,
			heli: e.heli,
			reveal: e.reveal,
			koers: e.koers,
			frame: e.frame,
		});
	}, []);

	// ---------- fly view ----------
	const clampCam = useCallback(() => {
		const e = eng.current;
		if (!e.map) return;
		const vw = e.map.width / e.cam.zoom;
		const vh = e.map.height / e.cam.zoom;
		e.cam.cx =
			vw >= W ? W / 2 : Math.max(vw / 2, Math.min(W - vw / 2, e.cam.cx));
		e.cam.cy =
			vh >= H ? H / 2 : Math.max(vh / 2, Math.min(H - vh / 2, e.cam.cy));
	}, []);

	const fitFlyCanvas = useCallback(() => {
		const e = eng.current;
		if (!e.flying || !e.map) return;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		e.map.width = Math.floor(window.innerWidth * dpr);
		e.map.height = Math.floor(window.innerHeight * dpr);
		clampCam();
	}, [clampCam]);

	const enterFlyView = useCallback(() => {
		const e = eng.current;
		e.flying = true;
		setVliegt(true);
		fitFlyCanvas();
		window.addEventListener("resize", fitFlyCanvas);
		try {
			e.stage?.requestFullscreen()?.catch(() => undefined);
		} catch {
			/* oude browser */
		}
		document.body.style.overflow = "hidden";
	}, [fitFlyCanvas]);

	const exitFlyView = useCallback(() => {
		const e = eng.current;
		e.flying = false;
		setVliegt(false);
		window.removeEventListener("resize", fitFlyCanvas);
		document.body.style.overflow = "";
		try {
			if (document.fullscreenElement)
				document.exitFullscreen()?.catch(() => undefined);
		} catch {
			/* oude browser */
		}
	}, [fitFlyCanvas]);

	// ---------- flow ----------
	const einde = useCallback(() => {
		const e = eng.current;
		stopTimers();
		if (e.flying) exitFlyView();
		const max = e.reeks.length * 10;
		const pct = max ? Math.round((e.score / max) * 100) : 0;
		const oordeel = flyOordeelBijPct(pct);
		setVraag(null);
		const wasBest = e.score > 0;
		let isBest = false;
		try {
			const oud = getBest(localStorage, e.settings.level);
			isBest = wasBest && e.score > oud;
			setBest(localStorage, e.settings.level, e.score);
		} catch {
			/* noop */
		}
		setKlaar({ score: e.score, max, fouten: e.fouten, pct, oordeel, isBest });
		setFeedback({ text: oordeel, ok: pct >= 50 });
		setHud((h) => ({ ...h, tijdTekst: "–", timerFractie: 1 }));
		if (pct >= 50) flyGoedGeluid();
		else flyFoutGeluid();
		updateHud();
	}, [exitFlyView, stopTimers, updateHud]);

	const startPauze = useCallback(
		(ms: number, daarna: () => void) => {
			const e = eng.current;
			const tot = Date.now() + ms;
			e.pauzeer = true;
			if (e.raf) cancelAnimationFrame(e.raf);
			const stap = (): void => {
				if (!e.pauzeer) return;
				e.heli.vx *= 0.96;
				e.heli.vy *= 0.96;
				e.heli.x = Math.max(4, Math.min(W - 4, e.heli.x + e.heli.vx));
				e.heli.y = Math.max(4, Math.min(H - 4, e.heli.y + e.heli.vy));
				e.cam.cx += (e.heli.x - e.cam.cx) * 0.12;
				e.cam.cy += (e.heli.y - e.cam.cy) * 0.12;
				clampCam();
				tekenVlieg();
				if (Date.now() < tot) {
					e.raf = requestAnimationFrame(stap);
				} else {
					e.pauzeer = false;
					daarna();
				}
			};
			e.raf = requestAnimationFrame(stap);
		},
		[clampCam, tekenVlieg],
	);

	const volgende = useCallback(
		(overgeslagen: boolean) => {
			const e = eng.current;
			stopTimers();
			e.reveal = null;
			if (overgeslagen && e.target) {
				e.fouten++;
				setFeedback({
					text: `Overgeslagen. Het was: ${e.target.hoofdstad.join(" / ")} (${e.target.land}).`,
					ok: false,
				});
			}
			if (e.idx >= e.reeks.length) {
				einde();
				return;
			}
			const item = e.reeks[e.idx];
			if (!item) {
				einde();
				return;
			}
			e.target = item;
			const vraagRichting = volgendeRichting(e.vraagRichting);
			e.vraagRichting = vraagRichting;
			setVraag({
				item,
				naam: flyVraagNaam(item, vraagRichting),
				richting: vraagRichting,
				nr: e.idx + 1,
				totaal: e.reeks.length,
			});
			updateHud();
			startHeliRef.current(item);
		},
		[einde, stopTimers, updateHud],
	);

	const startHeli = useCallback(
		(item: FlyItem) => {
			const e = eng.current;
			const level = e.settings.level;
			if (!e.prevTarget) {
				const m = flySpeelveldMidden(e.reeks);
				e.heli.x = m.x;
				e.heli.y = m.y;
				e.heli.vx = 0;
				e.heli.vy = 0;
				e.cam.cx = e.heli.x;
				e.cam.cy = e.heli.y;
				e.cam.zoom = heliZoom(level);
				clampCam();
				e.dichtbij = false;
				e.diep = false;
				e.thrustFrames = 0;
			}
			e.tijdMax = heliTijdVoorLevel(level);
			e.tijdOver = e.tijdMax;
			const pt = project(item.lat, item.lon);
			e.vrijgesteld = new Set([item.n]);
			for (const s of e.reeks) {
				const q = project(s.lat, s.lon);
				if (Math.hypot(pt.x - q.x, pt.y - q.y) < VRIJSTELLING_CLUSTER_PX)
					e.vrijgesteld.add(s.n);
				if (Math.hypot(e.heli.x - q.x, e.heli.y - q.y) < VRIJSTELLING_START_PX)
					e.vrijgesteld.add(s.n);
			}
			e.bezochtVerkeerd = new Set();
			e.druk = new Set();
			for (const a of e.reeks) {
				for (const b of e.reeks) {
					if (a.n === b.n) continue;
					const pa = project(a.lat, a.lon);
					const pb = project(b.lat, b.lon);
					if (Math.hypot(pa.x - pb.x, pa.y - pb.y) < DRUK_CLUSTER_AFSTAND) {
						e.druk.add(a.n);
						break;
					}
				}
			}
			zetTijd(`${e.tijdOver.toFixed(0)}s`, 1);
			const t0 = Date.now();
			e.timer = setInterval(() => {
				e.tijdOver -= 0.1;
				zetTijd(
					`${Math.max(0, e.tijdOver).toFixed(0)}s`,
					Math.max(0, e.tijdOver) / e.tijdMax,
				);
				if (e.tijdOver <= 0) {
					if (e.timer) {
						clearInterval(e.timer);
						e.timer = null;
					}
					e.fouten++;
					flyFoutGeluid();
					spreek(item.hoofdstad[0] ?? "");
					const p = project(item.lat, item.lon);
					e.reveal = {
						x: p.x,
						y: p.y,
						kleur: "#ff5964",
						naam: `${item.hoofdstad[0]} (${item.land})`,
						t0: Date.now(),
					};
					setFeedback({
						text: `⏰ Tijd op! Het was ${item.hoofdstad[0]} (${item.land}) — kijk op de kaart.`,
						ok: false,
					});
					e.cam.cx = p.x;
					e.cam.cy = p.y;
					clampCam();
					tekenVlieg();
					e.prevTarget = item;
					e.idx++;
					updateHud();
					if (e.raf) cancelAnimationFrame(e.raf);
					e.pauzeer = true;
					setTimeout(() => {
						if (e.pauzeer) {
							e.pauzeer = false;
							volgende(false);
						}
					}, FREEZE_TIJDOP_MS);
				}
			}, 100);

			if (e.raf) cancelAnimationFrame(e.raf);
			const loop = (): void => {
				if (!e.timer) return;
				const sp = heliSnelheid(level);
				const geeftGas = Boolean(
					e.keys.ArrowLeft ||
						e.keys.ArrowRight ||
						e.keys.ArrowUp ||
						e.keys.ArrowDown ||
						e.keys.a ||
						e.keys.d ||
						e.keys.w ||
						e.keys.s ||
						e.drag.doen,
				);
				if (geeftGas)
					e.thrustFrames = Math.min(STUW_FRAMES, e.thrustFrames + 1);
				else e.thrustFrames = 0;
				const stuw = Math.min(1, e.thrustFrames / STUW_FRAMES);
				if (e.keys.ArrowLeft || e.keys.a) e.heli.vx -= VERSNELLING_TOETS * stuw;
				if (e.keys.ArrowRight || e.keys.d)
					e.heli.vx += VERSNELLING_TOETS * stuw;
				if (e.keys.ArrowUp || e.keys.w) e.heli.vy -= VERSNELLING_TOETS * stuw;
				if (e.keys.ArrowDown || e.keys.s) e.heli.vy += VERSNELLING_TOETS * stuw;
				if (e.drag.doen) {
					e.heli.vx += (e.drag.x - e.heli.x) * VERSNELLING_SLEEP * stuw;
					e.heli.vy += (e.drag.y - e.heli.y) * VERSNELLING_SLEEP * stuw;
				}
				e.heli.vx *= DEMPING;
				e.heli.vy *= DEMPING;
				const effMax =
					sp *
					Math.min(
						1,
						Math.max(SNELHEID_ZOOM_VLOER, heliZoom(level) / e.cam.zoom),
					);
				const v = Math.hypot(e.heli.vx, e.heli.vy);
				if (v > effMax) {
					e.heli.vx *= effMax / v;
					e.heli.vy *= effMax / v;
				}
				e.heli.x = Math.max(4, Math.min(W - 4, e.heli.x + e.heli.vx));
				e.heli.y = Math.max(4, Math.min(H - 4, e.heli.y + e.heli.vy));
				let swx = 0;
				let swy = 0;
				if (e.keys.ArrowLeft || e.keys.a) swx -= 1;
				if (e.keys.ArrowRight || e.keys.d) swx += 1;
				if (e.keys.ArrowUp || e.keys.w) swy -= 1;
				if (e.keys.ArrowDown || e.keys.s) swy += 1;
				if (swx || swy) {
					e.koers = kwantiseerKoers(swx, swy);
				} else if (
					e.drag.doen &&
					Math.hypot(e.drag.x - e.heli.x, e.drag.y - e.heli.y) > 4
				) {
					e.koers = kwantiseerKoers(e.drag.x - e.heli.x, e.drag.y - e.heli.y);
				} else if (Math.hypot(e.heli.vx, e.heli.vy) > 0.15) {
					e.koers = kwantiseerKoers(e.heli.vx, e.heli.vy);
				}
				let dMin = 1e9;
				let dDicht = 1e9;
				for (const s of e.reeks) {
					const q = project(s.lat, s.lon);
					const dd = Math.hypot(e.heli.x - q.x, e.heli.y - q.y);
					if (dd < dMin) dMin = dd;
					if (e.druk.has(s.n) && dd < dDicht) dDicht = dd;
				}
				if (!e.dichtbij && dMin < DICHTBIJ_AAN) e.dichtbij = true;
				else if (e.dichtbij && dMin > DICHTBIJ_UIT) e.dichtbij = false;
				if (!e.diep && dDicht < DIEP_AAN) e.diep = true;
				else if (e.diep && (dDicht > DIEP_UIT || !e.dichtbij)) e.diep = false;
				const doelZoom = !e.dichtbij
					? heliZoom(level)
					: e.diep
						? ZOOM_DIEP
						: ZOOM_DICHTBIJ;
				const lerpStap = doelZoom < e.cam.zoom ? ZOOM_LERP_UIT : ZOOM_LERP_IN;
				e.cam.zoom += (doelZoom - e.cam.zoom) * lerpStap;
				if (Math.abs(doelZoom - e.cam.zoom) < 0.02) e.cam.zoom = doelZoom;
				e.cam.cx += (e.heli.x - e.cam.cx) * 0.12;
				e.cam.cy += (e.heli.y - e.cam.cy) * 0.12;
				clampCam();
				tekenVlieg();
				const p = project(item.lat, item.lon);
				const d = Math.hypot(e.heli.x - p.x, e.heli.y - p.y);
				const radius = LANDINGS_RADIUS_SCHERM_PX / e.cam.zoom;
				if (d < radius) {
					if (e.timer) {
						clearInterval(e.timer);
						e.timer = null;
					}
					const secs = (Date.now() - t0) / 1000;
					const punten = Math.max(
						4,
						Math.round(10 + Math.max(0, e.tijdOver) * 1.2),
					);
					e.score += punten;
					flyGoedGeluid();
					spreek(item.hoofdstad[0] ?? "");
					e.reveal = {
						x: p.x,
						y: p.y,
						kleur: "#3ddc84",
						naam: `${item.hoofdstad[0]} (${item.land})`,
						t0: Date.now(),
					};
					setFeedback({
						text: `🛬 Gelanded in ${item.hoofdstad[0]} (${item.land}) in ${secs.toFixed(1)}s! +${punten}`,
						ok: true,
					});
					tekenVlieg();
					e.prevTarget = item;
					e.idx++;
					updateHud();
					startPauzeRef.current(PAUZE_LANDING_MS, () => volgende(false));
					return;
				}
				for (const s of e.reeks) {
					if (e.vrijgesteld.has(s.n) || e.bezochtVerkeerd.has(s.n)) continue;
					const q = project(s.lat, s.lon);
					if (
						Math.hypot(e.heli.x - q.x, e.heli.y - q.y) <
						WAARSCHUW_RADIUS_SCHERM_PX / e.cam.zoom
					) {
						e.bezochtVerkeerd.add(s.n);
						e.tijdOver = Math.max(STRAF_MIN_REST, e.tijdOver - STRAF_SECONDEN);
						flyAfkeurGeluid();
						break;
					}
				}
				e.raf = requestAnimationFrame(loop);
			};
			loop();
		},
		[clampCam, spreek, tekenVlieg, updateHud, volgende, zetTijd],
	);

	// Ref-brug: volgende() roept startHeli aan (voorkomt circulaire useCallback-deps).
	const startHeliRef = useRef(startHeli);
	startHeliRef.current = startHeli;
	const startPauzeRef = useRef(startPauze);
	startPauzeRef.current = startPauze;

	const start = useCallback(() => {
		const e = eng.current;
		stopTimers();
		e.reeks = flyVragenVoorLevel(e.items, e.settings.level);
		e.idx = 0;
		e.score = 0;
		e.fouten = 0;
		e.prevTarget = null;
		e.reveal = null;
		e.target = null;
		e.vraagRichting = null;
		e.heli = { x: 480, y: 240, vx: 0, vy: 0 };
		setVraag(null);
		setFeedback(null);
		setKlaar(null);
		updateHud();
		zetTijd("–", 1);
		if (!e.reeks.length) return;
		enterFlyView();
		volgende(false);
		flyStartGeluid();
	}, [enterFlyView, stopTimers, updateHud, volgende, zetTijd]);

	const stopVroegtijdig = useCallback(
		(stil?: boolean) => {
			const e = eng.current;
			if (!e.flying && !e.reeks.length) return;
			stopTimers();
			if (e.idx < e.reeks.length && !stil) e.idx = e.reeks.length;
			if (!stil) einde();
			else exitFlyView();
		},
		[einde, exitFlyView, stopTimers],
	);

	const resetNaarStart = useCallback(() => {
		const e = eng.current;
		stopTimers();
		if (e.flying) exitFlyView();
		e.reeks = [];
		e.target = null;
		e.reveal = null;
		e.vraagRichting = null;
		setVraag(null);
		setFeedback(null);
		setKlaar(null);
	}, [exitFlyView, stopTimers]);

	// ---------- canvas-koppeling (component roept aan bij mount) ----------
	const koppel = useCallback(
		(
			stage: HTMLDivElement | null,
			map: HTMLCanvasElement | null,
			mini: HTMLCanvasElement | null,
		) => {
			const e = eng.current;
			e.stage = stage;
			e.map = map;
			e.mini = mini;
		},
		[],
	);

	// ---------- pointer-besturing ----------
	const dragStart = useCallback(
		(clientX: number, clientY: number, rect: DOMRect) => {
			const e = eng.current;
			if (!e.map) return;
			const sx = ((clientX - rect.left) / rect.width) * e.map.width;
			const sy = ((clientY - rect.top) / rect.height) * e.map.height;
			e.drag.x = e.cam.cx + (sx - e.map.width / 2) / e.cam.zoom;
			e.drag.y = e.cam.cy + (sy - e.map.height / 2) / e.cam.zoom;
			e.drag.doen = true;
		},
		[],
	);

	const dragMove = useCallback(
		(clientX: number, clientY: number, rect: DOMRect) => {
			const e = eng.current;
			if (!e.drag.doen || !e.map) return;
			const sx = ((clientX - rect.left) / rect.width) * e.map.width;
			const sy = ((clientY - rect.top) / rect.height) * e.map.height;
			e.drag.x = e.cam.cx + (sx - e.map.width / 2) / e.cam.zoom;
			e.drag.y = e.cam.cy + (sy - e.map.height / 2) / e.cam.zoom;
		},
		[],
	);

	const dragStop = useCallback(() => {
		eng.current.drag.doen = false;
	}, []);

	// ---------- toetsenbord + fullscreen (eenmalig, StrictMode-veilig met cleanup) ----------
	useEffect(() => {
		const e = eng.current;
		const stopRef = { current: stopVroegtijdig };
		stopRef.current = stopVroegtijdig;
		const opNeer = (ev: KeyboardEvent): void => {
			if (ev.key === "Escape" && e.flying) {
				stopRef.current();
				return;
			}
			e.keys[ev.key.length === 1 ? ev.key.toLowerCase() : ev.key] = true;
			if (
				["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
					ev.key,
				)
			) {
				ev.preventDefault();
			}
		};
		const opLos = (ev: KeyboardEvent): void => {
			e.keys[ev.key.length === 1 ? ev.key.toLowerCase() : ev.key] = false;
		};
		const opFullscreen = (): void => {
			if (!document.fullscreenElement && e.flying) stopRef.current(true);
		};
		window.addEventListener("keydown", opNeer);
		window.addEventListener("keyup", opLos);
		document.addEventListener("fullscreenchange", opFullscreen);
		return () => {
			window.removeEventListener("keydown", opNeer);
			window.removeEventListener("keyup", opLos);
			document.removeEventListener("fullscreenchange", opFullscreen);
		};
	}, [stopVroegtijdig]);

	return {
		hud,
		vraag,
		feedback,
		klaar,
		vliegt,
		start,
		stopVroegtijdig,
		resetNaarStart,
		koppel,
		dragStart,
		dragMove,
		dragStop,
	};
}

export type FlyRun = ReturnType<typeof useFlyRun>;
