import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudyList from "@/components/StudyList";
import StudyHeading from "@/components/StudyHeading";
import StudyPagination from "@/components/StudyPagination";
import { STUDY, STUDY_PER_PAGE, loadStudyPage } from "@/lib/study";

/** 2페이지부터. 1페이지는 /study 가 맡는다. */
export const revalidate = 60;

type Props = { params: { n: string } };

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const page = Number(raw);
  return page >= 1 ? page : null;
}

export async function generateStaticParams() {
  try {
    const total = await prisma.post.count({ where: { published: true, blog: STUDY } });
    const totalPages = Math.ceil(total / STUDY_PER_PAGE);
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ n: String(i + 2) }));
  } catch (err) {
    console.error("[study/page] 페이지 수 조회 실패:", err);
    return [];
  }
}

export function generateMetadata({ params }: Props): Metadata {
  const page = parsePage(params.n);
  return { title: page ? `공부 블로그 (${page}페이지)` : "공부 블로그" };
}

export default async function StudyPaginatedPage({ params }: Props) {
  const page = parsePage(params.n);
  if (!page) notFound();
  if (page === 1) redirect("/study");

  const { posts, pagination } = await loadStudyPage(page);
  if (posts.length === 0) notFound();

  return (
    <>
      <StudyHeading
        title="공부 블로그"
        titleEn="Study Blog"
        subtitle={`${page}페이지`}
        subtitleEn={`Page ${page}`}
      />
      <StudyList posts={posts} />
      <StudyPagination pagination={pagination} />
    </>
  );
}
