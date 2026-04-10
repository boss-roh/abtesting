import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/auth";

export async function GET() {
  const valid = await validateAdminSession();
  return NextResponse.json({ authenticated: valid });
}
