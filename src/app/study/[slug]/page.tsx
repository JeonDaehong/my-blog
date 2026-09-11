import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";
import StudyPostClient from "@/components/StudyPostClient";
import { STUDY } from "@/lib/study";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, blog: STUDY },
      select: { slug: true },
    });
    return posts.map((post) => ({ slug: post.slug }));
  } catch (err) {
    console.error("[study/slug] 글 목록 조회 실패:", err);
    return [];
  }
}

const getPost = cache((slug: string) =>
  prisma.post.findFirst({
    where: { slug, published: true, blog: STUDY },
    include: { category: true },
  })
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(decodeURIComponent(params.slug));
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
    alternates: { canonical: `/study/${post.slug}` },
  };
}

export default async function StudyPostPage({ params }: Props) {
  const post = await getPost(decodeURIComponent(params.slug));
  if (!post) notFound();

  const rendered = await renderMarkdown(post.content);

  return (
    <StudyPostClient
      post={{
        slug: post.slug,
        title: post.title,
        titleEn: post.titleEn,
        coverImage: post.coverImage,
        createdAt: post.createdAt.toISOString(),
        category: post.category
          ? {
              name: post.category.name,
              nameEn: post.category.nameEn,
              slug: post.category.slug,
            }
          : null,
      }}
      html={rendered.html}
    />
  );
}
