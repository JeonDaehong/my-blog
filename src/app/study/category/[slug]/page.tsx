import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudyList from "@/components/StudyList";
import StudyHeading from "@/components/StudyHeading";
import StudySubCategories from "@/components/StudySubCategories";
import StudyPagination from "@/components/StudyPagination";
import { STUDY, loadStudyCategory, loadStudyCategoryPage } from "@/lib/study";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      where: { blog: STUDY },
      select: { slug: true },
    });
    return categories.map((category) => ({ slug: category.slug }));
  } catch (err) {
    console.error("[study/category] 카테고리 조회 실패:", err);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await loadStudyCategory(decodeURIComponent(params.slug));
  if (!category) return {};
  const path = category.parent ? `${category.parent.name} › ${category.name}` : category.name;
  return { title: `${path} — 공부 블로그` };
}

export default async function StudyCategoryPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const category = await loadStudyCategory(slug);
  if (!category) notFound();

  const { posts, pagination } = await loadStudyCategoryPage(slug, 1);

  return (
    <>
      <StudyHeading
        title={category.name}
        titleEn={category.nameEn}
        parent={category.parent}
        count={pagination.total}
      />
      {/* 하위 카테고리 — 상위를 열었을 때만 나온다 */}
      <StudySubCategories items={category.children} />
      <StudyList posts={posts} />
      <StudyPagination pagination={pagination} categorySlug={slug} />
    </>
  );
}
