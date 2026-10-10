import { type Chapter, chapterSchema } from "@/lib/schema";

const DEELWOORD = "deelwoord";

const rawChapter = {
	id: "nederlands-werkwoorden-2",
	title: "Nederlands – Werkwoorden 2: deelwoorden",
	description:
		"Noteer het voltooid of onvoltooid deelwoord op de … Soms hoort er een voltooid deelwoord (verbaasd, geschrokken), soms een onvoltooid deelwoord (lachend). Let op de spelling: elke letter telt, tikfoutjes worden fout gerekend.",
	language: "dutch",
	exercises: [
		{
			id: "nww2-01",
			type: "declension",
			prompt:
				"De kleuter meldde zich … bij de meester nadat hij een mop had verteld (lachen)",
			answer: "lachend",
			wrongAnswers: ["lachen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-02",
			type: "declension",
			prompt:
				"Met een grote tang werd de roestige spijker uit het hout … (halen)",
			answer: "gehaald",
			wrongAnswers: ["gehaalt"],
			form: DEELWOORD,
		},
		{
			id: "nww2-03",
			type: "declension",
			prompt:
				"… naar het prachtige uitzicht over de bergen viel de wandelaar in gedachten (staren)",
			answer: "starend",
			wrongAnswers: ["staren"],
			form: DEELWOORD,
		},
		{
			id: "nww2-04",
			type: "declension",
			prompt:
				"De getroffenen stonden … van verdriet bij de verwoeste woning (huilen)",
			answer: "huilend",
			wrongAnswers: ["huilen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-05",
			type: "declension",
			prompt: "Zouden er binnenkort weer nieuwe gebouwen worden …? (bouwen)",
			answer: "gebouwd",
			wrongAnswers: ["gebouwt"],
			form: DEELWOORD,
		},
		{
			id: "nww2-06",
			type: "declension",
			prompt:
				"… probeerde de jongen de vertrekkende trein alsnog te halen (rennen)",
			answer: "rennend",
			wrongAnswers: ["rennen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-07",
			type: "declension",
			prompt:
				"De arts verzorgde de patiënt op een zeer professionele en … wijze (deskundig)",
			answer: "deskundige",
			wrongAnswers: ["deskundig"],
			form: DEELWOORD,
		},
		{
			id: "nww2-08",
			type: "declension",
			prompt:
				"De verloren sleutels zijn gisteren gelukkig weer … door de buurman (vinden)",
			answer: "gevonden",
			form: DEELWOORD,
		},
		{
			id: "nww2-09",
			type: "declension",
			prompt:
				"… wandelden de supporters door de straten na de overwinning (zingen)",
			answer: "zingend",
			wrongAnswers: ["zingen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-10",
			type: "declension",
			prompt: "Het hele verslag is gisteravond door de leerling … (typen)",
			answer: "getypt",
			wrongAnswers: ["getypd"],
			form: DEELWOORD,
		},
		{
			id: "nww2-11",
			type: "declension",
			prompt:
				"De dief rende … de winkel uit nadat het alarm afging (schreeuwen)",
			answer: "schreeuwend",
			wrongAnswers: ["schreeuwen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-12",
			type: "declension",
			prompt:
				"Er is gisteren een prachtig nieuw kunstwerk in het centrum … (onthullen)",
			answer: "onthuld",
			wrongAnswers: ["onthult"],
			form: DEELWOORD,
		},
		{
			id: "nww2-13",
			type: "declension",
			prompt: "… van de kou stapte het meisje uit het ijzige water (beven)",
			answer: "bevend",
			wrongAnswers: ["beven"],
			form: DEELWOORD,
		},
		{
			id: "nww2-14",
			type: "declension",
			prompt:
				"Al de antwoorden op de toets zijn zorgvuldig door de docent … (nakijken)",
			answer: "nagekeken",
			form: DEELWOORD,
		},
		{
			id: "nww2-15",
			type: "declension",
			prompt: "Het kind zat … achter zijn bureau tijdens de rekenles (dromen)",
			answer: "dromend",
			wrongAnswers: ["dromen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-16",
			type: "declension",
			prompt:
				"Helaas is er tijdens de storm een grote tak van de boom … (waaien)",
			answer: "gewaaid",
			wrongAnswers: ["gewaait"],
			form: DEELWOORD,
		},
		{
			id: "nww2-17",
			type: "declension",
			prompt:
				"… fietste de bezorger door de regen om de pakketjes af te leveren (fluiten)",
			answer: "fluitend",
			wrongAnswers: ["fluiten"],
			form: DEELWOORD,
		},
		{
			id: "nww2-18",
			type: "declension",
			prompt:
				"Wordt de maaltijd vanavond door jou … of zullen we bestellen? (koken)",
			answer: "gekookt",
			wrongAnswers: ["gekookd"],
			form: DEELWOORD,
		},
		{
			id: "nww2-19",
			type: "declension",
			prompt:
				"De voorbijgangers keken … naar de goochelaar op straat (verbazen)",
			answer: "verbaasd",
			wrongAnswers: ["verbaast"],
			form: DEELWOORD,
		},
		{
			id: "nww2-20",
			type: "declension",
			prompt: "Alle oude kleren zijn verzameld en netjes in dozen … (pakken)",
			answer: "gepakt",
			wrongAnswers: ["gepakd"],
			form: DEELWOORD,
		},
		{
			id: "nww2-21",
			type: "declension",
			prompt: "… pakte de student zijn zware tas weer op (zuchten)",
			answer: "zuchtend",
			wrongAnswers: ["zuchten"],
			form: DEELWOORD,
		},
		{
			id: "nww2-22",
			type: "declension",
			prompt:
				"De moeilijke wiskundeopdracht is door de leraar stapsgewijs … (uitleggen)",
			answer: "uitgelegd",
			wrongAnswers: ["uitgelegt"],
			form: DEELWOORD,
		},
		{
			id: "nww2-23",
			type: "declension",
			prompt:
				"Het hondje kwam … op zijn baasje af toen die thuiskwam (kwispelen)",
			answer: "kwispelend",
			wrongAnswers: ["kwispelen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-24",
			type: "declension",
			prompt:
				"Er worden de laatste tijd veel valse e-mails … door oplichters (versturen)",
			answer: "verstuurd",
			wrongAnswers: ["verstuurt"],
			form: DEELWOORD,
		},
		{
			id: "nww2-25",
			type: "declension",
			prompt:
				"… over een losliggende tegel viel de voetganger op de stoep (struikelen)",
			answer: "struikelend",
			wrongAnswers: ["struikelen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-26",
			type: "declension",
			prompt: "De beschadigde auto is vanochtend naar de garage … (slepen)",
			answer: "gesleept",
			wrongAnswers: ["gesleepd"],
			form: DEELWOORD,
		},
		{
			id: "nww2-27",
			type: "declension",
			prompt: "De baby viel … in slaap in de kinderwagen (duimen)",
			answer: "duimend",
			wrongAnswers: ["duimen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-28",
			type: "declension",
			prompt: "Het oude pand is vorige week door een sloopbedrijf … (slopen)",
			answer: "gesloopt",
			wrongAnswers: ["gesloopd"],
			form: DEELWOORD,
		},
		{
			id: "nww2-29",
			type: "declension",
			prompt: "… nam de winnaar de gouden medaille in ontvangst (glimlachen)",
			answer: "glimlachend",
			wrongAnswers: ["glimlachen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-30",
			type: "declension",
			prompt: "Wat is er toch met die oude computer …? (gebeuren)",
			answer: "gebeurd",
			wrongAnswers: ["gebeurt"],
			form: DEELWOORD,
		},
		{
			id: "nww2-31",
			type: "declension",
			prompt:
				"De getuige keek … om zich heen toen hij de knal hoorde (schrikken)",
			answer: "geschrokken",
			form: DEELWOORD,
		},
		{
			id: "nww2-32",
			type: "declension",
			prompt: "De taart is speciaal voor jouw verjaardag door oma … (bakken)",
			answer: "gebakken",
			form: DEELWOORD,
		},
		{
			id: "nww2-33",
			type: "declension",
			prompt: "… kwamen de lopers over de finishlijn van de marathon (zweten)",
			answer: "zwetend",
			wrongAnswers: ["zweten"],
			form: DEELWOORD,
		},
		{
			id: "nww2-34",
			type: "declension",
			prompt: "Alle vragen op de vragenlijst zijn volledig … (invullen)",
			answer: "ingevuld",
			wrongAnswers: ["ingevult"],
			form: DEELWOORD,
		},
		{
			id: "nww2-35",
			type: "declension",
			prompt: "De gewonde spelers verlieten … het voetbalveld (hinken)",
			answer: "hinkend",
			wrongAnswers: ["hinken"],
			form: DEELWOORD,
		},
		{
			id: "nww2-36",
			type: "declension",
			prompt:
				"Is de kapotte fietsverlichting inmiddels door jou …? (repareren)",
			answer: "gerepareerd",
			wrongAnswers: ["gerepareert"],
			form: DEELWOORD,
		},
		{
			id: "nww2-37",
			type: "declension",
			prompt: "… namen de kinderen afscheid van hun grootouders (zwaaien)",
			answer: "zwaaiend",
			wrongAnswers: ["zwaaien"],
			form: DEELWOORD,
		},
		{
			id: "nww2-38",
			type: "declension",
			prompt: "De nieuwbouwbuurt is vorig jaar compleet … (renoveren)",
			answer: "gerenoveerd",
			wrongAnswers: ["gerenoveert"],
			form: DEELWOORD,
		},
		{
			id: "nww2-39",
			type: "declension",
			prompt:
				"Het publiek klapte … toen de artiesten het podium op kwamen (juichen)",
			answer: "juichend",
			wrongAnswers: ["juichen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-40",
			type: "declension",
			prompt: "Alle spullen zijn netjes in de stellingkast … (zetten)",
			answer: "gezet",
			wrongAnswers: ["gezed"],
			form: DEELWOORD,
		},
		{
			id: "nww2-41",
			type: "declension",
			prompt: "… zocht de man naar zijn verloren portemonnee (vloeken)",
			answer: "vloekend",
			wrongAnswers: ["vloeken"],
			form: DEELWOORD,
		},
		{
			id: "nww2-42",
			type: "declension",
			prompt: "De boeken zijn gisteren al naar de bibliotheek … (terugbrengen)",
			answer: "teruggebracht",
			wrongAnswers: ["teruggebragt"],
			form: DEELWOORD,
		},
		{
			id: "nww2-43",
			type: "declension",
			prompt:
				"De verdachte werd … door de politie naar het bureau gebracht (beven)",
			answer: "bevend",
			wrongAnswers: ["beven"],
			form: DEELWOORD,
		},
		{
			id: "nww2-44",
			type: "declension",
			prompt:
				"Er zijn dit jaar al heel wat mooie reizen door de familie … (maken)",
			answer: "gemaakt",
			wrongAnswers: ["gemaakd"],
			form: DEELWOORD,
		},
		{
			id: "nww2-45",
			type: "declension",
			prompt:
				"… naar het beeldscherm merkte hij niet dat er iemand binnenkwam (kijken)",
			answer: "kijkend",
			wrongAnswers: ["kijken"],
			form: DEELWOORD,
		},
		{
			id: "nww2-46",
			type: "declension",
			prompt:
				"Het lek in de waterleiding is snel door de loodgieter … (dichten)",
			answer: "gedicht",
			wrongAnswers: ["gedigt"],
			form: DEELWOORD,
		},
		{
			id: "nww2-47",
			type: "declension",
			prompt:
				"De fans stonden … voor de ingang van het concertgebouw (dringen)",
			answer: "dringend",
			wrongAnswers: ["dringen"],
			form: DEELWOORD,
		},
		{
			id: "nww2-48",
			type: "declension",
			prompt: "Deze maaltijd is helemaal vers door de sjefkok … (bereiden)",
			answer: "bereid",
			wrongAnswers: ["bereidt", "bereit"],
			form: DEELWOORD,
		},
		{
			id: "nww2-49",
			type: "declension",
			prompt: "… van angst schoof het konijn dieper de holte in (beven)",
			answer: "bevend",
			wrongAnswers: ["beven"],
			form: DEELWOORD,
		},
		{
			id: "nww2-50",
			type: "declension",
			prompt: "Het document is gisteren door de directeur … (ondertekenen)",
			answer: "ondertekend",
			wrongAnswers: ["ondertekent"],
			form: DEELWOORD,
		},
	],
} as const;

export const chapter: Chapter = chapterSchema.parse(rawChapter);
