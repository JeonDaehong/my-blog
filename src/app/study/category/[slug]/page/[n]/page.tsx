import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import StudyList from "@/components/StudyList";
import StudyHeading from "@/components/StudyHeading";
import StudySubCategories from "@/components/StudySubCategories";
import StudyPagination from "@/components/StudyPagination";
import {
  STUDY_PER_PAGE,
  loadStudyCategories,
  loadStudyCategory,
  loadStudyCategoryPage,
} from "@/lib/study";

/** 카테고리 목록의 2페이지부터. 1페이지는 /study/category/[slug]가 맡는다. */
export const revalidate = 60;

type Props = { params: { slug: string; n: string } };

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const page = Number(raw);
  return page >= 1 ? page : null;
}

export async function generateStaticParams() {
  try {
    // 상위 카테고리의 count 에는 하위 글까지 들어 있다 — 목록과 같은 기준이다.
    const tops = await loadStudyCategories();
    const all = tops.flatMap((top) => [top, ...top.children]);
    return all.flatMap((category) => {
      const totalPages = Math.ceil(category.count / STUDY_PER_PAGE);
      return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
        slug: category.slug,
        n: String(i + 2),
      }));
    });
  } catch (err) {
    console.error("[study/category/page] 페이지 수 조회 실패:", err);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await loadStudyCategory(decodeURIComponent(params.slug));
  if (!category) return {};
  const page = parsePage(params.n);
  const path = category.parent ? `${category.parent.name} › ${category.name}` : category.name;
  return { title: page ? `${path} (${page}페이지) — 공부 블로그` : `${path} — 공부 블로그` };
}

export default async function StudyCategoryPaginatedPage({ params }: Props) {
  const page = parsePage(params.n);
  if (!page) notFound();
  const slug = decodeURIComponent(params.slug);
  // 1페이지는 카테고리 첫 화면과 같은 내용이라 한쪽으로 모은다.
  if (page === 1) redirect(`/study/category/${params.slug}`);

  const category = await loadStudyCategory(slug);
  if (!category) notFound();

  const { posts, pagination } = await loadStudyCategoryPage(slug, page);
  if (posts.length === 0) notFound();

  return (
    <>
      <StudyHeading
        title={category.name}
        titleEn={category.nameEn}
        parent={category.parent}
        count={pagination.total}
      />
      <StudySubCategories items={category.children} />
      <StudyList posts={posts} />
      <StudyPagination pagination={pagination} categorySlug={slug} />
    </>
  );
}
