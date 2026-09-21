export const LANGUAGES = [
	{
		id: "latin",
		label: "Latijn",
		nativeLabel: "Latina",
		flag: "🏛️",
		description: "Nederlands ↔ Latijn",
		color: "sky",
	},
	{
		id: "french",
		label: "Frans",
		nativeLabel: "Français",
		flag: "🇫🇷",
		description: "Nederlands ↔ Frans",
		color: "blue",
	},
	{
		id: "english",
		label: "Engels",
		nativeLabel: "English",
		flag: "🇬🇧",
		description: "Nederlands ↔ Engels",
		color: "emerald",
	},
	{
		id: "greek",
		label: "Grieks",
		nativeLabel: "Ελληνικά",
		flag: "🇬🇷",
		description: "Nederlands ↔ Grieks",
		color: "violet",
	},
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export function getLanguage(id: string) {
	return LANGUAGES.find((l) => l.id === id);
}

export const languageIds = LANGUAGES.map((l) => l.id) as [
	LanguageId,
	...LanguageId[],
];
