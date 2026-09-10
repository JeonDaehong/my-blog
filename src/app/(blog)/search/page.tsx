import type { Metadata } from "next";
import PostsClient from "../posts/PostsClient";
import { EMPTY_EXTRAS, loadPosts } from "@/lib/posts-page";

/*
  검색만 동적으로 남긴다. 목록 첫 화면과 페이지네이션은 캐시되고, 매번 새로
  질의해야 하는 건 여기뿐이다. 검색 결과는 색인시키지 않는다 — 같은 글이
  질의어 조합마다 중복 노출되는 걸 막기 위해서다.
*/
export const dynamic = "force-dynamic";

type Props = { searchParams: { q?: string; page?: string } };

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = searchParams.q?.trim();
  return {
    title: q ? `'${q}' 검색 결과` : "검색",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() || null;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const { posts, pagination } = q
    ? await loadPosts(page, q)
    : { posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };

  return (
    <PostsClient
      posts={posts}
      pagination={pagination}
      query={q}
      extras={EMPTY_EXTRAS}
    />
  );
}
