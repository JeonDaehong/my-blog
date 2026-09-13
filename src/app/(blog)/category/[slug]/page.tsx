import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryClient from "./CategoryClient";
import { loadCategoryPage } from "@/lib/posts-page";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ where: { blog: "tech" }, select: { slug: true } });
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
  const data = await loadCategoryPage(slug, 1);
  if (!data) notFound();

  return (
    <CategoryClient
      category={JSON.parse(JSON.stringify(data.category))}
      pagination={data.pagination}
    />
  );
}
