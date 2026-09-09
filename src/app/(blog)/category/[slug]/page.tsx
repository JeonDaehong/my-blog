import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryClient from "./CategoryClient";
import { postCardSelect } from "@/lib/queries";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } });
    return categories.map((category) => ({ slug: category.slug }));
  } catch (err) {
    console.error("[generateStaticParams] 카테고리 조회 실패:", err);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return { title: category.name };
}

export default async function CategoryPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: postCardSelect,
      },
    },
  });

  if (!category) notFound();

  return <CategoryClient category={JSON.parse(JSON.stringify(category))} />;
}
