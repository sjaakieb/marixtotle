import { ChapterBrowser } from "@/components/ChapterBrowser";
import { ThemeToggle } from "@/components/ThemeToggle";
import { chapters } from "@/content/chapters";

export default function Home() {
	return (
		<div className="min-h-dvh bg-stone-50 dark:bg-stone-950">
			<header className="mx-auto max-w-3xl px-5 py-6 sm:py-8">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 font-bold text-white">
						M
					</div>
					<div>
						<h1 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
							Marixtotle
						</h1>
						<p className="text-sm text-stone-600 dark:text-stone-400">
							Duolingo-variant voor huiswerk • Latijn • Frans • Engels • Grieks
						</p>
					</div>
					<div className="ml-auto">
						<ThemeToggle />
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-5 pb-12">
				<div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 sm:p-8 dark:bg-stone-900 dark:ring-stone-800">
					<h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
						Kies een taal en hoofdstuk
					</h2>
					<p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
						Hoofdletters maken niet uit en een enkele tikfout wordt vergeven
						(maar wel gemeld) — ook een ontbrekend accent. Gebruik de balk boven
						het invoerveld voor speciale tekens.
					</p>

					<div className="mt-6">
						<ChapterBrowser chapters={chapters} />
					</div>
				</div>

				<footer className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
					Geen accounts. Voortgang (niveau per woord) wordt lokaal in je browser
					bewaard.
				</footer>
			</main>
		</div>
	);
}
