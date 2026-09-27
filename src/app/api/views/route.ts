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
    // 목록용 묶음 조회는 엣지에 30초 캐시한다. 만료 뒤에도 옛 값을 바로 주고 뒤에서 새로 받아 오므로
    // 목록의 조회수가 DB(Neon) 가 깨어나는 동안 늦게 뜨지 않는다. 숫자는 최대 30초쯤 늦을 수 있다.
    return NextResponse.json(countMap, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=600" },
    });
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
