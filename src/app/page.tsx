import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
	getChaptersForPeriod,
	PERIODS,
} from "@/content/curriculum";
import { LANGUAGES } from "@/lib/languages";

export default function Home() {
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
							Hulp bij het leren op het Marnix
						</p>
					</div>
					<div className="ml-auto">
						<ThemeToggle />
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-5 pb-12">
				<div className="pixel-panel bg-white p-6 sm:p-8 dark:bg-stone-900">
					<h2 className="font-pixel text-xs leading-relaxed text-stone-900 dark:text-stone-50">
						▶ Kies een periode
						<span className="animate-pixel-blink">_</span>
					</h2>
					<div className="mt-6 grid gap-5">
						{PERIODS.map((period) => {
							const periodChapters = getChaptersForPeriod(
								period.year,
								period.period,
							);
							const vakken = LANGUAGES.filter((l) =>
								periodChapters.some(
									(c) => (c.language ?? "latin") === l.id,
								),
							);
							return (
								<div
									key={period.id}
									className="pixel-panel block bg-white p-4 dark:bg-stone-900"
								>
									<div className="flex items-center gap-2">
										<span className="text-xl">📚</span>
										<Link
											href={`/period/${period.id}`}
											className="font-pixel text-[11px] leading-relaxed text-stone-900 hover:underline dark:text-stone-50"
										>
											{period.title} →
										</Link>
										<span className="ml-auto font-terminal text-lg text-stone-400 dark:text-stone-500">
											{periodChapters.length}{" "}
											{periodChapters.length === 1
												? "opdracht"
												: "opdrachten"}
										</span>
									</div>
									{vakken.length > 0 && (
										<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
											{vakken.map((v) => (
												<Link
													key={v.id}
													href={`/period/${period.id}/${v.id}`}
													className="pixel-btn flex items-center gap-2 bg-stone-100 px-2 py-2 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-amber-950"
												>
													<span className="text-xl">{v.flag}</span>
													<span className="font-pixel text-[10px] leading-tight text-stone-700 dark:text-stone-200">
														{v.label}
													</span>
												</Link>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				<footer className="mt-8 text-center font-pixel text-[10px] leading-relaxed text-stone-500 dark:text-stone-500">
					Geen accounts • Voortgang blijft lokaal in je browser
				</footer>
			</main>
		</div>
	);
}
