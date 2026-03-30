import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthenticated, signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store, no-cache, must-revalidate" };
  if (await isAuthenticated()) {
    return NextResponse.json({ authenticated: true }, { headers });
  }
  return NextResponse.json({ authenticated: false }, { status: 401, headers });
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "비밀번호가 틀렸습니다" }, { status: 401 });
  }

  const token = signToken(`authenticated:${Date.now()}`);
  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}
