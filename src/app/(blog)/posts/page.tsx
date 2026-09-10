import type { Metadata } from "next";
import PostsClient from "./PostsClient";
import { loadExtras, loadPosts } from "@/lib/posts-page";

/*
  이 페이지는 searchParams를 읽지 않는다. 하나라도 읽으면 라우트 전체가 동적이
  되어 방문할 때마다 함수가 뜨고 DB를 치는데, 유휴 상태에서 첫 진입이 4초를
  넘던 원인이 그것이었다. 페이지네이션은 /posts/page/[n], 검색은 /search가
  맡고 여기는 정적으로 캐시된 뒤 60초마다 재생성된다.
*/
export const revalidate = 60;

export const metadata: Metadata = { title: "전체 글" };

export default async function PostsPage() {
  const [{ posts, pagination }, extras] = await Promise.all([
    loadPosts(1),
    loadExtras(),
  ]);

  return <PostsClient posts={posts} pagination={pagination} extras={extras} />;
}
