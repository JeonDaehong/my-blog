import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryClient from "./CategoryClient";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return {};
  return { title: category.name };
}

export default async function CategoryPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      posts: { where: { published: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!category) notFound();

  return <CategoryClient category={JSON.parse(JSON.stringify(category))} />;
}
