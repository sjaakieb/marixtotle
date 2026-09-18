# Latijn Trainer

Duolingo-variant for Latin homework – Nederlands ↔ Latijn. Weekend MVP, web only, no backend/DB.

## Features
- **Woordenschat** `nl→la` and `la→nl` + **verbuiging/vervoeging** drills
- **Text input** or **multiple choice** per exercise (explicit `options` in JSON)
- **Strict matching**: case-insensitive, whitespace-agnostic, **macron-sensitive** (`puella` ≠ `puellā`)
- **Macron toolbar**: clickable `ā ē ī ō ū / Ā Ē Ī ō Ū` + `a ↔ ā` toggle for last char before cursor
- No persistence / no auth / runs entirely client-side (shuffled session, score at end)

## Content
Edit `src/content/chapters.ts` -> `rawChapters`. Zod-validated at build time.
See `src/lib/schema.ts:1` for types. Example in `src/content/chapters.ts:1` (Caput 1-3).

```ts
{
  id: "caput-1",
  title: "Caput 1",
  exercises: [
    { id: "v1", type: "vocab", prompt: "het meisje", answer: "puella", direction: "nl->la" },
    { id: "v2", type: "vocab", prompt: "puella", answer: "het meisje", direction: "la->nl", options: ["het meisje", "de jongen"] },
    { id: "d1", type: "declension", prompt: "rosa – gen. sg.", answer: "rosae", form: "gen. sg." }
  ]
}
```

## Getting Started
```bash
npm install
npm run dev   # http://localhost:3000
npm test      # vitest
npm run build
```

## Deploy (CapRover / Coolify)
- **Dockerfile** at root uses Next.js `output: "standalone"` (multi-stage, runs on :3000)
- **Coolify**: New Service → From Git → Build Pack: Dockerfile → Port 3000
- **CapRover**: `captain-definition` present → Deploy via `caprover deploy` or Git
- Env: `PORT=3000`, `HOSTNAME=0.0.0.0` already set in Dockerfile

## Stack
Next.js 16 (App Router) + TypeScript + Tailwind 4 + zod + Vitest. Single container.
