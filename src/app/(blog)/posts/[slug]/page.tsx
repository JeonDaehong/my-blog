import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PostDetail } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";
import PostClient from "./PostClient";

export const revalidate = 60;

type Props = { params: { slug: string } };

// 빌드 시점에 기존 글을 미리 렌더해 Full Route Cache에 태운다.
// 이게 없으면 revalidate가 무시되고 매 요청이 DB까지 내려간다.
// 새로 쓴 글은 dynamicParams 기본값(true) 덕에 최초 1회만 온디맨드로 렌더된다.
export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, blog: "tech" },
      select: { slug: true },
    });
    return posts.map((post) => ({ slug: post.slug }));
  } catch (err) {
    // DB가 잠깐 불안정해도 배포는 막지 않는다. 프리렌더만 건너뛰고
    // 모든 글이 온디맨드로 렌더된 뒤 캐시에 올라간다.
    console.error("[generateStaticParams] 글 목록 조회 실패:", err);
    return [];
  }
}

// generateMetadata와 페이지 본문이 같은 글을 두 번 조회하지 않도록 렌더 단위로 캐싱한다.
const getPost = cache((slug: string) =>
  prisma.post.findFirst({ where: { slug, published: true, blog: "tech" }, include: { category: true } })
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      images: post.coverImage ? [post.coverImage] : [],
    },
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
  };
}

type PostRecord = NonNullable<Awaited<ReturnType<typeof getPost>>>;

function JsonLd({ post }: { post: PostRecord }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.createdAt.toISOString(),
    dateModified: (post.updatedAt || post.createdAt).toISOString(),
    author: { "@type": "Person", name: "Daehong Jeon" },
    ...(post.coverImage && { image: post.coverImage }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** 본문(content/contentEn)은 서버에서 이미 HTML로 렌더하므로 클라이언트로 보내지 않는다. */
function toPostDetail(post: PostRecord): PostDetail {
  return {
    id: post.id,
    title: post.title,
    titleEn: post.titleEn,
    slug: post.slug,
    excerpt: post.excerpt,
    excerptEn: post.excerptEn,
    coverImage: post.coverImage,
    createdAt: post.createdAt.toISOString(),
    hasContentEn: Boolean(post.contentEn),
    category: post.category
      ? {
          ...post.category,
          createdAt: post.category.createdAt.toISOString(),
          updatedAt: post.category.updatedAt.toISOString(),
        }
      : null,
  };
}

export default async function PostPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const post = await getPost(slug);

  if (!post) notFound();

  const [rendered, [prevPost, nextPost]] = await Promise.all([
    renderMarkdown(post.content),
    Promise.all([
      prisma.post.findFirst({
        where: { published: true, blog: "tech", createdAt: { lt: post.createdAt } },
        orderBy: { createdAt: "desc" },
        select: { slug: true, title: true },
      }),
      prisma.post.findFirst({
        where: { published: true, blog: "tech", createdAt: { gt: post.createdAt } },
        orderBy: { createdAt: "asc" },
        select: { slug: true, title: true },
      }),
    ]),
  ]);

  return (
    <>
      <JsonLd post={post} />
      <PostClient
        post={toPostDetail(post)}
        rendered={rendered}
        prevPost={prevPost ? { slug: prevPost.slug, title: prevPost.title } : null}
        nextPost={nextPost ? { slug: nextPost.slug, title: nextPost.title } : null}
      />
    </>
  );
}
