import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PostClient from "./PostClient";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
    include: { category: true },
  });

  if (!post) notFound();

  return <PostClient post={JSON.parse(JSON.stringify(post))} />;
}
