// Highscores in localStorage.
// Elke vlucht mixt beide vraagrichtingen, dus één ranglijst per level
// (mix-key). Oude eenzijdige Topokopter-scores blijven onaangeroerd staan.
export type Store = Pick<Storage, "getItem" | "setItem">;

export function bestKey(level: number): string {
	return `topokopter_best_heli_lvl${level}_mix`;
}

export function getBest(
	store: Pick<Storage, "getItem">,
	level: number,
): number {
	return +(store.getItem(bestKey(level)) ?? 0);
}

export function setBest(store: Store, level: number, score: number): void {
	if (score > getBest(store, level)) {
		store.setItem(bestKey(level), String(score));
	}
}
