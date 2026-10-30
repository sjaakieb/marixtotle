import type { Chapter } from "@/lib/schema";
import { chapters } from "./chapters";

export type PeriodId = `${number}-${number}`;

export type Period = {
	id: PeriodId;
	year: number;
	period: number;
	title: string;
	description: string;
};

export const PERIODS: Period[] = [
	{
		id: "1-1",
		year: 1,
		period: 1,
		title: "Jaar 1 – Periode 1",
		description:
			"Alle huidige opdrachten. Elk vak sluit af met een eigen periode-toets (20 vragen, L1–L5).",
	},
	{
		id: "1-2",
		year: 1,
		period: 2,
		title: "Jaar 1 – Periode 2",
		description: "Nieuwe opdrachten — o.a. Grieks Klassiek 2 (ὁ βίος).",
	},
];

export function getPeriod(year: number, period: number): Period | undefined {
	return PERIODS.find((p) => p.year === year && p.period === period);
}

export function getPeriodById(id: string): Period | undefined {
	return PERIODS.find((p) => p.id === id);
}

export function getChaptersForPeriod(year: number, period: number): Chapter[] {
	return chapters.filter(
		(c) => (c.year ?? 1) === year && (c.period ?? 1) === period,
	);
}

/** 20-question period exam per vak: fixed size, equal L1–L5 split (4 each). */
export const PERIOD_TEST_SIZE = 20;
