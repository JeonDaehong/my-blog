import { NextRequest, NextResponse } from "next/server";

function getSecret(): string {
  return process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "fallback-secret";
}

async function verifyToken(token: string): Promise<boolean> {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return false;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signedBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  const expected = Array.from(new Uint8Array(signedBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (sig.length !== expected.length) return false;

  // Constant-time byte comparison
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const isValid = token ? await verifyToken(token) : false;

  if (!isValid) {
    return NextResponse.redirect(new URL("/wjseoghd", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wjseoghd/write/:path*"],
};
