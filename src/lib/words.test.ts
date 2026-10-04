import { describe, expect, it } from "vitest";
import { chapterSchema } from "./schema";
import { getMasteryItems, vocabGroupKey, wordKey } from "./words";

const raw = {
	id: "test-fr",
	title: "Test",
	language: "french",
	exercises: [
		{
			id: "a1",
			type: "vocab",
			prompt: "les vacances",
			answer: "de vakantie",
			direction: "fr->nl",
		},
		{
			id: "a2",
			type: "vocab",
			prompt: "de vakantie (vrouwelijk meervoud)",
			answer: "les vacances",
			direction: "nl->fr",
		},
		{
			id: "b1",
			type: "vocab",
			prompt: "le camping",
			answer: "de camping",
			direction: "fr->nl",
		},
		{
			id: "d1",
			type: "declension",
			prompt: "rosam – accusativus",
			lemma: "rosa, rosae (f)",
			form: "acc. sg.",
			answer: "rosam",
			options: ["rosa", "rosam", "rosas", "rosae"],
		},
	],
} as const;

describe("words", () => {
	it("collapses both directions into one vocab item", () => {
		const chapter = chapterSchema.parse(raw);
		const items = getMasteryItems(chapter);
		const vocab = items.filter((i) => i.kind === "vocab");
		// "de vakantie / les vacances" pair appears twice in source but is one item
		expect(vocab).toHaveLength(2);
	});

	it("keeps declension as separate items", () => {
		const chapter = chapterSchema.parse(raw);
		const items = getMasteryItems(chapter);
		expect(items.filter((i) => i.kind === "declension")).toHaveLength(1);
		expect(items.find((i) => i.key === "d1")).toBeDefined();
	});

	it("wordKey is case/space insensitive", () => {
		expect(wordKey(" De Vakantie ", "LES VACANCES")).toBe(
			wordKey("de vakantie", "les vacances"),
		);
	});

	it("strips parenthetical hints from display labels", () => {
		const chapter = chapterSchema.parse({
			id: "test-el",
			title: "Test",
			language: "greek",
			exercises: [
				{
					id: "g1",
					type: "vocab",
					prompt: "οὐ (voor medeklinker)",
					answer: "niet",
					direction: "el->nl",
				},
				{
					id: "g2",
					type: "vocab",
					prompt: "(hij/zij/het/er) is, bestaat",
					answer: "ἐστί(ν)",
					direction: "nl->el",
				},
			],
		} as const);
		const vocab = getMasteryItems(chapter).filter((i) => i.kind === "vocab");
		expect(vocab).toHaveLength(2);
		expect(vocab[0].kind === "vocab" && vocab[0].foreign).toBe("οὐ");
		expect(vocab[1].kind === "vocab" && vocab[1].nl).toBe("is, bestaat");
		expect(vocab[1].kind === "vocab" && vocab[1].foreign).toBe("ἐστί");
	});

	it("merges true duplicates (same word tested twice)", () => {
		const chapter = chapterSchema.parse({
			id: "test-el-dup",
			title: "Test",
			language: "greek",
			exercises: [
				{
					id: "d1",
					type: "vocab",
					prompt: "niet",
					answer: "οὐ",
					direction: "nl->el",
				},
				{
					id: "d2",
					type: "vocab",
					prompt: "niet (voor medeklinker / werkwoord met ν)",
					answer: "οὐ",
					direction: "nl->el",
				},
			],
		} as const);
		const vocab = getMasteryItems(chapter).filter((i) => i.kind === "vocab");
		expect(vocab).toHaveLength(1);
	});

	it("keeps Greek lower/uppercase as separate items (case-sensitive)", () => {
		const chapter = chapterSchema.parse({
			id: "test-el-case",
			title: "Test",
			language: "greek",
			exercises: [
				{
					id: "c1",
					type: "vocab",
					prompt: "alpha (= a, kleine letter)",
					answer: "α",
					direction: "nl->el",
				},
				{
					id: "c2",
					type: "vocab",
					prompt: "α",
					answer: "a",
					alternatives: ["alpha"],
					direction: "el->nl",
				},
				{
					id: "c3",
					type: "vocab",
					prompt: "ALPHA (= A, HOOFDLETTER)",
					answer: "Α",
					direction: "nl->el",
				},
			],
		} as const);
		const vocab = getMasteryItems(chapter).filter((i) => i.kind === "vocab");
		// lowercase pair merged, uppercase stays separate
		expect(vocab).toHaveLength(2);
		expect(vocabGroupKey("α", "greek") === vocabGroupKey("Α", "greek")).toBe(
			false,
		);
	});
});
