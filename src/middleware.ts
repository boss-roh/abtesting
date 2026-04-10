import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth endpoints - no protection needed
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Swagger spec endpoint - no protection
  if (pathname === "/api/docs") {
    return NextResponse.next();
  }

  // Public assign API - requires API_KEY or ADMIN_KEY
  if (pathname === "/api/assign") {
    const apiKey = request.headers.get("x-api-key");
    if (apiKey === process.env.API_KEY || apiKey === process.env.ADMIN_KEY) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Management API (/api/experiments/*) - requires ADMIN_KEY header or admin cookie
  if (pathname.startsWith("/api/experiments")) {
    const apiKey = request.headers.get("x-api-key");
    const cookieKey = request.cookies.get("admin_key")?.value;

    if (
      apiKey === process.env.ADMIN_KEY ||
      cookieKey === process.env.ADMIN_KEY
    ) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // UI pages (/, /experiments/*, /docs) - allow access, auth checked client-side
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
