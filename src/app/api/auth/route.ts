import { NextRequest, NextResponse } from "next/server";

const ADMIN_KEY = process.env.ADMIN_KEY!;

export async function POST(request: NextRequest) {
  const { key } = await request.json();

  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_key", key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_key");
  return response;
}
