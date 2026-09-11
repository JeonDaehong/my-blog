import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudyList from "@/components/StudyList";
import { STUDY, loadStudyPosts } from "@/lib/study";

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

async function findCategory(slug: string) {
  return prisma.category.findFirst({
    where: { slug, blog: STUDY },
    select: { name: true, description: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await findCategory(decodeURIComponent(params.slug));
  return category ? { title: `${category.name} — 공부 블로그` } : {};
}

export default async function StudyCategoryPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const category = await findCategory(slug);
  if (!category) notFound();

  const posts = await loadStudyPosts(slug);

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-[24px] sm:text-[30px] font-bold tracking-tight text-text-primary">
          {category.name}
        </h1>
        <p className="mt-1 text-text-tertiary text-xs sm:text-sm">
          {posts.length}개의 글
        </p>
      </div>
      <StudyList posts={posts} />
    </>
  );
}
