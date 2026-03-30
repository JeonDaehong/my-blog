import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_NAME = "admin_session";

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || "fallback-secret";
}

export function signToken(value: string): string {
  const hmac = crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${hmac}`;
}

export function verifyToken(token: string): boolean {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return false;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}
