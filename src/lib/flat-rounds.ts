/**
 * Flat practice rounds (Dutch spelling chapters): the full exercise list is
 * shuffled once, then served in fixed-size rounds without repetition, so N
 * rounds cover every question exactly once before reshuffling.
 */
export const FLAT_ROUND_SIZE = 10;

export function takeFlatRound<T>(
	items: T[],
	offset: number,
	size: number = FLAT_ROUND_SIZE,
): T[] {
	if (offset < 0) return [];
	return items.slice(offset, offset + size);
}

export function nextFlatOffset(
	offset: number,
	size: number,
	total: number,
): { offset: number; wrapped: boolean } {
	if (total <= 0 || offset + size >= total) {
		return { offset: 0, wrapped: total > 0 };
	}
	return { offset: offset + size, wrapped: false };
}
