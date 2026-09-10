import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostsClient from "../../PostsClient";
import { EMPTY_EXTRAS, POSTS_PER_PAGE, loadPosts } from "@/lib/posts-page";

/** 2페이지부터. 1페이지는 /posts가 맡는다. */
export const revalidate = 60;

type Props = { params: { n: string } };

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const page = Number(raw);
  return page >= 1 ? page : null;
}

export async function generateStaticParams() {
  try {
    const total = await prisma.post.count({ where: { published: true } });
    const totalPages = Math.ceil(total / POSTS_PER_PAGE);
    // 2페이지부터 미리 만들어 둔다. 없는 페이지는 요청이 올 때 처리한다.
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      n: String(i + 2),
    }));
  } catch (err) {
    console.error("[posts/page] 페이지 수 조회 실패:", err);
    return [];
  }
}

export function generateMetadata({ params }: Props): Metadata {
  const page = parsePage(params.n);
  return { title: page ? `전체 글 (${page}페이지)` : "전체 글" };
}

export default async function PostsPaginatedPage({ params }: Props) {
  const page = parsePage(params.n);
  if (!page) notFound();
  // /posts/page/1은 /posts와 같은 내용이라 한쪽으로 모은다.
  if (page === 1) redirect("/posts");

  const { posts, pagination } = await loadPosts(page);
  if (posts.length === 0) notFound();

  return (
    <PostsClient posts={posts} pagination={pagination} extras={EMPTY_EXTRAS} />
  );
}
