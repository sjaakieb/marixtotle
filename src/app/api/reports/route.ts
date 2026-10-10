import { randomUUID } from "node:crypto";
import { and, desc, eq, like, lt, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-session";
import { getDb } from "@/lib/db/client";
import { reports } from "@/lib/db/schema";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { createReportSchema, reportStatuses } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

function json(data: unknown, status = 200): Response {
	return Response.json(data, { status });
}

/** Anonymous report submission. Always returns ok:true to avoid oracle behavior. */
export async function POST(request: NextRequest) {
	const ip = clientIp(request.headers);
	if (
		isRateLimited(`report:min:${ip}`, 5, 60_000) ||
		isRateLimited(`report:day:${ip}`, 20, 24 * 60 * 60_000)
	) {
		return json(
			{ ok: false, error: "Te veel meldingen, probeer later opnieuw." },
			429,
		);
	}
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: "Ongeldige aanvraag." }, 400);
	}
	const parsed = createReportSchema.safeParse(body);
	if (!parsed.success) {
		return json({ ok: false, error: "Ongeldige melding." }, 400);
	}
	const input = parsed.data;
	// Honeypot: pretend success, store nothing.
	if (input.website.trim() !== "") {
		return json({ ok: true });
	}
	try {
		getDb()
			.insert(reports)
			.values({
				id: randomUUID(),
				createdAt: Date.now(),
				chapterId: input.chapterId,
				itemKey: input.itemKey,
				exerciseId: input.exerciseId,
				level: input.level ?? null,
				prompt: input.prompt,
				answer: input.answer,
				userInput: input.userInput ?? null,
				reason: input.reason,
				message: input.message,
				status: "open",
				adminNote: "",
			})
			.run();
	} catch {
		return json(
			{ ok: false, error: "Opslaan mislukt, probeer later opnieuw." },
			500,
		);
	}
	return json({ ok: true });
}

/** Admin-only report listing: ?status=&chapterId=&q=&cursor= (cursor = createdAt: id). */
export async function GET(request: NextRequest) {
	const admin = await getAdminFromRequest(request);
	if (!admin) return json({ error: "Niet ingelogd." }, 401);

	const url = request.nextUrl;
	const status = url.searchParams.get("status")?.trim() || "open";
	const chapterId = url.searchParams.get("chapterId")?.trim() || "";
	const q = url.searchParams.get("q")?.trim().slice(0, 120) || "";
	const cursor = url.searchParams.get("cursor")?.trim() || "";

	if (
		status !== "all" &&
		!(reportStatuses as readonly string[]).includes(status)
	) {
		return json({ error: "Ongeldige status." }, 400);
	}

	const conditions = [];
	if (status !== "all") conditions.push(eq(reports.status, status));
	if (chapterId) conditions.push(eq(reports.chapterId, chapterId));
	if (q) {
		const pattern = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
		conditions.push(
			or(
				like(reports.prompt, pattern),
				like(reports.answer, pattern),
				like(reports.message, pattern),
			),
		);
	}
	if (cursor) {
		const [tsRaw, id] = cursor.split(":");
		const ts = Number(tsRaw);
		if (Number.isFinite(ts) && id) {
			conditions.push(
				or(
					lt(reports.createdAt, ts),
					and(eq(reports.createdAt, ts), lt(reports.id, id)),
				),
			);
		}
	}

	try {
		const rows = getDb()
			.select()
			.from(reports)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(reports.createdAt), desc(reports.id))
			.limit(PAGE_SIZE + 1)
			.all();
		const hasMore = rows.length > PAGE_SIZE;
		const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
		const last = items[items.length - 1];
		return json({
			items,
			nextCursor: hasMore && last ? `${last.createdAt}:${last.id}` : null,
		});
	} catch {
		return json({ error: "Laden mislukt." }, 500);
	}
}
