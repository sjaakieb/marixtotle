import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-session";
import { getDb } from "@/lib/db/client";
import { reports } from "@/lib/db/schema";
import { updateReportSchema } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await getAdminFromRequest(request);
	if (!admin) {
		return Response.json({ error: "Niet ingelogd." }, { status: 401 });
	}
	const { id } = await params;
	if (!id || id.length > 64) {
		return Response.json({ error: "Ongeldige id." }, { status: 400 });
	}
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Ongeldige aanvraag." }, { status: 400 });
	}
	const parsed = updateReportSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ error: "Ongeldige status." }, { status: 400 });
	}
	try {
		const db = getDb();
		const existing = db
			.select()
			.from(reports)
			.where(eq(reports.id, id))
			.limit(1)
			.all();
		if (!existing[0]) {
			return Response.json({ error: "Niet gevonden." }, { status: 404 });
		}
		db.update(reports)
			.set({ status: parsed.data.status, adminNote: parsed.data.adminNote })
			.where(eq(reports.id, id))
			.run();
		return Response.json({ ok: true });
	} catch {
		return Response.json({ error: "Opslaan mislukt." }, { status: 500 });
	}
}
