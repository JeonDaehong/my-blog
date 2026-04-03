import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_VIEWED_PATHS = 100;

// GET: 조회수 가져오기
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  const paths = req.nextUrl.searchParams.get("paths");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 여러 경로의 조회수를 한 번에 가져오기 (batch)
  if (paths) {
    const pathList = paths
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const counts = await prisma.pageView.groupBy({
      by: ["path"],
      where: { path: { in: pathList } },
      _count: { path: true },
    });
    const countMap: Record<string, number> = {};
    for (const c of counts) {
      countMap[c.path] = c._count.path;
    }
    return NextResponse.json(countMap);
  }

  if (path) {
    const [total, today] = await Promise.all([
      prisma.pageView.count({ where: { path } }),
      prisma.pageView.count({ where: { path, viewedAt: { gte: todayStart } } }),
    ]);
    return NextResponse.json({ total, today });
  }

  const [total, today] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { viewedAt: { gte: todayStart } } }),
  ]);
  return NextResponse.json({ total, today });
}

// POST: 조회수 기록 (세션 쿠키 기반 중복 방지)
export async function POST(req: NextRequest) {
  const { path } = await req.json();
  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  // Check the session-scoped "viewed" cookie to avoid duplicate counts
  const viewedCookie = req.cookies.get("viewed")?.value;
  let viewed: string[] = [];
  try {
    viewed = viewedCookie ? JSON.parse(Buffer.from(viewedCookie, "base64").toString("utf8")) : [];
    if (!Array.isArray(viewed)) viewed = [];
  } catch {
    viewed = [];
  }

  if (viewed.includes(path)) {
    // Already counted in this session
    return NextResponse.json({ ok: true });
  }

  await prisma.pageView.create({ data: { path } });

  // Update the cookie (keep the last N paths)
  const updated = [...viewed, path].slice(-MAX_VIEWED_PATHS);
  const cookieValue = Buffer.from(JSON.stringify(updated)).toString("base64");

  const res = NextResponse.json({ ok: true });
  res.cookies.set("viewed", cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
  return res;
}
