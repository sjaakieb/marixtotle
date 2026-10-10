# Latijn Trainer

Duolingo-variant for Latin homework – Nederlands ↔ Latijn. Practice runs client-side (shuffled session, score at end); a small SQLite backend stores anonymous inaccuracy reports + admin triage.

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
- **Persistence (SQLite)**: the image declares `VOLUME /app/data`; mount it or reports + admin users are lost on redeploy:
  - CapRover: App Config → Persistent Directories → Container Path `/app/data`
  - Coolify: Service → Storages → Volume, destination `/app/data`
  - Keep replicas at 1 (SQLite can't be shared between containers)

## Foutmeldingen & beheer
- Learners can report an inaccurate question via **⚑ Fout melden** (anonymous, with reason + optional note). Stored in SQLite (`/app/data/app.db`, Drizzle + `better-sqlite3`).
- Triage at **`/admin`** (login required). Each report shows the source exercise id(s) — fix in `src/content` (`rg '<exerciseId>' src/content`), then mark **Opgelost** with the commit as note.
- Env (server only):
  - `DATABASE_URL=file:/app/data/app.db` (default), `DATA_DIR=/app/data`
  - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — seed the first admin on first boot (then you may unset them)
  - `SESSION_SECRET` — required, min 32 chars (signs admin session cookies)
- Password reset: set `ADMIN_USERNAME`/`ADMIN_PASSWORD` env, run `DELETE FROM admins;` on the SQLite file, then log in — the seed recreates the admin from env on the next auth request. Or: `sqlite3 /app/data/app.db ".backup backup.db"` for backups.

## Stack
Next.js 16 (App Router) + TypeScript + Tailwind 4 + zod + Vitest. Single container.
