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
  const { counts, source, reason } = await fetchCommentCounts(paths);
  return NextResponse.json(counts, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      // 토큰 경로(graphql)로 읽었는지, 공개 API(giscus)로 넘어갔는지. 토큰 설정을 확인할 때 본다.
      "X-Comment-Source": reason ? `${source}; ${reason.slice(0, 80)}` : source,
    },
  });
}
