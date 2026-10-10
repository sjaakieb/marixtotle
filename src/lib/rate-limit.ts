type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Fixed-window in-memory rate limiter. Single-instance safe
 * (the app runs as one container with one SQLite file).
 */
export function isRateLimited(
	key: string,
	limit: number,
	windowMs: number,
	now = Date.now(),
): boolean {
	const hit = buckets.get(key);
	if (!hit || hit.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return false;
	}
	hit.count += 1;
	// Opportunistic cleanup so the map can't grow unboundedly.
	if (buckets.size > 5000) {
		for (const [k, v] of buckets) {
			if (v.resetAt <= now) buckets.delete(k);
		}
	}
	return hit.count > limit;
}

export function clientIp(headers: Headers): string {
	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
	return headers.get("x-real-ip")?.trim() || "unknown";
}
