import Link from "next/link";
import { chapters } from "@/content/chapters";

export default function Home() {
  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="mx-auto max-w-3xl px-5 py-6 sm:py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 font-bold text-white">
            L
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-stone-900">
              Latijn Trainer
            </h1>
            <p className="text-sm text-stone-600">
              Duolingo-variant voor huiswerk • Nederlands ↔ Latijn
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-12">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">Kies een hoofdstuk</h2>
          <p className="mt-1 text-sm text-stone-600">
            Alle oefeningen zijn strict: hoofdletter maakt niet uit, maar macrons (ā ē ī ō ū) wel. Gebruik de macron-balk bij Latijnse antwoorden.
          </p>

          <div className="mt-6 grid gap-4">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/play/${ch.id}`}
                className="group rounded-xl border border-stone-200 bg-white p-4 hover:border-sky-300 hover:bg-sky-50/50 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-stone-900 group-hover:text-sky-700">
                      {ch.title}
                    </div>
                    {ch.description && (
                      <div className="mt-1 text-sm text-stone-600">{ch.description}</div>
                    )}
                    <div className="mt-2 text-xs font-medium text-stone-500">
                      {ch.exercises.length} oefeningen • Woordenschat & verbuiging
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-sky-700">
                    Start →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <div className="text-sm font-semibold text-amber-900">Zelf content toevoegen?</div>
            <div className="mt-1 text-sm text-amber-800">
              Bewerk <code className="rounded bg-amber-900/10 px-1 py-0.5 font-mono text-xs">src/content/chapters.ts</code> — voeg een nieuw object toe aan <code className="font-mono">rawChapters</code>. Zie Caput 3 als voorbeeld. Nieuwe hoofdstukken verschijnen automatisch.
            </div>
          </div>
        </div>

        <footer className="mt-6 text-center text-xs text-stone-400">
          Geen accounts, geen opslag. Alles draait lokaal in je browser. • Gebouwd voor CapRover / Coolify
        </footer>
      </main>
    </div>
  );
}
