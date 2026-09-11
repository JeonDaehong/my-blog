import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { postSummarySelect } from "@/lib/queries";
import StudyList from "@/components/StudyList";
import StudySearchHeading from "@/components/StudySearchHeading";
import { STUDY } from "@/lib/study";
import type { PostSummary } from "@/lib/types";

/* 검색은 질의어마다 달라지므로 캐시하지 않는다. 같은 글이 질의어 조합마다
   중복 색인되지 않도록 noindex 로 둔다 — 기술 블로그 /search 와 같은 규칙이다. */
export const dynamic = "force-dynamic";

type Props = { searchParams: { q?: string } };

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = searchParams.q?.trim();
  return {
    title: q ? `'${q}' 검색 결과 — 공부 블로그` : "검색 — 공부 블로그",
    robots: { index: false, follow: true },
  };
}

export default async function StudySearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() || null;

  let posts: PostSummary[] = [];
  if (q) {
    try {
      const rows = await prisma.post.findMany({
        where: {
          published: true,
          blog: STUDY,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { titleEn: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
            { excerptEn: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: postSummarySelect,
      });
      posts = rows.map((post) => ({
        ...(post as never as PostSummary),
        createdAt: post.createdAt.toISOString(),
        category: post.category
          ? {
              ...(post.category as never as PostSummary["category"]),
              createdAt: post.category.createdAt.toISOString(),
              updatedAt: post.category.updatedAt.toISOString(),
            }
          : null,
      })) as PostSummary[];
    } catch (err) {
      console.error("[study/search] 검색 실패:", err);
    }
  }

  return (
    <>
      <StudySearchHeading query={q} count={posts.length} />
      <StudyList posts={posts} />
    </>
  );
}
