import type { NextRequest } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const admin = await getAdminFromRequest(request);
	if (!admin) {
		return Response.json({ admin: null }, { status: 401 });
	}
	return Response.json({ admin: { username: admin.username } });
}
