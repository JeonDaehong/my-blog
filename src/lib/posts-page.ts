import { prisma } from "@/lib/prisma";
import { postSummarySelect } from "@/lib/queries";
import { fetchRecentComments, type RawComment } from "@/lib/giscus";
import { getRecentCards } from "@/lib/card-news";
import type {
  PostSummary,
  PaginationMeta,
  PostsExtras,
  CommentPreview,
} from "@/lib/types";

export const POSTS_PER_PAGE = 10;

export const EMPTY_EXTRAS: PostsExtras = {
  featured: [],
  popular: [],
  comments: [],
  cardNews: [],
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

/**
 * Giscus는 pathname으로 토론을 만들기 때문에 제목이 "posts/some-slug" 같은
 * 경로다. 그대로 노출하면 읽기 나쁘니 실제 글 제목으로 바꾸고, 링크도
 * GitHub이 아니라 사이트 안쪽을 가리키게 한다.
 */
async function resolveComments(raw: RawComment[]): Promise<CommentPreview[]> {
  if (raw.length === 0) return [];

  const slugs = raw
    .filter((c) => c.pathname.startsWith("posts/"))
    .map((c) => decodeURIComponent(c.pathname.slice("posts/".length)));

  const titleBySlug = new Map<string, string>();
  if (slugs.length > 0) {
    const posts = await prisma.post.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, title: true },
    });
    for (const post of posts) titleBySlug.set(post.slug, post.title);
  }

  return raw.map((comment) => {
    if (comment.pathname.startsWith("posts/")) {
      const slug = decodeURIComponent(comment.pathname.slice("posts/".length));
      return {
        ...comment,
        href: `/posts/${slug}`,
        label: titleBySlug.get(slug) ?? slug,
      };
    }
    if (comment.pathname === "guestbook") {
      return { ...comment, href: "/guestbook", label: "방명록" };
    }
    return {
      ...comment,
      href: `/${comment.pathname}`,
      label: comment.pathname,
    };
  });
}

/**
 * 추천·인기·댓글·카드 섹션. 목록 첫 화면에서만 쓰고, 실패해도 목록 자체는
 * 뜨도록 빈 값으로 떨어뜨린다. 인기 글은 PageView 집계를 실제로 읽는다.
 */
export async function loadExtras(): Promise<PostsExtras> {
  try {
    const [featuredRaw, viewGroups, rawComments] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: postSummarySelect,
        take: 5,
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 20,
      }),
      fetchRecentComments(3),
    ]);

    const POST_PATH_PREFIX = "/posts/";
    const viewsBySlug = new Map<string, number>();
    for (const group of viewGroups) {
      if (!group.path.startsWith(POST_PATH_PREFIX)) continue;
      const slug = decodeURIComponent(group.path.slice(POST_PATH_PREFIX.length));
      if (slug) viewsBySlug.set(slug, group._count.path);
    }

    const popularPosts = viewsBySlug.size
      ? await prisma.post.findMany({
          where: { published: true, slug: { in: [...viewsBySlug.keys()] } },
          select: { slug: true, title: true, titleEn: true },
        })
      : [];

    return {
      featured: featuredRaw.map(serialize),
      popular: popularPosts
        .map((post) => ({ ...post, views: viewsBySlug.get(post.slug) ?? 0 }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 3),
      comments: await resolveComments(rawComments),
      cardNews: getRecentCards(3),
    };
  } catch (err) {
    console.error("[posts] 부가 섹션을 불러오지 못했습니다:", err);
    return EMPTY_EXTRAS;
  }
}

export type PostsPageData = {
  posts: PostSummary[];
  pagination: PaginationMeta;
};

function emptyPage(page: number): PostsPageData {
  return {
    posts: [],
    pagination: { page, limit: POSTS_PER_PAGE, total: 0, totalPages: 1 },
  };
}

/** 목록 한 페이지. q가 있으면 검색 결과, 없으면 전체 글이다. */
export async function loadPosts(page: number, q?: string | null): Promise<PostsPageData> {
  try {
    const searchFilter = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { titleEn: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
            { excerptEn: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const where = { published: true, ...searchFilter };

    const [rawPosts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: postSummarySelect,
        skip: (page - 1) * POSTS_PER_PAGE,
        take: POSTS_PER_PAGE,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts: rawPosts.map(serialize),
      pagination: {
        page,
        limit: POSTS_PER_PAGE,
        total,
        totalPages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
      },
    };
  } catch (err) {
    console.error("[posts] 목록을 불러오지 못했습니다:", err);
    return emptyPage(page);
  }
}

