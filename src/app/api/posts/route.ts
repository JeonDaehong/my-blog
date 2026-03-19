import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { translateToEnglish } from "@/lib/translate";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const slug = body.slug || body.title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80) + "-" + Date.now().toString(36);

  // Auto-translate if English fields are empty
  const titleEn = body.titleEn || await translateToEnglish(body.title);
  const contentEn = body.contentEn || await translateToEnglish(body.content);
  const excerptEn = body.excerptEn || (body.excerpt ? await translateToEnglish(body.excerpt) : null);

  const post = await prisma.post.create({
    data: {
      title: body.title,
      titleEn: titleEn || null,
      slug,
      content: body.content,
      contentEn: contentEn || null,
      excerpt: body.excerpt || null,
      excerptEn: excerptEn || null,
      coverImage: body.coverImage || null,
      published: body.published ?? false,
      categoryId: body.categoryId || null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
