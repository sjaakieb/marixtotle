import { describe, expect, it } from "vitest";
import { gradeTopo, isTopoCorrect, topoNorm } from "./topo-match";

describe("topoNorm", () => {
	it("is accent-insensitief (Bogotá ≡ Bogota, Caïro ≡ Cairo)", () => {
		expect(topoNorm("Bogotá")).toBe("bogota");
		expect(topoNorm("Caïro")).toBe("cairo");
		expect(topoNorm("Brasília")).toBe("brasilia");
	});

	it("normaliseert interpunctie en spaties", () => {
		expect(topoNorm("  Washington D.C. ")).toBe("washington d c");
		expect(topoNorm("N'Djamena")).toBe("ndjamena");
		expect(topoNorm("N Djamena")).toBe("n djamena");
		expect(topoNorm("Mexico-Stad")).toBe("mexico stad");
	});
});

describe("gradeTopo", () => {
	it("accepteert aliassen uit de hoofdstedenlijst", () => {
		expect(gradeTopo("Washington", ["Washington D.C.", "Washington"])).toBe(
			"exact",
		);
		expect(gradeTopo("cairo", ["Caïro", "Cairo"])).toBe("exact");
		expect(gradeTopo("Peking", ["Beijing", "Peking"])).toBe("exact");
		expect(gradeTopo("Sucre", ["La Paz", "Sucre"])).toBe("exact");
	});

	it("accepteert speciale varianten (Mexico, Delhi, N'Djamena)", () => {
		expect(gradeTopo("Mexico", ["Mexico-Stad", "Mexico Stad"])).toBe("exact");
		expect(gradeTopo("Delhi", ["New Delhi", "New-Delhi", "Delhi"])).toBe(
			"exact",
		);
		expect(gradeTopo("Ndjamena", ["N'Djamena", "Ndjamena"])).toBe("exact");
	});

	it("vergeeft één tikfout bij antwoorden van 5+ letters", () => {
		expect(gradeTopo("Ottava", ["Ottawa"])).toBe("typo");
		expect(gradeTopo("Canberrraa", ["Canberra"])).toBe("wrong");
	});

	it("is strikt bij korte antwoorden (< 5 letters geen typo)", () => {
		expect(gradeTopo("Roma", ["Lima"])).toBe("wrong");
		expect(gradeTopo("Lim", ["Lima"])).toBe("wrong");
		expect(gradeTopo("Lima", ["Lima"])).toBe("exact");
	});

	it("wijst foute antwoorden af", () => {
		expect(gradeTopo("Parijs", ["Ottawa"])).toBe("wrong");
		expect(gradeTopo("", ["Ottawa"])).toBe("wrong");
	});
});

describe("isTopoCorrect", () => {
	it("telt exact en typo als goed", () => {
		expect(isTopoCorrect("Ottawa", ["Ottawa"])).toBe(true);
		expect(isTopoCorrect("Ottava", ["Ottawa"])).toBe(true);
		expect(isTopoCorrect("Parijs", ["Ottawa"])).toBe(false);
	});
});
