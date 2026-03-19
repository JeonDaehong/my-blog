import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://my-blog.vercel.app";

  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: `${baseUrl}/posts`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
      ...posts.map((post) => ({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...categories.map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ];
  }
}
