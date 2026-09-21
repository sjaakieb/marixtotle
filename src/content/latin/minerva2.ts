import { type Chapter, chapterSchema } from "@/lib/schema";

const rawChapter = {
	id: "minerva-2",
	title: "Caput – Nominativus en Accusativus",
	description:
		"Oefenen met het onderwerp (nominativus) en lijdend voorwerp (accusativus) met woorden waarvan het Latijnse en Nederlandse geslacht overeenkomen.",
	exercises: [
		{
			id: "nom-acc-1",
			type: "declension",
			prompt:
				"rosam – accusativus singularis (vrouwelijk: bijv. 'De jongen plukt de roos')",
			lemma: "rosa, rosae (f) – de roos",
			form: "acc. sg.",
			answer: "rosam",
			options: ["rosa", "rosam", "rosas", "rosae"],
		},
		{
			id: "nom-acc-2",
			type: "declension",
			prompt:
				"amicos – accusativus pluralis (mannelijk: bijv. 'Hij begroet de vrienden')",
			lemma: "amicus, amici (m) – de vriend",
			form: "acc. pl.",
			answer: "amicos",
			options: ["amici", "amicum", "amicos", "amicis"],
		},
		{
			id: "nom-acc-3",
			type: "declension",
			prompt:
				"vinum – nominativus pluralis (onzijdig: bijv. 'De wijnen zijn lekker')",
			lemma: "vinum, vini (n) – het vocht/de wijn",
			form: "nom. pl.",
			answer: "vina",
			hint: "let op: bij onzijdige woorden (-um) is nom. pl. gelijk aan acc. pl. (-a)",
			options: ["vinum", "vina", "vinos", "vinorum"],
		},
		{
			id: "nom-acc-4",
			type: "declension",
			prompt:
				"Welke functie heeft 'amicum' in de zin: 'Puella amicum videt' ('Het meisje ziet de vriend')?",
			lemma: "amicus, amici (m) – de vriend",
			form: "amicum",
			answer: "accusativus singularis (lijdend voorwerp)",
			options: [
				"nominativus singularis (onderwerp)",
				"accusativus singularis (lijdend voorwerp)",
				"nominativus pluralis (onderwerp)",
				"accusativus pluralis (lijdend voorwerp)",
			],
		},
		{
			id: "nom-acc-5",
			type: "declension",
			prompt:
				"rosae – welke vorm is dit in: 'Rosae in horto sunt' ('De rozen staan in de tuin')?",
			lemma: "rosa, rosae (f) – de roos",
			form: "rosae",
			answer: "nominativus pluralis",
			options: [
				"nominativus pluralis",
				"accusativus pluralis",
				"accusativus singularis",
				"ablativus singularis",
			],
		},
		{
			id: "nom-acc-6",
			type: "declension",
			prompt:
				"Vul de juiste vorm in voor 'de vriend' (lijdend voorwerp): 'Rex ______ accipit.' ('De koning ontvangt de vriend.')",
			lemma: "amicus, amici (m) – de vriend",
			form: "acc. sg.",
			answer: "amicum",
			hint: "Groep 2 -us (mannelijk): acc. sg. uitgang is -um",
		},
		{
			id: "nom-acc-7",
			type: "declension",
			prompt:
				"Vul de juiste vorm in voor 'de rozen' (onderwerp): '______ sunt pulchrae.' ('De rozen zijn mooi.')",
			lemma: "rosa, rosae (f) – de roos",
			form: "nom. pl.",
			answer: "rosae",
			hint: "Groep 1 (vrouwelijk): nom. pl. uitgang is -ae",
		},
		{
			id: "nom-acc-8",
			type: "declension",
			prompt:
				"vinum – accusativus singularis (onzijdig: bijv. 'Hij drinkt het vocht/het spul')",
			lemma: "vinum, vini (n) – het vocht/de wijn",
			form: "acc. sg.",
			answer: "vinum",
			hint: "Onzijdige woorden op -um hebben in de nominativus én accusativus dezelfde vorm!",
		},
	],
} as const;

export const chapter: Chapter = chapterSchema.parse(rawChapter);
