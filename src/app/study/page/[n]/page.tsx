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
      {/* 머리말은 1페이지와 같아야 한다. 몇 페이지인지는 아래 페이지 버튼이
          이미 알려주므로, 여기서 블로그 설명을 페이지 번호로 갈아치우면
          페이지를 넘길 때 화면 윗부분이 바뀌어 딴 곳에 온 것처럼 보인다. */}
      <StudyHeading
        title="공부 블로그"
        titleEn="Study Blog"
        subtitle="개인 공부, 사이드 프로젝트, 그 밖의 기록"
        subtitleEn="Personal study, side projects, and everything else"
      />
      <StudyList posts={posts} />
      <StudyPagination pagination={pagination} />
    </>
  );
}
