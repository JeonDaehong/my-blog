import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PostWithCategory } from "@/lib/types";
import PostClient from "./PostClient";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const post = await prisma.post.findUnique({ where: { slug } });
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

function JsonLd({ post }: { post: PostWithCategory }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
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

function serializePost(post: Awaited<ReturnType<typeof prisma.post.findUnique>> & { category: Awaited<ReturnType<typeof prisma.category.findUnique>> | null }): PostWithCategory {
  return {
    ...post!,
    createdAt: post!.createdAt.toISOString(),
    updatedAt: post!.updatedAt.toISOString(),
    category: post!.category
      ? {
          ...post!.category,
          createdAt: post!.category.createdAt.toISOString(),
          updatedAt: post!.category.updatedAt.toISOString(),
        }
      : null,
  };
}

export default async function PostPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: { category: true },
  });

  if (!post) notFound();

  const serializedPost = serializePost(post);

  const [prevPost, nextPost] = await Promise.all([
    prisma.post.findFirst({
      where: { published: true, createdAt: { lt: post.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.post.findFirst({
      where: { published: true, createdAt: { gt: post.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  return (
    <>
      <JsonLd post={serializedPost} />
      <PostClient
        post={serializedPost}
        prevPost={prevPost ? { slug: prevPost.slug, title: prevPost.title } : null}
        nextPost={nextPost ? { slug: nextPost.slug, title: nextPost.title } : null}
      />
    </>
  );
}
