import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const isValid = token ? verifyToken(token) : false;

  if (!isValid) {
    return NextResponse.redirect(new URL("/wjseoghd", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wjseoghd/write/:path*"],
};
