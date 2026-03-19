import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let recentPosts: any[] = [];
  let categories: any[] = [];
  try {
    recentPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    });
    categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: { where: { published: true } } } } },
    });
  } catch {}

  return <HomeClient posts={JSON.parse(JSON.stringify(recentPosts))} categories={JSON.parse(JSON.stringify(categories))} />;
}
