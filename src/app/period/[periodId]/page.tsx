import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
	getChaptersForPeriod,
	getPeriodById,
	PERIODS,
} from "@/content/curriculum";
import { LANGUAGES } from "@/lib/languages";

export function generateStaticParams() {
	return PERIODS.map((p) => ({ periodId: p.id }));
}

export default async function PeriodPage({
	params,
}: {
	params: Promise<{ periodId: string }>;
}) {
	const { periodId } = await params;
	const period = getPeriodById(periodId);
	if (!period) notFound();
	const chapters = getChaptersForPeriod(period.year, period.period);
	const subjects = LANGUAGES.map((lang) => ({
		lang,
		chapters: chapters.filter((c) => (c.language ?? "latin") === lang.id),
	})).filter((g) => g.chapters.length > 0);

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
							{period.title}
						</p>
					</div>
					<div className="ml-auto flex items-center gap-3">
						<ThemeToggle />
						<Link
							href="/"
							className="pixel-btn bg-white px-3 py-1.5 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							← Periodes
						</Link>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-5 pb-12">
				<div className="pixel-panel bg-white p-6 sm:p-8 dark:bg-stone-900">
					<h2 className="font-pixel text-xs leading-relaxed text-stone-900 dark:text-stone-50">
						▶ Kies een vak
						<span className="animate-pixel-blink">_</span>
					</h2>
					<div className="mt-6">
						{subjects.length === 0 ? (
							<div className="pixel-panel bg-white p-6 text-center text-xl text-stone-500 dark:bg-stone-900 dark:text-stone-400">
								Nog geen opdrachten — hier komen nieuwe opdrachten.
							</div>
						) : (
							<div className="grid gap-4 sm:grid-cols-2">
								{subjects.map(({ lang, chapters: subjectChapters }) => (
									<Link
										key={lang.id}
										href={`/period/${period.id}/${lang.id}`}
										className="pixel-panel group block bg-white p-4 hover:bg-amber-50 dark:bg-stone-900 dark:hover:bg-amber-950"
									>
										<div className="flex items-center gap-2">
											<span className="text-xl">{lang.flag}</span>
											<span className="font-pixel text-[11px] leading-relaxed text-stone-900 dark:text-stone-50">
												{lang.label} →
											</span>
											<span className="ml-auto font-terminal text-lg text-stone-400 dark:text-stone-500">
												{subjectChapters.length}{" "}
												{subjectChapters.length === 1
													? "onderwerp"
													: "onderwerpen"}
											</span>
										</div>
										<div className="mt-1 text-xl leading-tight text-stone-600 dark:text-stone-400">
											{lang.description}
										</div>
									</Link>
								))}
							</div>
						)}
					</div>
				</div>

				<footer className="mt-8 text-center font-pixel text-[10px] leading-relaxed text-stone-500 dark:text-stone-500">
					Geen accounts • Voortgang blijft lokaal in je browser
				</footer>
			</main>
		</div>
	);
}
