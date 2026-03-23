import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://my-blog.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/wjseoghd/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
