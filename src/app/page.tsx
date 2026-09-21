import { ChapterBrowser } from "@/components/ChapterBrowser";
import { chapters } from "@/content/chapters";

export default function Home() {
	return (
		<div className="min-h-dvh bg-stone-50">
			<header className="mx-auto max-w-3xl px-5 py-6 sm:py-8">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 font-bold text-white">
						M
					</div>
					<div>
						<h1 className="text-xl font-extrabold tracking-tight text-stone-900">
							Marixtotle
						</h1>
						<p className="text-sm text-stone-600">
							Duolingo-variant voor huiswerk • Latijn • Frans • Engels • Grieks
						</p>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-5 pb-12">
				<div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 sm:p-8">
					<h2 className="text-lg font-semibold text-stone-900">
						Kies een taal en hoofdstuk
					</h2>
					<p className="mt-1 text-sm text-stone-600">
						Alle oefeningen zijn strict: hoofdletter maakt niet uit, maar
						diakritische tekens (ā ē ī ō ū, é è ç, ά έ) wel. Gebruik de balk
						boven het invoerveld.
					</p>

					<div className="mt-6">
						<ChapterBrowser chapters={chapters} />
					</div>

					<div className="mt-8 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
						<div className="text-sm font-semibold text-amber-900">
							Zelf content toevoegen?
						</div>
						<div className="mt-1 text-sm text-amber-800">
							Bewerk{" "}
							<code className="rounded bg-amber-900/10 px-1 py-0.5 font-mono text-xs">
								src/content/chapters.ts
							</code>{" "}
							— voeg een nieuw object toe aan{" "}
							<code className="font-mono">rawChapters</code>. Nieuwe
							hoofdstukken verschijnen automatisch. Zie{" "}
							<code className="rounded bg-amber-900/10 px-1 py-0.5 font-mono text-xs">
								src/content/latin/
							</code>{" "}
							en{" "}
							<code className="rounded bg-amber-900/10 px-1 py-0.5 font-mono text-xs">
								src/content/french/
							</code>{" "}
							als voorbeeld.
						</div>
					</div>
				</div>

				<footer className="mt-6 text-center text-xs text-stone-400">
					Geen accounts, geen opslag. Alles draait lokaal in je browser. •
					Gebouwd voor CapRover / Coolify
				</footer>
			</main>
		</div>
	);
}
