import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import type { PostSummary, PaginationMeta } from "@/lib/types";
import PostsClient from "./PostsClient";

export const revalidate = 60;

const POSTS_PER_PAGE = 10;

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
        include: { category: true },
        skip,
        take: POSTS_PER_PAGE,
      }),
      prisma.post.count({ where }),
    ]);

    posts = rawPosts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
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

  return <PostsClient posts={posts} pagination={pagination} query={q} />;
}
