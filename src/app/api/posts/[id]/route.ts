import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { translateToEnglish } from "@/lib/translate";

type Context = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Context) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "제목과 내용은 필수입니다" }, { status: 400 });
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다" }, { status: 404 });
  }

  // Auto-translate if English fields are empty
  const titleEn = body.titleEn || await translateToEnglish(body.title);
  const contentEn = body.contentEn || await translateToEnglish(body.content);
  const excerptEn = body.excerptEn || (body.excerpt ? await translateToEnglish(body.excerpt) : null);

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: body.title,
      titleEn: titleEn || null,
      content: body.content,
      contentEn: contentEn || null,
      excerpt: body.excerpt || null,
      excerptEn: excerptEn || null,
      coverImage: body.coverImage || null,
      published: body.published,
      categoryId: body.categoryId || null,
    },
    include: { category: true },
  });

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath(`/posts/${post.slug}`);
  if (post.category) revalidatePath(`/category/${post.category.slug}`);

  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id: params.id } });

  revalidatePath("/");
  revalidatePath("/posts");
  if (post?.slug) revalidatePath(`/posts/${post.slug}`);
  if (post?.category) revalidatePath(`/category/${post.category.slug}`);

  return NextResponse.json({ success: true });
}
