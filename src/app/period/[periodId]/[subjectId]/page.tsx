import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterList } from "@/components/ChapterBrowser";
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

export default async function SubjectPage({
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
			<header className="mx-auto max-w-3xl px-5 py-6 sm:py-8">
				<div className="flex items-center gap-4">
					<div className="pixel-btn flex h-12 w-12 items-center justify-center bg-amber-400 font-pixel text-lg text-stone-900">
						M!
					</div>
					<div>
						<h1 className="font-pixel text-sm tracking-tight text-stone-900 sm:text-base dark:text-stone-50">
							Marixtotle
						</h1>
						<p className="mt-2 text-xl leading-none text-stone-600 dark:text-stone-400">
							{period.title} • {subject.flag} {subject.label}
						</p>
					</div>
					<div className="ml-auto flex items-center gap-3">
						<ThemeToggle />
						<Link
							href={`/period/${period.id}`}
							className="pixel-btn bg-white px-3 py-1.5 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							← Vakken
						</Link>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-5 pb-12">
				<div className="pixel-panel bg-white p-6 sm:p-8 dark:bg-stone-900">
					<h2 className="font-pixel text-xs leading-relaxed text-stone-900 dark:text-stone-50">
						▶ {subject.flag} {subject.label}: kies een onderwerp
						<span className="animate-pixel-blink">_</span>
					</h2>
					<p className="mt-3 text-xl leading-snug text-stone-600 dark:text-stone-400">
						{subject.description}. Hoofdletters maken niet uit en een enkele
						tikfout wordt meestal vergeven (maar wel gemeld) — ook een
						ontbrekend accent. Alleen bij Nederlandse werkwoordspelling telt
						elke letter.
					</p>

					<Link
						href={`/test/period/${period.id}/${subject.id}`}
						className="pixel-panel mt-6 block bg-amber-100 p-4 hover:bg-amber-50 dark:bg-amber-950 dark:hover:bg-amber-900"
						title={`Periode-toets ${subject.label}: ${PERIOD_TEST_SIZE} vragen over alle onderwerpen van dit vak, niveau L1–L5 gelijk verdeeld`}
					>
						<div className="flex items-center gap-2">
							<span className="text-sm">★</span>
							<span className="font-pixel text-[11px] leading-relaxed text-stone-900 dark:text-stone-50">
								Periode-toets {subject.label} →
							</span>
						</div>
					<div className="mt-1 text-xl leading-tight text-stone-600 dark:text-stone-400">
						{PERIOD_TEST_SIZE} vragen over alle {chapters.length}{" "}
						{chapters.length === 1 ? "onderwerp" : "onderwerpen"} •
						L1–L5 gelijk verdeeld
						{subject.id === "dutch" && " • spelling telt streng"}
					</div>
					</Link>

					{subject.id == "topo" ? (
						<Link
							href={`/fly/period/${period.id}`}
							className="pixel-panel mt-4 block bg-teal-100 p-4 hover:bg-teal-50 dark:bg-teal-950 dark:hover:bg-teal-900"
							title={"Periode-vlucht: vlieg alle regios van " + period.id}
						>
							<div className="flex items-center gap-2">
								<span className="text-sm">🚁</span>
								<span className="font-pixel text-[11px] leading-relaxed text-stone-900 dark:text-stone-50">
									{chapters.length == 1
										? "Periode-vlucht →"
										: chapters.length < 5
											? "Periode-vlucht Aardrijkskunde →"
											: "GROTE Periode-vlucht Aardrijkskunde →"}
								</span>
							</div>
							<div className="mt-1 text-xl leading-tight text-stone-600 dark:text-stone-400">
								Vlieg alle {chapters.length} regio&apos;s door elkaar (zonder
								examen) • telt niet mee voor beheersing
								{/* TODO: aantal landen tonen lol */}
							</div>
						</Link>
					) : null}

					<div className="mt-6">
						<ChapterList chapters={chapters} />
					</div>
				</div>

				<footer className="mt-8 text-center font-pixel text-[10px] leading-relaxed text-stone-500 dark:text-stone-500">
					Geen accounts • Voortgang blijft lokaal in je browser
				</footer>
			</main>
		</div>
	);
}
