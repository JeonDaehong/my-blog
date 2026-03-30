import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { translateToEnglish } from "@/lib/translate";

export async function GET(req: NextRequest) {
  const isAdmin = await isAuthenticated();
  const posts = await prisma.post.findMany({
    where: isAdmin ? {} : { published: true },
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

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "제목과 내용은 필수입니다" }, { status: 400 });
  }

  const baseSlug = body.slug || body.title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80) + "-" + Date.now().toString(36);

  // 슬러그 중복 확인
  const existing = await prisma.post.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

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

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/category", "page");

  return NextResponse.json(post, { status: 201 });
}
