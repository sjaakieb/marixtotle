import { ChapterBrowser } from "@/components/ChapterBrowser";
import { ThemeToggle } from "@/components/ThemeToggle";
import { chapters } from "@/content/chapters";

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
							Duolingo-variant voor huiswerk • Latijn • Frans • Engels • Grieks
							• Nederlands
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
						▶ Kies een taal en hoofdstuk
						<span className="animate-pixel-blink">_</span>
					</h2>
					<p className="mt-3 text-xl leading-snug text-stone-600 dark:text-stone-400">
						Hoofdletters maken niet uit en een enkele tikfout wordt meestal
						vergeven (maar wel gemeld) — ook een ontbrekend accent. Alleen
						bij Nederlandse werkwoordspelling telt elke letter. Gebruik de
						balk boven het invoerveld voor speciale tekens.
					</p>

					<div className="mt-6">
						<ChapterBrowser chapters={chapters} />
					</div>
				</div>

				<footer className="mt-8 text-center font-pixel text-[10px] leading-relaxed text-stone-500 dark:text-stone-500">
					Geen accounts • Voortgang blijft lokaal in je browser
				</footer>
			</main>
		</div>
	);
}
