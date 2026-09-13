import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostsClient from "../../PostsClient";
import { POSTS_PER_PAGE, loadExtras, loadPosts } from "@/lib/posts-page";

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
    const total = await prisma.post.count({ where: { published: true, blog: "tech" } });
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

  // 사이드바는 1페이지에만 있는 것이 아니다. 페이지를 넘겨도 목록만 바뀌어야
  // 하므로 인기 글·최신 글·댓글도 같이 실어 보낸다.
  const [{ posts, pagination }, extras] = await Promise.all([
    loadPosts(page),
    loadExtras(),
  ]);
  if (posts.length === 0) notFound();

  return <PostsClient posts={posts} pagination={pagination} extras={extras} />;
}
