import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryClient from "../../CategoryClient";
import { POSTS_PER_PAGE, loadCategoryPage } from "@/lib/posts-page";

/** 카테고리 목록의 2페이지부터. 1페이지는 /category/[slug]가 맡는다. */
export const revalidate = 60;

type Props = { params: { slug: string; n: string } };

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const page = Number(raw);
  return page >= 1 ? page : null;
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      where: { blog: "tech" },
      select: { slug: true, _count: { select: { posts: true } } },
    });
    // 2페이지부터 미리 만들어 둔다. 없는 페이지는 요청이 올 때 처리한다.
    return categories.flatMap((category) => {
      const totalPages = Math.ceil(category._count.posts / POSTS_PER_PAGE);
      return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
        slug: category.slug,
        n: String(i + 2),
      }));
    });
  } catch (err) {
    console.error("[category/page] 페이지 수 조회 실패:", err);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const category = await prisma.category.findFirst({ where: { slug, blog: "tech" } });
  if (!category) return {};
  const page = parsePage(params.n);
  return { title: page ? `${category.name} (${page}페이지)` : category.name };
}

export default async function CategoryPaginatedPage({ params }: Props) {
  const page = parsePage(params.n);
  if (!page) notFound();
  // 1페이지는 카테고리 첫 화면과 같은 내용이라 한쪽으로 모은다.
  if (page === 1) redirect(`/category/${params.slug}`);

  const data = await loadCategoryPage(decodeURIComponent(params.slug), page);
  if (!data || data.category.posts.length === 0) notFound();

  return (
    <CategoryClient
      category={JSON.parse(JSON.stringify(data.category))}
      pagination={data.pagination}
    />
  );
}
