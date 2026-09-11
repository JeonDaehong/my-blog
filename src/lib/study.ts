import { prisma } from "@/lib/prisma";
import { postSummarySelect } from "@/lib/queries";
import type { PostSummary } from "@/lib/types";

/**
 * 공부 블로그(/study) 쪽 조회. 기술 블로그와 글도 카테고리도 완전히 갈라져 있고,
 * 가르는 기준은 Post.blog / Category.blog 다.
 */
export const STUDY = "study";

export type StudyCategory = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  count: number;
};

function serialize(post: {
  createdAt: Date;
  category: { createdAt: Date; updatedAt: Date } | null;
}): PostSummary {
  return {
    ...(post as never as PostSummary),
    createdAt: post.createdAt.toISOString(),
    category: post.category
      ? {
          ...(post.category as never as PostSummary["category"]),
          createdAt: post.category.createdAt.toISOString(),
          updatedAt: post.category.updatedAt.toISOString(),
        }
      : null,
  } as PostSummary;
}

/** 공부 블로그 카테고리 — 글 수까지 함께. 헤더와 목록 필터가 같이 쓴다. */
export async function loadStudyCategories(): Promise<StudyCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { blog: STUDY },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        _count: { select: { posts: { where: { published: true } } } },
      },
    });
    return categories.map(({ _count, ...c }) => ({ ...c, count: _count.posts }));
  } catch (err) {
    console.error("[study] 카테고리를 불러오지 못했습니다:", err);
    return [];
  }
}

/** 공부 블로그 글 목록. categorySlug 를 주면 그 카테고리만. */
export async function loadStudyPosts(categorySlug?: string): Promise<PostSummary[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        blog: STUDY,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: postSummarySelect,
    });
    return posts.map(serialize);
  } catch (err) {
    console.error("[study] 글 목록을 불러오지 못했습니다:", err);
    return [];
  }
}
