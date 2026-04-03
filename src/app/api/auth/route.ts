import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthenticated, signToken, verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store, no-cache, must-revalidate" };
  if (await isAuthenticated()) {
    return NextResponse.json({ authenticated: true }, { headers });
  }
  return NextResponse.json({ authenticated: false }, { status: 401, headers });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRateLimit(`auth:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "너무 많은 로그인 시도입니다. 15분 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  const { password } = await req.json();

  // Support both hashed (ADMIN_PASSWORD_HASH) and legacy plaintext (ADMIN_PASSWORD)
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const legacyPassword = process.env.ADMIN_PASSWORD;

  let isValid = false;
  if (passwordHash) {
    isValid = verifyPassword(password, passwordHash);
  } else if (legacyPassword) {
    console.warn(
      "[auth] Using plaintext ADMIN_PASSWORD. Migrate to ADMIN_PASSWORD_HASH for security."
    );
    isValid = password === legacyPassword;
  }

  if (!isValid) {
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
