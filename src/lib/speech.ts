"use client";

import type { LanguageId } from "./schema";

/** BCP-47 voice locale per app language (Latin falls back to Italian). */
export function getSpeechLang(language: LanguageId | string): string {
	switch (language) {
		case "french":
			return "fr-FR";
		case "english":
			return "en-US";
		case "greek":
			return "el-GR";
		case "latin":
			return "it-IT";
		default:
			return "nl-NL";
	}
}

export function isSpeechSupported(): boolean {
	if (typeof window === "undefined") return false;
	return (
		"speechSynthesis" in window &&
		typeof window.speechSynthesis?.speak === "function"
	);
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
	try {
		const voices = window.speechSynthesis.getVoices();
		if (!voices || voices.length === 0) return null;
		const prefix = lang.slice(0, 2).toLowerCase();
		return (
			voices.find((v) => v.lang?.toLowerCase() === lang.toLowerCase()) ??
			voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ??
			null
		);
	} catch {
		return null;
	}
}

export function speak(text: string, lang: string): void {
	if (!isSpeechSupported()) return;
	try {
		window.speechSynthesis.cancel();
		const utter = new SpeechSynthesisUtterance(text);
		utter.lang = lang;
		const voice = pickVoice(lang);
		if (voice) utter.voice = voice;
		utter.rate = 0.9;
		window.speechSynthesis.speak(utter);
	} catch {
		// speech is best-effort; typing still works without it
	}
}

export function cancelSpeech(): void {
	if (!isSpeechSupported()) return;
	try {
		window.speechSynthesis.cancel();
	} catch {}
}
