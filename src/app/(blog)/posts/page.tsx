import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import type {
  PostSummary,
  PaginationMeta,
  PostsExtras,
  CommentPreview,
} from "@/lib/types";
import { postSummarySelect } from "@/lib/queries";
import { fetchRecentComments } from "@/lib/giscus";
import type { RawComment } from "@/lib/giscus";
import PostsClient from "./PostsClient";

export const revalidate = 60;

const POSTS_PER_PAGE = 10;
const EMPTY_EXTRAS: PostsExtras = {
  featured: [],
  popular: [],
  guestbook: [],
  comments: [],
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
 * 추천·인기·방명록·댓글 섹션. 첫 화면에서만 보여주고, 실패해도 목록 자체는
 * 뜨도록 빈 값으로 떨어뜨린다. 인기 글은 PageView 집계를 실제로 읽는다.
 */
async function loadExtras(): Promise<PostsExtras> {
  try {
    const [featuredRaw, viewGroups, guestbookRaw, rawComments] = await Promise.all([
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
      prisma.guestbookEntry.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, nickname: true, message: true, emoji: true, createdAt: true },
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
      guestbook: guestbookRaw.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
      })),
      comments: await resolveComments(rawComments),
    };
  } catch (err) {
    console.error("[PostsPage] Failed to load extras:", err);
    return EMPTY_EXTRAS;
  }
}

type Props = {
  searchParams: { page?: string; q?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  if (searchParams.q) {
    return { title: `'${searchParams.q}' 검색 결과` };
  }
  return { title: "전체 글" };
}

export default async function PostsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const q = searchParams.q?.trim() || null;
  const skip = (page - 1) * POSTS_PER_PAGE;

  let posts: PostSummary[] = [];
  let pagination: PaginationMeta = { page, limit: POSTS_PER_PAGE, total: 0, totalPages: 1 };

  // 검색 결과나 2페이지 이후에서는 부가 섹션이 방해만 된다.
  const showExtras = !q && page === 1;
  const extras = showExtras ? await loadExtras() : EMPTY_EXTRAS;

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
        skip,
        take: POSTS_PER_PAGE,
      }),
      prisma.post.count({ where }),
    ]);

    posts = rawPosts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      category: p.category
        ? {
            ...p.category,
            createdAt: p.category.createdAt.toISOString(),
            updatedAt: p.category.updatedAt.toISOString(),
          }
        : null,
    }));

    pagination = {
      page,
      limit: POSTS_PER_PAGE,
      total,
      totalPages: Math.ceil(total / POSTS_PER_PAGE),
    };
  } catch (err) {
    console.error("[PostsPage] Failed to fetch posts:", err);
  }

  return (
    <PostsClient
      posts={posts}
      pagination={pagination}
      query={q}
      extras={extras}
    />
  );
}
