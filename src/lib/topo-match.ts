/**
 * Topografie-grading, geport uit Topokopter (src/game/match.ts).
 * Bewust los van matcher.ts: topo is accent-insensitief en typo-tolerant,
 * terwijl talen macron-/accentgevoelig nakijken.
 */
export function topoNorm(s: string | null | undefined): string {
	return (s ?? "")
		.toLowerCase()
		.trim()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/['’`]/g, "")
		.replace(/[^a-z0-9 ]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function topoVariants(namen: readonly string[]): Set<string> {
	const out = new Set<string>();
	for (const a of namen) {
		const n = topoNorm(a);
		out.add(n);
		if (n.startsWith("washington")) out.add("washington");
		if (n.includes("mexico")) {
			out.add("mexico stad");
			out.add("mexico");
		}
		if (n.includes("new delhi")) {
			out.add("new delhi");
			out.add("delhi");
		}
		if (n.includes("n djamena") || n.includes("ndjamena")) {
			out.add("n djamena");
			out.add("ndjamena");
		}
	}
	return out;
}

export function topoLevenshtein(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	if (!m) return n;
	if (!n) return m;
	const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [
		i,
		...Array(n).fill(0),
	]);
	for (let j = 1; j <= n; j++) d[0]![j] = j;
	for (let i = 1; i <= m; i++)
		for (let j = 1; j <= n; j++)
			d[i]![j] = Math.min(
				d[i - 1]![j]! + 1,
				d[i]![j - 1]! + 1,
				d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
	return d[m]![n]!;
}

export type TopoGrade = "exact" | "typo" | "wrong";

/**
 * Eén spelfout (afstand 1) toestaan bij antwoorden van 5+ letters,
 * verder exacte match. "exact" = letterlijk (na normalisatie) goed,
 * "typo" = vergeven tikfoutje (UI toont "Let op, typfoutje").
 */
export function gradeTopo(
	ingevoerd: string,
	goedeLijst: readonly string[],
): TopoGrade {
	const n = topoNorm(ingevoerd);
	if (!n) return "wrong";
	const set = topoVariants(goedeLijst);
	if (set.has(n)) return "exact";
	for (const g of set) {
		if (Math.abs(g.length - n.length) > 1) continue;
		if (n.length >= 5 && topoLevenshtein(n, g) === 1) return "typo";
	}
	return "wrong";
}

export function isTopoCorrect(
	ingevoerd: string,
	goedeLijst: readonly string[],
): boolean {
	return gradeTopo(ingevoerd, goedeLijst) !== "wrong";
}
