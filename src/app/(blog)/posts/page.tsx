import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import PostsClient from "./PostsClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "전체 글" };

export default async function PostsPage() {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
  } catch {}

  return <PostsClient posts={JSON.parse(JSON.stringify(posts))} />;
}
