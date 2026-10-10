import { type Chapter, chapterSchema } from "@/lib/schema";

const TT = "tegenwoordige tijd";
const VT = "verleden tijd";

const rawChapter = {
	id: "nederlands-werkwoorden-1",
	title: "Nederlands – Werkwoorden 1: persoonsvorm",
	description:
		"Vul de persoonsvorm in op de …: nr. 1–26 in de tegenwoordige tijd, nr. 27–50 in de verleden tijd. Let op d/t, sterke werkwoorden en stamveranderingen. Elke letter telt: tikfoutjes worden hier fout gerekend.",
	language: "dutch",
	exercises: [
		{
			id: "nww1-01",
			type: "declension",
			prompt:
				"De piloot … het vliegtuig veilig, nadat hij urenlang door de storm vliegt (landen)",
			answer: "landt",
			wrongAnswers: ["lande"],
			form: TT,
		},
		{
			id: "nww1-02",
			type: "declension",
			prompt:
				"De piloot landt het vliegtuig veilig, nadat hij urenlang door de storm … (vliegen)",
			answer: "vliegt",
			wrongAnswers: ["vliegd", "vlieg"],
			form: TT,
		},
		{
			id: "nww1-03",
			type: "declension",
			prompt:
				"De tuinman … de heggen en plant daarna nieuwe bloemen in de tuin (snoeien)",
			answer: "snoeit",
			wrongAnswers: ["snoeid", "snoei"],
			form: TT,
		},
		{
			id: "nww1-04",
			type: "declension",
			prompt:
				"De tuinman snoeit de heggen en … daarna nieuwe bloemen in de tuin (planten)",
			answer: "plant",
			wrongAnswers: ["plantt", "pland"],
			form: TT,
		},
		{
			id: "nww1-05",
			type: "declension",
			prompt:
				"In deze bibliotheek … ik een oud boek dat ik meteen koop voor mijn verzameling (vinden)",
			answer: "vind",
			form: TT,
		},
		{
			id: "nww1-06",
			type: "declension",
			prompt:
				"In deze bibliotheek vind ik een oud boek dat ik meteen … voor mijn verzameling (kopen)",
			answer: "koop",
			form: TT,
		},
		{
			id: "nww1-07",
			type: "declension",
			prompt:
				"Onze sporters … vol overgave, maar grijpen net naast de hoofdprijs (strijden)",
			answer: "strijden",
			form: TT,
		},
		{
			id: "nww1-08",
			type: "declension",
			prompt:
				"Onze sporters strijden vol overgave, maar … net naast de hoofdprijs (grijpen)",
			answer: "grijpen",
			form: TT,
		},
		{
			id: "nww1-09",
			type: "declension",
			prompt:
				"Op de boerderij … de pony's door de wei en grazen de koeien rustig in de zon (draven)",
			answer: "draven",
			form: TT,
		},
		{
			id: "nww1-10",
			type: "declension",
			prompt:
				"Op de boerderij draven de pony's door de wei en … de koeien rustig in de zon (grazen)",
			answer: "grazen",
			form: TT,
		},
		{
			id: "nww1-11",
			type: "declension",
			prompt:
				"De bakkers … al vroeg in de ochtend brood en maken heerlijke gebakjes (bakken)",
			answer: "bakken",
			form: TT,
		},
		{
			id: "nww1-12",
			type: "declension",
			prompt:
				"De bakkers bakken al vroeg in de ochtend brood en … heerlijke gebakjes (maken)",
			answer: "maken",
			form: TT,
		},
		{
			id: "nww1-13",
			type: "declension",
			prompt:
				"Mijn zus … snel naar school en vergeet haar sleutels op de tafel (fietsen)",
			answer: "fietst",
			wrongAnswers: ["fiets"],
			form: TT,
		},
		{
			id: "nww1-14",
			type: "declension",
			prompt:
				"Mijn zus fietst snel naar school en … haar sleutels op de tafel (vergeten)",
			answer: "vergeet",
			wrongAnswers: ["vergeed"],
			form: TT,
		},
		{
			id: "nww1-15",
			type: "declension",
			prompt:
				"De honden … achter de bal aan en blaffen vrolijk in het park (rennen)",
			answer: "rennen",
			form: TT,
		},
		{
			id: "nww1-16",
			type: "declension",
			prompt:
				"De honden rennen achter de bal aan en … vrolijk in het park (blaffen)",
			answer: "blaffen",
			form: TT,
		},
		{
			id: "nww1-17",
			type: "declension",
			prompt:
				"Hij … keurig op de vragen en schrijft de gegevens netjes op (antwoorden)",
			answer: "antwoordt",
			wrongAnswers: ["antwoord", "antwoorde"],
			form: TT,
		},
		{
			id: "nww1-18",
			type: "declension",
			prompt:
				"Hij antwoordt keurig op de vragen en … de gegevens netjes op (schrijven)",
			answer: "schrijft",
			wrongAnswers: ["schrijfd", "schrijf"],
			form: TT,
		},
		{
			id: "nww1-19",
			type: "declension",
			prompt:
				"De kinderen … buiten in de sneeuw en bouwen een grote sneeuwpop (spelen)",
			answer: "spelen",
			form: TT,
		},
		{
			id: "nww1-20",
			type: "declension",
			prompt:
				"De kinderen spelen buiten in de sneeuw en … een grote sneeuwpop (bouwen)",
			answer: "bouwen",
			form: TT,
		},
		{
			id: "nww1-21",
			type: "declension",
			prompt:
				"De chauffeur … plotseling voor een overstekend konijn en stopt langs de weg (remmen)",
			answer: "remt",
			form: TT,
		},
		{
			id: "nww1-22",
			type: "declension",
			prompt:
				"De chauffeur remt plotseling voor een overstekend konijn en … langs de weg (stoppen)",
			answer: "stopt",
			form: TT,
		},
		{
			id: "nww1-23",
			type: "declension",
			prompt:
				"Zij … urenlang naar de sleutels, maar vinden helemaal niets (zoeken)",
			answer: "zoeken",
			form: TT,
		},
		{
			id: "nww1-24",
			type: "declension",
			prompt:
				"Zij zoeken urenlang naar de sleutels, maar … helemaal niets (vinden)",
			answer: "vinden",
			form: TT,
		},
		{
			id: "nww1-25",
			type: "declension",
			prompt:
				"De toeristen … door het museum en bekijken alle schilderijen (wandelen)",
			answer: "wandelen",
			form: TT,
		},
		{
			id: "nww1-26",
			type: "declension",
			prompt:
				"De toeristen wandelen door het museum en … alle schilderijen (bekijken)",
			answer: "bekijken",
			form: TT,
		},
		{
			id: "nww1-27",
			type: "declension",
			prompt:
				"De leraar … de moeilijke regel uit en vroeg of iedereen het begreep (leggen)",
			answer: "legde",
			wrongAnswers: ["legte"],
			form: VT,
		},
		{
			id: "nww1-28",
			type: "declension",
			prompt:
				"De leraar legde de moeilijke regel uit en … of iedereen het begreep (vragen)",
			answer: "vroeg",
			form: VT,
		},
		{
			id: "nww1-29",
			type: "declension",
			prompt:
				"De wind … hard door de bomen en braken enkele dikke takken af (waaien)",
			answer: "woei",
			alternatives: ["waaide"],
			form: VT,
		},
		{
			id: "nww1-30",
			type: "declension",
			prompt:
				"De wind woei hard door de bomen en … enkele dikke takken af (breken)",
			answer: "braken",
			wrongAnswers: ["breken"],
			hint: "Het onderwerp hier is 'enkele dikke takken' (meervoud) — vandaar 'braken', niet 'brak'.",
			form: VT,
		},
		{
			id: "nww1-31",
			type: "declension",
			prompt:
				"De kat … op de vensterbank en staarde naar de vogels buiten (springen)",
			answer: "sprong",
			form: VT,
		},
		{
			id: "nww1-32",
			type: "declension",
			prompt:
				"De kat sprong op de vensterbank en … naar de vogels buiten (staren)",
			answer: "staarde",
			form: VT,
		},
		{
			id: "nww1-33",
			type: "declension",
			prompt: "Wij … lang op de bus, maar hij kwam uiteindelijk toch (wachten)",
			answer: "wachtten",
			wrongAnswers: ["wachten", "wachtte"],
			form: VT,
		},
		{
			id: "nww1-34",
			type: "declension",
			prompt:
				"Wij wachtten lang op de bus, maar hij … uiteindelijk toch (komen)",
			answer: "kwam",
			form: VT,
		},
		{
			id: "nww1-35",
			type: "declension",
			prompt:
				"De soldaten … de stad en wonnen de belangrijke slag (verdedigen)",
			answer: "verdedigden",
			wrongAnswers: ["verdedigen", "verdedigde"],
			form: VT,
		},
		{
			id: "nww1-36",
			type: "declension",
			prompt:
				"De soldaten verdedigden de stad en … de belangrijke slag (winnen)",
			answer: "wonnen",
			wrongAnswers: ["winnen"],
			form: VT,
		},
		{
			id: "nww1-37",
			type: "declension",
			prompt:
				"Het meisje … om de grap en vertelde daarna een nog leuker verhaal (lachen)",
			answer: "lachte",
			wrongAnswers: ["lachde", "lache"],
			form: VT,
		},
		{
			id: "nww1-38",
			type: "declension",
			prompt:
				"Het meisje lachte om de grap en … daarna een nog leuker verhaal (vertellen)",
			answer: "vertelde",
			wrongAnswers: ["vertelte", "vertele"],
			form: VT,
		},
		{
			id: "nww1-39",
			type: "declension",
			prompt:
				"De rechercheur … de sporen en ontdekte een belangrijk bewijsstuk (onderzoeken)",
			answer: "onderzocht",
			form: VT,
		},
		{
			id: "nww1-40",
			type: "declension",
			prompt:
				"De rechercheur onderzocht de sporen en … een belangrijk bewijsstuk (ontdekken)",
			answer: "ontdekte",
			wrongAnswers: ["ontdekde", "ontdeke"],
			form: VT,
		},
		{
			id: "nww1-41",
			type: "declension",
			prompt:
				"De kok … de groenten en braadde het vlees in een grote pan (snijden)",
			answer: "sneed",
			wrongAnswers: ["sneet"],
			form: VT,
		},
		{
			id: "nww1-42",
			type: "declension",
			prompt:
				"De kok sneed de groenten en … het vlees in een grote pan (braden)",
			answer: "braadde",
			wrongAnswers: ["braadte", "braade"],
			form: VT,
		},
		{
			id: "nww1-43",
			type: "declension",
			prompt:
				"De studenten … de hele nacht en haalden goede resultaten (studeren)",
			answer: "studeerden",
			wrongAnswers: ["studeeren", "studeerde"],
			form: VT,
		},
		{
			id: "nww1-44",
			type: "declension",
			prompt:
				"De studenten studeerden de hele nacht en … goede resultaten (halen)",
			answer: "haalden",
			wrongAnswers: ["haalde"],
			form: VT,
		},
		{
			id: "nww1-45",
			type: "declension",
			prompt:
				"Mijn opa … over vroeger en toonde oude foto's uit het album (vertellen)",
			answer: "vertelde",
			wrongAnswers: ["vertelte", "vertele"],
			form: VT,
		},
		{
			id: "nww1-46",
			type: "declension",
			prompt:
				"Mijn opa vertelde over vroeger en … oude foto's uit het album (tonen)",
			answer: "toonde",
			wrongAnswers: ["toonte"],
			form: VT,
		},
		{
			id: "nww1-47",
			type: "declension",
			prompt:
				"De scheidsrechter … voor het einde en gaf een hand aan de spelers (fluiten)",
			answer: "floot",
			form: VT,
		},
		{
			id: "nww1-48",
			type: "declension",
			prompt:
				"De scheidsrechter floot voor het einde en … een hand aan de spelers (geven)",
			answer: "gaf",
			form: VT,
		},
		{
			id: "nww1-49",
			type: "declension",
			prompt:
				"De vogels … naar het zuiden en zochten een warme plek voor de winter (vliegen)",
			answer: "vlogen",
			form: VT,
		},
		{
			id: "nww1-50",
			type: "declension",
			prompt:
				"De vogels vlogen naar het zuiden en … een warme plek voor de winter (zoeken)",
			answer: "zochten",
			wrongAnswers: ["zogten"],
			form: VT,
		},
	],
} as const;

export const chapter: Chapter = chapterSchema.parse(rawChapter);
