import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 조회수 가져오기
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  const paths = req.nextUrl.searchParams.get("paths");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 여러 경로의 조회수를 한 번에 가져오기 (batch)
  if (paths) {
    const pathList = paths.split(",").map((p) => p.trim()).filter(Boolean);
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
    // 특정 페이지 조회수
    const [total, today] = await Promise.all([
      prisma.pageView.count({ where: { path } }),
      prisma.pageView.count({ where: { path, viewedAt: { gte: todayStart } } }),
    ]);
    return NextResponse.json({ total, today });
  }

  // 전체 사이트 조회수
  const [total, today] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { viewedAt: { gte: todayStart } } }),
  ]);
  return NextResponse.json({ total, today });
}

// POST: 조회수 기록
export async function POST(req: NextRequest) {
  const { path } = await req.json();
  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  await prisma.pageView.create({ data: { path } });
  return NextResponse.json({ ok: true });
}
