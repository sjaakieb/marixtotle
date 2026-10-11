// Tijd-gebaseerde fysica-helpers voor de helimodus.
// De game-loop draait op requestAnimationFrame en dus op een wisselende
// framerate (20fps op een langzame laptop, 120fps op een snel scherm).
// Alle snelheden zijn gedefinieerd per 1/60s-tik; deze helpers schalen ze
// met de echte frametijd, zodat het spel overal identiek aanvoelt.

export interface FrameStap {
	/** Fysica-stappen van 1/60s sinds het vorige frame (1 = precies 60fps). */
	stap: number;
	/** Tijdstempel om bij het volgende frame mee verder te gaan. */
	laatste: number;
}

/**
 * Zet een rAF-tijdstempel om in een fysica-stap. De eerste aanroep (zonder
 * vorige) geeft één tik. dt wordt begrensd op 0,1s, zodat een hapering
 * (tabwissel, GC-pauze) geen teleportatie veroorzaakt.
 */
export function frameStap(
	nu: number | undefined,
	vorige: number | null,
): FrameStap {
	const now = typeof nu === "number" ? nu : performance.now();
	if (vorige === null) return { stap: 1, laatste: now };
	const dt = Math.min(0.1, Math.max(0, (now - vorige) / 1000));
	return { stap: dt * 60, laatste: now };
}

/**
 * Exponentiële demping over een (gebroken) aantal tikken: base^stap.
 * 60 tikken van 1 geven exact hetzelfde als 30 tikken van 2 —
 * dáár zit de framerate-onafhankelijkheid in.
 */
export function dempFaktor(base: number, stap: number): number {
	return base ** stap;
}

/** Exponentiële toenadering over een (gebroken) aantal tikken: 1-(1-k)^stap. */
export function volgFaktor(k: number, stap: number): number {
	return 1 - (1 - k) ** stap;
}
