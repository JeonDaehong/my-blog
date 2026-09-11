import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudyList from "@/components/StudyList";
import { STUDY, loadStudyCategory, loadStudyPosts } from "@/lib/study";

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

  const posts = await loadStudyPosts(slug);

  return (
    <>
      <div className="mb-5 sm:mb-7">
        {category.parent && (
          <Link
            href={`/study/category/${category.parent.slug}`}
            className="text-[13px] text-text-tertiary hover:text-accent transition-colors"
          >
            {category.parent.name}
          </Link>
        )}
        <h1 className="text-[24px] sm:text-[30px] font-bold tracking-tight text-text-primary">
          {category.name}
        </h1>
        <p className="mt-1 text-text-tertiary text-xs sm:text-sm">
          {posts.length}개의 글
        </p>
      </div>

      {/* 하위 카테고리 — 상위를 열었을 때만 나온다 */}
      {category.children.length > 0 && (
        <nav className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/study/category/${child.slug}`}
              className="px-3 py-1.5 rounded-full text-[13px] bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
            >
              {child.name}
              {child.count > 0 && (
                <span className="ml-1.5 text-text-tertiary tabular-nums">{child.count}</span>
              )}
            </Link>
          ))}
        </nav>
      )}

      <StudyList posts={posts} />
    </>
  );
}
