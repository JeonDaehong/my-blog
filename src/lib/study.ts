import { prisma } from "@/lib/prisma";
import { postSummarySelect } from "@/lib/queries";
import type { PaginationMeta, PostSummary } from "@/lib/types";

/**
 * 공부 블로그(/study) 쪽 조회. 기술 블로그와 글도 카테고리도 완전히 갈라져 있고,
 * 가르는 기준은 Post.blog / Category.blog 다.
 *
 * 카테고리는 두 단계다. 최상위(개인 공부 · 사이드 프로젝트 · 기타) 아래에
 * 하위 카테고리가 붙고(예: 개인 공부 > Spark), 상위 목록은 하위 글까지 함께 보여준다.
 */
export const STUDY = "study";

/** 기술 블로그와 같은 기준으로 한 페이지에 5개씩 */
export const STUDY_PER_PAGE = 5;

export type StudySubCategory = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  count: number;
};

export type StudyCategory = StudySubCategory & {
  children: StudySubCategory[];
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

const publishedCount = { select: { posts: { where: { published: true } } } } as const;

/** 최상위 카테고리와 그 하위들. 상위 글 수에는 하위 글도 더한다. */
export async function loadStudyCategories(): Promise<StudyCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { blog: STUDY, parentId: null },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        _count: publishedCount,
        children: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, nameEn: true, slug: true, _count: publishedCount },
        },
      },
    });

    return categories.map((c) => {
      const children = c.children.map(({ _count, ...ch }) => ({ ...ch, count: _count.posts }));
      return {
        id: c.id,
        name: c.name,
        nameEn: c.nameEn,
        slug: c.slug,
        count: c._count.posts + children.reduce((sum, ch) => sum + ch.count, 0),
        children,
      };
    });
  } catch (err) {
    console.error("[study] 카테고리를 불러오지 못했습니다:", err);
    return [];
  }
}

export type StudyCategoryDetail = {
  name: string;
  nameEn: string | null;
  slug: string;
  parent: { name: string; nameEn: string | null; slug: string } | null;
  children: StudySubCategory[];
};

/** 카테고리 하나와 그 하위 목록. 없으면 null. */
export async function loadStudyCategory(slug: string): Promise<StudyCategoryDetail | null> {
  try {
    const found = await prisma.category.findFirst({
      where: { slug, blog: STUDY },
      select: {
        name: true,
        nameEn: true,
        slug: true,
        parent: { select: { name: true, nameEn: true, slug: true } },
        children: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, nameEn: true, slug: true, _count: publishedCount },
        },
      },
    });
    if (!found) return null;
    return {
      ...found,
      children: found.children.map(({ _count, ...ch }) => ({ ...ch, count: _count.posts })),
    };
  } catch (err) {
    console.error("[study] 카테고리 조회 실패:", err);
    return null;
  }
}

/**
 * 공부 블로그 글 목록. categorySlug 를 주면 그 카테고리와 하위 카테고리의 글을 함께
 * 보여준다 — 상위를 눌렀을 때 하위 글이 사라지면 목록이 비어 보이기 때문이다.
 */
/** 상위 카테고리를 열면 그 아래 하위 카테고리의 글까지 함께 잡는다. */
function categoryWhere(categorySlug: string) {
  return {
    OR: [
      { category: { slug: categorySlug } },
      { category: { parent: { slug: categorySlug } } },
    ],
  };
}

/** 카테고리 목록의 한 페이지. 전체 목록과 같은 5개 단위다. */
export async function loadStudyCategoryPage(
  categorySlug: string,
  page: number
): Promise<{ posts: PostSummary[]; pagination: PaginationMeta }> {
  const where = { published: true, blog: STUDY, ...categoryWhere(categorySlug) };
  try {
    const [rows, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: postSummarySelect,
        skip: (page - 1) * STUDY_PER_PAGE,
        take: STUDY_PER_PAGE,
      }),
      prisma.post.count({ where }),
    ]);
    return {
      posts: rows.map(serialize),
      pagination: {
        page,
        limit: STUDY_PER_PAGE,
        total,
        totalPages: Math.max(1, Math.ceil(total / STUDY_PER_PAGE)),
      },
    };
  } catch (err) {
    console.error("[study] 카테고리 목록을 불러오지 못했습니다:", err);
    return { posts: [], pagination: { page, limit: STUDY_PER_PAGE, total: 0, totalPages: 1 } };
  }
}

export async function loadStudyPosts(categorySlug?: string): Promise<PostSummary[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        blog: STUDY,
        ...(categorySlug
          ? {
              OR: [
                { category: { slug: categorySlug } },
                { category: { parent: { slug: categorySlug } } },
              ],
            }
          : {}),
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


/** 공부 블로그 목록 한 페이지. 카테고리 화면은 기술 블로그와 같이 나누지 않는다. */
export async function loadStudyPage(
  page: number
): Promise<{ posts: PostSummary[]; pagination: PaginationMeta }> {
  try {
    const where = { published: true, blog: STUDY };
    const [rows, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: postSummarySelect,
        skip: (page - 1) * STUDY_PER_PAGE,
        take: STUDY_PER_PAGE,
      }),
      prisma.post.count({ where }),
    ]);
    return {
      posts: rows.map(serialize),
      pagination: {
        page,
        limit: STUDY_PER_PAGE,
        total,
        totalPages: Math.max(1, Math.ceil(total / STUDY_PER_PAGE)),
      },
    };
  } catch (err) {
    console.error("[study] 목록을 불러오지 못했습니다:", err);
    return { posts: [], pagination: { page, limit: STUDY_PER_PAGE, total: 0, totalPages: 1 } };
  }
}

