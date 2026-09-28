"use client";

// Web Audio based success/fail sounds — no asset files, works offline + PWA
// Respects localStorage mute toggle: `marixtotle:sound` (true by default)

const STORAGE_KEY = "marixtotle:sound";

let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
	const Ctx = w.AudioContext ?? w.webkitAudioContext;
	if (!Ctx) return null;
	if (!ctx) {
		ctx = new Ctx();
	}
	if (ctx.state === "suspended") {
		// resume must be called in a user gesture; callers are already in click/submit handlers
		ctx.resume().catch(() => {});
	}
	return ctx;
}

export function isSoundEnabled(): boolean {
	if (typeof window === "undefined") return true;
	try {
		const v = localStorage.getItem(STORAGE_KEY);
		if (v === null) return true;
		return v !== "false" && v !== "0";
	} catch {
		return true;
	}
}

export function setSoundEnabled(enabled: boolean): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
	} catch {}
	// iOS/Safari needs a gesture to unlock audio — try to prime context when enabling
	if (enabled) {
		getAudioContext();
	}
}

export function playSuccess(): void {
	if (!isSoundEnabled()) return;
	try {
		const c = getAudioContext();
		if (!c) return;
		const now = c.currentTime;

		// master gain with quick attack + decay
		const gain = c.createGain();
		gain.gain.setValueAtTime(0, now);
		gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
		gain.connect(c.destination);

		// Two-note chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) arpeggio
		const notes: Array<{ freq: number; start: number; duration: number }> = [
			{ freq: 523.25, start: 0, duration: 0.18 },
			{ freq: 659.25, start: 0.14, duration: 0.18 },
			{ freq: 783.99, start: 0.28, duration: 0.28 },
		];
		for (const n of notes) {
			const osc = c.createOscillator();
			osc.type = "sine";
			osc.frequency.setValueAtTime(n.freq, now + n.start);
			// slight detune for warmth on last note
			if (n.freq === 783.99) osc.detune.setValueAtTime(4, now + n.start);
			osc.connect(gain);
			osc.start(now + n.start);
			osc.stop(now + n.start + n.duration);
		}
	} catch {}
}

export function playFail(): void {
	if (!isSoundEnabled()) return;
	try {
		const c = getAudioContext();
		if (!c) return;
		const now = c.currentTime;

		// low buzzy fail: descending sine + triangle layer
		const gain = c.createGain();
		gain.gain.setValueAtTime(0, now);
		gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
		gain.connect(c.destination);

		const osc = c.createOscillator();
		osc.type = "sine";
		osc.frequency.setValueAtTime(220, now); // A3
		osc.frequency.exponentialRampToValueAtTime(135, now + 0.38);
		osc.connect(gain);
		osc.start(now);
		osc.stop(now + 0.55);

		// dissonant grit layer (triangle, slightly flat)
		const gain2 = c.createGain();
		gain2.gain.setValueAtTime(0, now + 0.04);
		gain2.gain.linearRampToValueAtTime(0.14, now + 0.06);
		gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
		gain2.connect(c.destination);

		const osc2 = c.createOscillator();
		osc2.type = "triangle";
		osc2.frequency.setValueAtTime(175, now + 0.04);
		osc2.frequency.linearRampToValueAtTime(110, now + 0.42);
		osc2.detune.setValueAtTime(-12, now + 0.04);
		osc2.connect(gain2);
		osc2.start(now + 0.04);
		osc2.stop(now + 0.5);
	} catch {}
}
