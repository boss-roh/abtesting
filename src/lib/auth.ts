import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_KEY = process.env.API_KEY!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

export function validateApiKey(request: NextRequest): NextResponse | null {
  const key = request.headers.get("x-api-key");
  if (key === API_KEY || key === ADMIN_KEY) return null;
  return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
}

export function validateAdminKey(request: NextRequest): NextResponse | null {
  const key = request.headers.get("x-api-key");
  if (key === ADMIN_KEY) return null;
  return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
}

export async function validateAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_key")?.value === ADMIN_KEY;
}
