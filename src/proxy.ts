import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	// Login page and APIs handle their own auth; only guard the triage UI.
	if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
		return NextResponse.next();
	}
	const token = request.cookies.get("marixtotle_admin")?.value;
	const adminId = token ? await verifySession(token) : null;
	if (!adminId) {
		const url = request.nextUrl.clone();
		url.pathname = "/admin/login";
		return NextResponse.redirect(url);
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/admin", "/admin/:path*"],
};
