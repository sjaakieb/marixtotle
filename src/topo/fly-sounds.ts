// WebAudio-piepjes voor de helimodus (geport uit Topokopter).
// Respecteert de Marixtotle-geluidsschakelaar (`marixtotle:sound`).
import { isSoundEnabled } from "@/lib/sounds";

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
	try {
		if (typeof window === "undefined") return null;
		if (!ctx) {
			const w = window as unknown as {
				AudioContext?: typeof AudioContext;
				webkitAudioContext?: typeof AudioContext;
			};
			const AC = w.AudioContext ?? w.webkitAudioContext;
			if (!AC) return null;
			ctx = new AC();
		}
		if (ctx.state === "suspended") {
			// Zonder klik-gebaar (autostart) start de context gesuspendeerd;
			// bij de eerste interactie pakt deze resume alsnog op.
			ctx.resume().catch(() => {});
		}
		return ctx;
	} catch {
		return null;
	}
}

export function flyBeep(
	freq = 660,
	dur = 0.12,
	type: OscillatorType = "square",
	vol = 0.06,
): void {
	if (!isSoundEnabled()) return;
	try {
		const ac = audioContext();
		if (!ac) return;
		const o = ac.createOscillator();
		const g = ac.createGain();
		o.type = type;
		o.frequency.value = freq;
		g.gain.value = vol;
		o.connect(g);
		g.connect(ac.destination);
		o.start();
		g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
		o.stop(ac.currentTime + dur);
	} catch {
		/* geluid is optioneel */
	}
}

/** Start-jingle: twee oplopende piepjes. */
export function flyStartGeluid(): void {
	flyBeep(440, 0.1);
	setTimeout(() => flyBeep(660, 0.12), 120);
}

export function flyGoedGeluid(): void {
	flyBeep(660, 0.1);
	setTimeout(() => flyBeep(880, 0.15), 110);
}

export function flyFoutGeluid(): void {
	flyBeep(180, 0.25, "sawtooth");
}

/** Harde afkeur-zoemer bij over een verkeerde stad vliegen (−2s). */
export function flyAfkeurGeluid(): void {
	flyBeep(150, 0.12, "sawtooth");
	setTimeout(() => flyBeep(110, 0.2, "sawtooth"), 130);
}
