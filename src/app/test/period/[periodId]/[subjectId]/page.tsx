import Link from "next/link";
import { notFound } from "next/navigation";
import { PeriodTestClient } from "@/components/PeriodTestClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
	getChaptersForPeriod,
	getPeriodById,
	PERIOD_TEST_SIZE,
	PERIODS,
} from "@/content/curriculum";
import { getLanguage, LANGUAGES } from "@/lib/languages";

export function generateStaticParams() {
	const params: { periodId: string; subjectId: string }[] = [];
	for (const period of PERIODS) {
		const chapters = getChaptersForPeriod(period.year, period.period);
		for (const lang of LANGUAGES) {
			if (chapters.some((c) => (c.language ?? "latin") === lang.id)) {
				params.push({ periodId: period.id, subjectId: lang.id });
			}
		}
	}
	return params;
}

export default async function SubjectPeriodTestPage({
	params,
}: {
	params: Promise<{ periodId: string; subjectId: string }>;
}) {
	const { periodId, subjectId } = await params;
	const period = getPeriodById(periodId);
	const subject = getLanguage(subjectId);
	if (!period || !subject) notFound();
	const chapters = getChaptersForPeriod(period.year, period.period).filter(
		(c) => (c.language ?? "latin") === subject.id,
	);
	if (chapters.length === 0) notFound();

	return (
		<div className="bg-pixel-grid min-h-dvh bg-stone-100 dark:bg-stone-950">
			<div className="mx-auto max-w-3xl px-5 py-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<div className="flex items-center gap-2">
							<span>{subject.flag}</span>
							<span className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
								{period.title} • {subject.label} • Periode-toets
							</span>
						</div>
						<h1 className="mt-2 font-pixel text-xs leading-relaxed text-stone-900 dark:text-stone-50">
							{subject.label} – Toets
						</h1>
						<p className="mt-1 text-xl text-stone-600 dark:text-stone-400">
							{PERIOD_TEST_SIZE} vragen over {chapters.length}{" "}
							{chapters.length === 1 ? "onderwerp" : "onderwerpen"},
							niveau L1–L5 gelijk verdeeld. De toets verandert je voortgang
							niet. Nederlandse spelling telt streng (elke letter).
						</p>
					</div>
					<div className="flex shrink-0 flex-col items-end gap-3 sm:flex-row sm:items-center">
						<ThemeToggle />
						<Link
							href={`/period/${period.id}/${subject.id}`}
							className="pixel-btn bg-white px-3 py-1.5 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							← Onderwerpen
						</Link>
					</div>
				</div>
				<PeriodTestClient
					period={period}
					chapters={chapters}
					subject={{
						id: subject.id,
						label: subject.label,
						flag: subject.flag,
					}}
				/>
			</div>
		</div>
	);
}
