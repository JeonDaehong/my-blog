import { prisma } from "@/lib/prisma";
import BlogLayoutClient from "./BlogLayoutClient";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: { where: { published: true } } } } },
    });
  } catch {}

  return <BlogLayoutClient categories={JSON.parse(JSON.stringify(categories))}>{children}</BlogLayoutClient>;
}
