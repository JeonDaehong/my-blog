import { NextRequest, NextResponse } from "next/server";
import { fetchCommentCounts } from "@/lib/giscus";

const MAX_PATHS = 60;

// GET /api/comments?paths=/posts/a,/study/b → { "/posts/a": 2, "/study/b": 0 }
export async function GET(req: NextRequest) {
  const paths = (req.nextUrl.searchParams.get("paths") ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter((p) => /^\/(posts|study)\/[^/]+$/.test(p))
    .slice(0, MAX_PATHS);
  if (paths.length === 0) return NextResponse.json({});
  return NextResponse.json(await fetchCommentCounts(paths), {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
