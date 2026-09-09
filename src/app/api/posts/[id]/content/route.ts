import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";

/**
 * 언어를 전환했을 때만 호출되는 본문 렌더 엔드포인트.
 * 기본(한국어) 본문은 페이지에 이미 들어 있으므로 여기로 오지 않는다.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "ko";

  const post = await prisma.post.findUnique({
    where: { id: params.id, published: true },
    select: { content: true, contentEn: true },
  });

  if (!post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다" }, { status: 404 });
  }

  const source = locale === "en" ? post.contentEn : post.content;
  if (!source) {
    return NextResponse.json({ error: "해당 언어의 본문이 없습니다" }, { status: 404 });
  }

  const rendered = await renderMarkdown(source);

  return NextResponse.json(rendered, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
