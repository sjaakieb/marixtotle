// Alle spelbalans-getallen op één plek (1-op-1 overgenomen uit Topokopter,
// zelf weer 1-op-1 uit legacy Topografie Nederland).

/** Seconden vliegtijd per vraag. */
export function heliTijdVoorLevel(level: number): number {
	if (level === 1) return 25;
	if (level === 2) return 20;
	if (level === 3) return 16;
	if (level === 4) return 14;
	return 12; // examen
}

/** Basiszoom per level: maximaal ongeveer een half continent in beeld. */
export function heliZoom(level: number): number {
	if (level === 1) return 6;
	if (level === 2) return 8.5; // Afrika: extra ingezoomd
	if (level === 3) return 8;
	if (level === 4) return 8.5;
	return 9; // examen
}

/** Topsnelheid in wereld-pixels per frame bij 60fps. */
export function heliSnelheid(level: number): number {
	if (level === 1) return 1.0;
	if (level === 2) return 1.1;
	if (level === 3) return 1.3;
	if (level === 4) return 1.4;
	return 1.5;
}

// --- Dynamische zoom ---
/** Binnen deze afstand (wereldpx) van een stad: normale close-up. */
export const DICHTBIJ_AAN = 35;
/** Voorbij deze afstand: weer uitzoomen naar basiszoom. */
export const DICHTBIJ_UIT = 60;
/** Binnen deze afstand van een extreem dichte stad: diepe zoom. */
export const DIEP_AAN = 25;
/** Voorbij deze afstand (of close-up voorbij): diepe zoom uit. */
export const DIEP_UIT = 45;
/** Zoomniveau close-up / diepe close-up. */
export const ZOOM_DICHTBIJ = 13;
export const ZOOM_DIEP = 60;
/** Steden dichter dan dit bij elkaar (wereldpx) gelden als extreem dicht cluster. */
export const DRUK_CLUSTER_AFSTAND = 6;
/** Zoom-lerp per frame: inzoomen vloeiend, uitzoomen veert sneller terug. */
export const ZOOM_LERP_IN = 0.08;
export const ZOOM_LERP_UIT = 0.18;

// --- Vliegnatuurkunde ---
/** Frames tot volle stuwkracht (~1,5s gasrespons). */
export const STUW_FRAMES = 90;
/** Versnelling toetsen / slepen per frame bij volle stuwkracht. */
export const VERSNELLING_TOETS = 0.15;
export const VERSNELLING_SLEEP = 0.004;
/** Demping per frame (uitglijden). */
export const DEMPING = 0.94;
/** Topsnelheid schaalt mee met zoom, met deze vloer (fractie van leveltopsnelheid). */
export const SNELHEID_ZOOM_VLOER = 0.1;

// --- Precisie & straffen (wereldpx tenzij anders vermeld) ---
/** Landingsradius als vaste schermprecisie: 60 schermpixels, ongeacht zoom. */
export const LANDINGS_RADIUS_SCHERM_PX = 60;
/** Waarschuwingsradius verkeerde stad, eveneens als schermprecisie. */
export const WAARSCHUW_RADIUS_SCHERM_PX = 45;
/** Cluster rond het doel (<12px) telt nooit als 'verkeerd'. */
export const VRIJSTELLING_CLUSTER_PX = 12;
/** Startplek (<8px) telt nooit als 'verkeerd' (geen directe straf bij nieuwe opdracht). */
export const VRIJSTELLING_START_PX = 8;
/** Tijdstraf bij over een verkeerde stad vliegen (seconden, 1x per stad per vraag). */
export const STRAF_SECONDEN = 2;
/** Tijd loopt nooit lager dan dit door een straf. */
export const STRAF_MIN_REST = 0.5;

// --- Pauzes na landen/tijd-op (ms) ---
export const PAUZE_LANDING_MS = 1400;
export const FREEZE_TIJDOP_MS = 2500;
